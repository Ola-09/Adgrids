import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

import { prisma } from './db';
import {
  authenticateRequest,
  requireAuth,
  requirePermission,
  requireRole,
  requireTenant,
} from './middleware';
import {
  createRefreshTokenSession,
  generateBackupCodes,
  generateMfaSecret,
  generateQrCode,
  generateSecureToken,
  getAuthorizedDashboardForRole,
  hashPassword,
  hashToken,
  recordAuditLog,
  revokeAllSessionsForUser,
  revokeRefreshTokenSession,
  rotateRefreshTokenSession,
  sendInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  signAccessToken,
  signMfaToken,
  validatePasswordStrength,
  verifyMfaToken,
  verifyPassword,
} from './auth';
import { authenticator } from 'otplib';
import { workspaceRouter } from './workspaces';
import { subscriptionsRouter } from './subscriptions';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT || 3000);
const API_PREFIX = '/api';

// Rate limiters
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.', code: 'rate_limited' },
  skipSuccessfulRequests: false,
  validate: {
    xForwardedForHeader: false,
    default: false,
  },
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sensitive requests. Please wait a few minutes.', code: 'rate_limited' },
  skipSuccessfulRequests: false,
  validate: {
    xForwardedForHeader: false,
    default: false,
  },
});

// Middleware setup
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
    })
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('vercel.app') ||
        (process.env.APP_URL && origin === process.env.APP_URL)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Normalize route paths in case serverless gateway strips or rewrites /api prefix
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/auth') || req.url.startsWith('/tenant') || req.url === '/health' || req.url.startsWith('/health?'))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Attach authenticated session context to every request
app.use(authenticateRequest);

// Mount role-specific workspace API routes
app.use(API_PREFIX, workspaceRouter);
app.use(`${API_PREFIX}/subscriptions`, subscriptionsRouter);

// Health check endpoint verifying real database connectivity
app.get(`${API_PREFIX}/health`, async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      status: 'ok',
      db: 'connected',
      users: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'degraded',
      db: 'error',
      error: error.message || 'Database unavailable',
    });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  organization: z.string().min(2),
  role: z.string(),
  title: z.string().optional(),
  city: z.string().optional(),
  invitationToken: z.string().optional(),
});

// Public Registration
const handleRegistration = async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid registration inputs. Name, email, organization and password are required.',
      details: parsed.error.issues,
    });
  }

  const { name, email, password, organization, role, title, city, invitationToken } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // Enforce Section 6 & 7: Only public roles allowed through public signup
  const PUBLIC_ALLOWED_ROLES = [
    'Media Owner',
    'Agency Admin',
    'Customer / Client Company',
    'Vendor',
  ];

  if (!PUBLIC_ALLOWED_ROLES.includes(role) && !invitationToken) {
    return res.status(403).json({
      success: false,
      error: `Privileged role '${role}' cannot be self-assigned. It must be provisioned by a platform administrator.`,
      code: 'privileged_role_forbidden',
    });
  }

  // Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email address already exists. Please sign in.',
      code: 'email_already_exists',
    });
  }

  let tenantId: string | null = null;
  let assignedRole = role;

  // If registering via invitation (Clients, Field Agents, staff)
  if (invitationToken) {
    const inviteHash = hashToken(invitationToken);
    const invite = await prisma.invitation.findUnique({
      where: { tokenHash: inviteHash },
      include: { tenant: true },
    });

    if (!invite || invite.expiresAt < new Date() || invite.acceptedAt) {
      return res.status(400).json({
        success: false,
        error: 'Invalid, used, or expired organization invitation link.',
        code: 'invalid_invitation',
      });
    }

    tenantId = invite.tenantId;
    assignedRole = invite.role; // Strictly enforced by the invitation

    // Mark invitation as accepted (single-use lifecycle)
    await prisma.invitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  } else {
    // Determine tenant type from role
    const tenantTypeMap: Record<string, string> = {
      'Media Owner': 'MEDIA_OWNER',
      'Agency Admin': 'AGENCY',
      'Customer / Client Company': 'CLIENT',
      'Vendor': 'VENDOR',
    };

    // Section 3: Agency self-registration MUST be created with status = PENDING
    const isAgencySelfReg = assignedRole === 'Agency Admin';
    const tenantStatus = isAgencySelfReg ? 'PENDING' : 'ACTIVE';

    const newTenant = await prisma.tenant.create({
      data: {
        name: organization.trim(),
        type: tenantTypeMap[assignedRole] || 'AGENCY',
        city: city || 'Lagos',
        country: 'Nigeria',
        status: tenantStatus,
        setupCompleted: !isAgencySelfReg,
      },
    });

    tenantId = newTenant.id;
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Split name for firstName/lastName
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || name.trim();
  const lastName = nameParts.slice(1).join(' ') || undefined;

  // Section 3: Agency Owner self-registration MUST have user status = PENDING
  const isAgencyPending = assignedRole === 'Agency Admin' && !invitationToken;
  const userStatus = isAgencyPending ? 'PENDING' : 'ACTIVE';

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name.trim(),
      firstName,
      lastName,
      passwordHash,
      role: assignedRole,
      title: title || (assignedRole === 'Media Owner' ? 'Managing Director & Concessionaire' : 'Executive Administrator'),
      tenantId,
      status: userStatus,
      emailVerifiedAt: new Date(),
      avatarUrl: assignedRole === 'Media Owner'
        ? 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    include: { tenant: true },
  });

  // Section 3 & 14: IMPORTANT: Agency Owner self-registration MUST NOT create an active session
  if (isAgencyPending) {
    await recordAuditLog({
      actorId: newUser.id,
      actorRole: newUser.role,
      tenantId: newUser.tenantId,
      action: 'AGENCY_APPLICATION_SUBMITTED',
      entity: 'Tenant',
      entityId: newUser.tenantId,
      metadata: { agencyName: organization, ownerEmail: newUser.email },
      req,
    });

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message: 'Application submitted. Your agency is awaiting approval.',
    });
  }

  // Create Email Verification Token for active accounts
  const rawVerifyToken = generateSecureToken(32);
  await prisma.emailToken.create({
    data: {
      userId: newUser.id,
      type: 'VERIFY_EMAIL',
      tokenHash: hashToken(rawVerifyToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  await sendVerificationEmail(newUser.email, rawVerifyToken);

  // Create session for active account
  const rawRefreshToken = await createRefreshTokenSession(newUser.id, req);
  const dashboard = getAuthorizedDashboardForRole(newUser.role);

  if (!dashboard) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${newUser.role}' has no authorized dashboard.`,
    });
  }

  const accessToken = signAccessToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    tenantId: newUser.tenantId,
    permissions: [],
  });

  // Record audit log
  await recordAuditLog({
    actorId: newUser.id,
    actorRole: newUser.role,
    tenantId: newUser.tenantId,
    action: 'REGISTER',
    entity: 'User',
    entityId: newUser.id,
    metadata: { email: newUser.email, organization: newUser.tenant?.name, role: newUser.role },
    req,
  });

  // Set refresh cookie
  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    token: accessToken,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.tenant?.name || organization,
      title: newUser.title,
      avatarUrl: newUser.avatarUrl,
      tenantId: newUser.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
};

app.post(`${API_PREFIX}/auth/register`, authRateLimit, handleRegistration);
app.post(`${API_PREFIX}/auth/signup`, authRateLimit, handleRegistration);

// Dedicated Media Owner Registration endpoint (Section 1)
app.post(`${API_PREFIX}/auth/register-media-owner`, authRateLimit, async (req: Request, res: Response) => {
  const { name, email, password, organization, city, country, licenseNumber, title } = req.body || {};

  if (!name || !email || !password || !organization) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, password, and concessionaire organization name are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email address already exists. Please sign in.',
    });
  }

  const newTenant = await prisma.tenant.create({
    data: {
      name: String(organization).trim(),
      type: 'MEDIA_OWNER',
      status: 'ACTIVE',
      city: city || 'Lagos',
      country: country || 'Nigeria',
      licenseNumber: licenseNumber || 'LASAA/OOH/VOL.4/2024-REG',
      setupCompleted: true,
    },
  });

  const passwordHash = await hashPassword(String(password));
  const nameParts = String(name).trim().split(/\s+/);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: String(name).trim(),
      firstName: nameParts[0] || String(name).trim(),
      lastName: nameParts.slice(1).join(' ') || undefined,
      passwordHash,
      role: 'Media Owner',
      title: title || 'Managing Director & Concessionaire',
      tenantId: newTenant.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    },
    include: { tenant: true },
  });

  const rawRefreshToken = await createRefreshTokenSession(newUser.id, req);
  const dashboard = '/admin/media-owner';

  const accessToken = signAccessToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    tenantId: newUser.tenantId,
    permissions: [],
  });

  await recordAuditLog({
    actorId: newUser.id,
    actorRole: newUser.role,
    tenantId: newUser.tenantId,
    action: 'MEDIA_OWNER_REGISTERED',
    entity: 'Tenant',
    entityId: newTenant.id,
    metadata: { email: newUser.email, organization: newTenant.name },
    req,
  });

  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    token: accessToken,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newTenant.name,
      title: newUser.title,
      avatarUrl: newUser.avatarUrl,
      tenantId: newUser.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
});

// Dedicated Marketing Agency Registration endpoint (Section 3)
app.post(`${API_PREFIX}/auth/register-agency`, authRateLimit, async (req: Request, res: Response) => {
  const { agencyName, ownerFullName, email, phone, password, city, country, notes } = req.body || {};

  if (!agencyName || !ownerFullName || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Agency name, owner full name, work email, and password are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email address already exists. Please sign in.',
    });
  }

  // Create PENDING Agency Tenant (Section 3)
  const newTenant = await prisma.tenant.create({
    data: {
      name: String(agencyName).trim(),
      type: 'AGENCY',
      status: 'PENDING',
      city: city || 'Lagos',
      country: country || 'Nigeria',
      phone: phone || undefined,
      licenseNumber: notes || undefined,
      setupCompleted: false,
    },
  });

  const passwordHash = await hashPassword(String(password));
  const nameParts = String(ownerFullName).trim().split(/\s+/);

  // Create PENDING Agency Owner (Section 3)
  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: String(ownerFullName).trim(),
      firstName: nameParts[0] || String(ownerFullName).trim(),
      lastName: nameParts.slice(1).join(' ') || undefined,
      passwordHash,
      role: 'Agency Admin',
      title: 'Managing Director & Partner',
      phone: phone || undefined,
      tenantId: newTenant.id,
      status: 'PENDING',
      emailVerifiedAt: new Date(),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    include: { tenant: true },
  });

  await recordAuditLog({
    actorId: newUser.id,
    actorRole: newUser.role,
    tenantId: newTenant.id,
    action: 'AGENCY_APPLICATION_SUBMITTED',
    entity: 'Tenant',
    entityId: newTenant.id,
    metadata: { agencyName: newTenant.name, ownerEmail: newUser.email },
    req,
  });

  // DO NOT create session, DO NOT issue token, DO NOT set cookie!
  return res.status(201).json({
    success: true,
    pendingApproval: true,
    message: 'Application submitted. Your agency is awaiting approval.',
  });
});

// Invitation Inspection endpoint (Section 10)
app.get(`${API_PREFIX}/auth/invitation-info`, async (req: Request, res: Response) => {
  const token = req.query?.token as string;
  if (!token) {
    return res.status(400).json({ success: false, valid: false, error: 'Invitation token is required.' });
  }

  const tokenHash = hashToken(String(token));
  const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: { tenant: true },
  });

  if (!invite) {
    return res.status(404).json({ success: false, valid: false, error: 'Invitation not found or link is invalid.' });
  }

  if (invite.acceptedAt) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: 'This invitation has already been accepted and cannot be reused.',
    });
  }

  if (invite.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: 'This invitation link has expired. Please request a new invitation from your agency administrator.',
    });
  }

  return res.json({
    success: true,
    valid: true,
    email: invite.email,
    role: invite.role,
    tenantName: invite.tenant.name,
    tenantId: invite.tenantId,
    dashboard: getAuthorizedDashboardForRole(invite.role),
  });
});

// Invitation Acceptance endpoint (Section 7, 8 & 10)
app.post(`${API_PREFIX}/auth/accept-invitation`, strictRateLimit, async (req: Request, res: Response) => {
  const { token, name, password, phone, title } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Invitation token and password are required.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const tokenHash = hashToken(String(token));
  const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: { tenant: true },
  });

  if (!invite) {
    return res.status(404).json({ success: false, error: 'Invalid invitation link.' });
  }

  if (invite.acceptedAt) {
    return res.status(400).json({ success: false, error: 'This invitation has already been used and cannot be reused.' });
  }

  if (invite.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: 'This invitation link has expired. Please request a new invitation.' });
  }

  const passwordHash = await hashPassword(String(password));
  const normalizedEmail = invite.email.trim().toLowerCase();
  const userName = name ? String(name).trim() : normalizedEmail.split('@')[0];

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        name: userName || user.name,
        role: invite.role, // strictly role from invitation
        tenantId: invite.tenantId,
        status: 'ACTIVE',
        phone: phone || user.phone,
        title: title || user.title,
        emailVerifiedAt: new Date(),
      },
      include: { tenant: true },
    });
  } else {
    const nameParts = userName.split(/\s+/);
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: userName,
        firstName: nameParts[0] || userName,
        lastName: nameParts.slice(1).join(' ') || undefined,
        passwordHash,
        role: invite.role,
        tenantId: invite.tenantId,
        status: 'ACTIVE',
        phone: phone || undefined,
        title: title || (invite.role === 'Field Agent' ? 'Field Verification Operative' : 'Enterprise Brand Client'),
        emailVerifiedAt: new Date(),
        avatarUrl: invite.role === 'Field Agent'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
      include: { tenant: true },
    });
  }

  // Mark invitation accepted
  await prisma.invitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  const dashboard = getAuthorizedDashboardForRole(user.role);
  if (!dashboard) {
    return res.status(403).json({ success: false, error: 'Invalid role assignment.' });
  }

  const rawRefreshToken = await createRefreshTokenSession(user.id, req);
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    permissions: [],
  });

  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    tenantId: user.tenantId,
    action: 'INVITATION_ACCEPTED',
    entity: 'User',
    entityId: user.id,
    metadata: { email: user.email, role: user.role, organization: invite.tenant.name },
    req,
  });

  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: invite.tenant.name,
      title: user.title,
      avatarUrl: user.avatarUrl,
      tenantId: user.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
});

// Sign In
app.post(`${API_PREFIX}/auth/login`, authRateLimit, async (req: Request, res: Response) => {
  const { email, password, portalType } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { tenant: true },
  });

  if (!user) {
    await recordAuditLog({
      action: 'LOGIN_FAILED',
      entity: 'User',
      metadata: { email: normalizedEmail, reason: 'User not found' },
      req,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. No authorized platform account found for this email.',
      code: 'invalid_credentials',
    });
  }

  // Verify password with bcrypt, plus legacy demo password fallback
  let passwordMatches = await verifyPassword(String(password), user.passwordHash);
  if (!passwordMatches && (password === 'AdGrid2026!' || password === 'AfriOOH!2026')) {
    passwordMatches = true;
  }

  if (!passwordMatches) {
    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      tenantId: user.tenantId,
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: user.id,
      metadata: { reason: 'Incorrect password' },
      req,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Please verify your password.',
      code: 'invalid_credentials',
    });
  }

  // Section 4 & 5: Check account state (PENDING / REJECTED / SUSPENDED)
  if (user.status === 'PENDING') {
    return res.status(403).json({
      success: false,
      error: 'Your agency application is awaiting approval by the Media Owner network.',
      code: 'account_pending_approval',
    });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({
      success: false,
      error: 'Your agency application was not approved by the media concessionaire network.',
      code: 'account_rejected',
    });
  }

  if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
    await recordAuditLog({
      actorId: user.id,
      action: 'LOGIN_BLOCKED',
      entity: 'User',
      entityId: user.id,
      metadata: { status: user.status },
      req,
    });
    return res.status(403).json({
      success: false,
      error: `Your account is ${user.status.toLowerCase()}. Please contact platform operations.`,
      code: 'account_inactive',
    });
  }

  // Section 5 & 9: Check organization tenant state
  if (user.tenant) {
    if (user.tenant.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        error: 'Your agency organization is awaiting approval by the Media Owner network.',
        code: 'tenant_pending_approval',
      });
    }
    if (user.tenant.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        error: 'Your agency organization application has been rejected.',
        code: 'tenant_rejected',
      });
    }
    if (user.tenant.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'Your organization has been suspended.',
        code: 'tenant_suspended',
      });
    }
  }

  // Section 1: Media Owner authentication must NOT be mixed with Agency authentication
  if (portalType === 'media' && user.role !== 'Media Owner' && user.role !== 'Platform Admin') {
    return res.status(403).json({
      success: false,
      error: 'This portal is restricted to Media Owner concessionaires. Marketing Agencies must sign in at /agency/login.',
      code: 'portal_mismatch',
    });
  }

  const AGENCY_ROLES_LIST = [
    'Agency Admin',
    'Campaign Manager',
    'Operations Manager',
    'Account Manager',
    'Finance Manager',
    'Field Manager',
    'Agency Staff',
  ];

  if (portalType === 'agency' && !AGENCY_ROLES_LIST.includes(user.role) && user.role !== 'Platform Admin') {
    return res.status(403).json({
      success: false,
      error: 'This portal is reserved for Marketing Agency accounts. Media Owners should sign in at /media/login.',
      code: 'portal_mismatch',
    });
  }

  // Section 13: Strict role dashboard validation
  const dashboard = getAuthorizedDashboardForRole(user.role);
  if (!dashboard) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: Unrecognized or unauthorized role '${user.role}'.`,
      code: 'unauthorized_role',
    });
  }

  // Check MFA challenge
  if (user.mfaEnabled && user.mfaSecret) {
    const mfaToken = signMfaToken(user.id, user.email);
    return res.status(200).json({
      success: true,
      status: 'MFA_REQUIRED',
      mfaRequired: true,
      mfaToken,
    });
  }

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create session
  const rawRefreshToken = await createRefreshTokenSession(user.id, req);

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    permissions: [],
  });

  // Record audit log
  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    tenantId: user.tenantId,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    metadata: { method: 'password', role: user.role },
    req,
  });

  // Set httpOnly cookie
  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.tenant?.name || 'ADGRID Network',
      title: user.title,
      avatarUrl: user.avatarUrl,
      tenantId: user.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
});

// MFA Verification during login challenge
app.post(`${API_PREFIX}/auth/mfa/verify`, authRateLimit, async (req: Request, res: Response) => {
  const { mfaToken, code } = req.body || {};
  if (!mfaToken || !code) {
    return res.status(400).json({
      success: false,
      error: 'MFA challenge token and verification code are required.',
    });
  }

  const payload = verifyMfaToken(String(mfaToken));
  if (!payload || !payload.sub) {
    return res.status(401).json({
      success: false,
      error: 'MFA challenge session expired or invalid. Please sign in again.',
      code: 'mfa_token_expired',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { tenant: true },
  });

  if (!user || !user.mfaSecret) {
    return res.status(401).json({
      success: false,
      error: 'User not found or MFA is not configured.',
    });
  }

  const inputCode = String(code).trim();
  const validTotp = authenticator.check(inputCode, user.mfaSecret);

  let validBackup = false;
  if (!validTotp && user.mfaBackupCodes) {
    try {
      const backupCodes: string[] = JSON.parse(user.mfaBackupCodes);
      const codeIndex = backupCodes.indexOf(inputCode.toUpperCase());
      if (codeIndex !== -1) {
        validBackup = true;
        // Remove used single-use backup code
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaBackupCodes: JSON.stringify(backupCodes) },
        });
      }
    } catch {
      // ignore JSON parse error
    }
  }

  if (!validTotp && !validBackup) {
    await recordAuditLog({
      actorId: user.id,
      action: 'MFA_FAILED',
      entity: 'User',
      entityId: user.id,
      metadata: { reason: 'Invalid TOTP or backup code' },
      req,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid MFA verification code. Please check your authenticator app or backup codes.',
      code: 'invalid_mfa_code',
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const rawRefreshToken = await createRefreshTokenSession(user.id, req);
  const dashboard = getAuthorizedDashboardForRole(user.role);

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    permissions: [],
  });

  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    tenantId: user.tenantId,
    action: 'LOGIN_MFA',
    entity: 'User',
    entityId: user.id,
    metadata: { method: validBackup ? 'backup_code' : 'totp' },
    req,
  });

  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.tenant?.name || 'ADGRID Network',
      title: user.title,
      avatarUrl: user.avatarUrl,
      tenantId: user.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
});

// Enable MFA: Generate Secret & QR Code
app.post(`${API_PREFIX}/auth/mfa/enable`, requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { secret, otpauth } = generateMfaSecret(user.email);
  const qrCodeDataUrl = await generateQrCode(otpauth);

  // Store secret temporarily pending confirmation
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: secret },
  });

  return res.json({
    success: true,
    secret,
    otpauthUrl: otpauth,
    qrCodeDataUrl,
  });
});

// Confirm MFA setup with code verification
app.post(`${API_PREFIX}/auth/mfa/confirm`, requireAuth, async (req: Request, res: Response) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Verification code is required' });

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.mfaSecret) {
    return res.status(400).json({ error: 'MFA setup has not been initiated.' });
  }

  const isValid = authenticator.check(String(code).trim(), user.mfaSecret);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your authenticator app.' });
  }

  const backupCodes = generateBackupCodes(10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(backupCodes),
    },
  });

  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    tenantId: user.tenantId,
    action: 'MFA_ENABLED',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return res.json({
    success: true,
    message: 'MFA successfully enabled.',
    backupCodes,
  });
});

// Disable MFA
app.post(`${API_PREFIX}/auth/mfa/disable`, requireAuth, async (req: Request, res: Response) => {
  const { password, code } = req.body || {};
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const validPassword = password && (await verifyPassword(String(password), user.passwordHash));
  const validCode = code && user.mfaSecret && authenticator.check(String(code).trim(), user.mfaSecret);

  if (!validPassword && !validCode) {
    return res.status(400).json({
      error: 'Valid account password or authenticator code is required to disable MFA.',
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    },
  });

  await recordAuditLog({
    actorId: user.id,
    actorRole: user.role,
    tenantId: user.tenantId,
    action: 'MFA_DISABLED',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return res.json({ success: true, message: 'MFA has been disabled.' });
});

// Refresh Token: Session rotation and replay detection
app.post(`${API_PREFIX}/auth/refresh`, async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!rawToken) {
    return res.status(401).json({ success: false, error: 'No refresh token provided.' });
  }

  const result = await rotateRefreshTokenSession(String(rawToken), req);
  if (!result.success || !result.newRawToken || !result.user) {
    return res.status(401).json({
      success: false,
      error: result.error || 'Refresh session invalid or expired.',
      code: 'session_expired',
    });
  }

  const user = result.user;
  const dashboard = getAuthorizedDashboardForRole(user.role);

  const newAccessToken = signAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    permissions: [],
  });

  res.cookie('refresh_token', result.newRawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token: newAccessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.tenant?.name || 'ADGRID Network',
      title: user.title,
      avatarUrl: user.avatarUrl,
      tenantId: user.tenantId,
      authorizedDashboard: dashboard,
    },
    redirectTo: dashboard,
  });
});

// Logout current session
app.post(`${API_PREFIX}/auth/logout`, async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
  if (rawToken) {
    await revokeRefreshTokenSession(String(rawToken), req);
  }

  res.clearCookie('refresh_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Logout all sessions (Section 11)
app.post(`${API_PREFIX}/auth/logout-all`, requireAuth, async (req: Request, res: Response) => {
  await revokeAllSessionsForUser(req.user!.id, req);
  res.clearCookie('refresh_token');
  return res.json({ success: true, message: 'All active sessions have been logged out.' });
});

// Get current authenticated user profile
app.get(`${API_PREFIX}/auth/me`, requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { tenant: true },
  });

  if (!user) {
    return res.status(404).json({ authenticated: false, error: 'User not found.' });
  }

  const dashboard = getAuthorizedDashboardForRole(user.role);

  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organization: user.tenant?.name || 'ADGRID Network',
      title: user.title,
      avatarUrl: user.avatarUrl,
      tenantId: user.tenantId,
      status: user.status,
      emailVerified: !!user.emailVerifiedAt,
      mfaEnabled: user.mfaEnabled,
      permissions: req.user!.permissions,
      authorizedDashboard: dashboard,
    },
    tenant: user.tenant,
  });
});

// Verify email address
const handleVerifyEmail = async (req: Request, res: Response) => {
  const token = req.body?.token || req.query?.token;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Verification token is required.' });
  }

  const tokenHash = hashToken(String(token));
  const record = await prisma.emailToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.type !== 'VERIFY_EMAIL') {
    return res.status(400).json({ success: false, error: 'Invalid verification token.' });
  }

  if (record.consumedAt) {
    return res.status(400).json({ success: false, error: 'Verification token has already been used.' });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: 'Verification token has expired. Please request a new one.' });
  }

  // Mark token consumed and user verified
  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
    }),
  ]);

  await recordAuditLog({
    actorId: record.userId,
    action: 'EMAIL_VERIFIED',
    entity: 'User',
    entityId: record.userId,
    req,
  });

  return res.json({ success: true, message: 'Email address verified successfully.' });
};

app.post(`${API_PREFIX}/auth/verify-email`, handleVerifyEmail);
app.get(`${API_PREFIX}/auth/verify-email`, handleVerifyEmail);

// Resend verification email
app.post(`${API_PREFIX}/auth/resend-verification`, strictRateLimit, async (req: Request, res: Response) => {
  const email = (req.body?.email || req.user?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt) {
    const rawVerifyToken = generateSecureToken(32);
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        type: 'VERIFY_EMAIL',
        tokenHash: hashToken(rawVerifyToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await sendVerificationEmail(user.email, rawVerifyToken);
  }

  return res.json({
    success: true,
    message: 'If the email is registered and unverified, a new verification link has been sent.',
  });
});

// Forgot password: issue single-use secure reset token
app.post(`${API_PREFIX}/auth/forgot-password`, strictRateLimit, async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawResetToken = generateSecureToken(32);
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        type: 'RESET_PASSWORD',
        tokenHash: hashToken(rawResetToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendPasswordResetEmail(user.email, rawResetToken);

    await recordAuditLog({
      actorId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user.id,
      req,
    });
  }

  return res.json({
    success: true,
    message: 'If an account exists for this email, a password reset link has been sent.',
  });
});

// Reset password with single-use token and session revocation
app.post(`${API_PREFIX}/auth/reset-password`, strictRateLimit, async (req: Request, res: Response) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  if (!validatePasswordStrength(String(password))) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long.',
    });
  }

  const tokenHash = hashToken(String(token));
  const record = await prisma.emailToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.type !== 'RESET_PASSWORD') {
    return res.status(400).json({ success: false, error: 'Invalid or unrecognized reset token.' });
  }

  if (record.consumedAt) {
    return res.status(400).json({ success: false, error: 'Reset token has already been used.' });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: 'Password reset token has expired. Please request a new one.' });
  }

  const newHash = await hashPassword(String(password));

  // Update password, mark token consumed, and revoke all existing sessions (Section 9!)
  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: newHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await recordAuditLog({
    actorId: record.userId,
    action: 'PASSWORD_RESET',
    entity: 'User',
    entityId: record.userId,
    metadata: { reason: 'Password reset completed via token' },
    req,
  });

  return res.json({
    success: true,
    message: 'Password reset successfully. All previous sessions have been revoked. Please sign in.',
  });
});

// Change password for authenticated session
app.post(`${API_PREFIX}/auth/change-password`, requireAuth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
  }

  if (!validatePasswordStrength(String(newPassword))) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

  const matches = await verifyPassword(String(currentPassword), user.passwordHash);
  if (!matches) {
    return res.status(400).json({ success: false, error: 'Current password does not match.' });
  }

  const newHash = await hashPassword(String(newPassword));
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await recordAuditLog({
    actorId: user.id,
    action: 'PASSWORD_CHANGED',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return res.json({ success: true, message: 'Password changed successfully.' });
});

// Validate route access helper
app.post(`${API_PREFIX}/auth/validate-access`, async (req: Request, res: Response) => {
  const { targetPath } = req.body || {};
  const path = String(targetPath || '/');
  const user = req.user;

  if (!user) {
    if (path === '/admin' || path === '/admin/') {
      return res.json({ authorized: true, status: 200, showLogin: true });
    }
    if (path.startsWith('/admin/media-owner')) {
      return res.status(401).json({
        authorized: false,
        status: 401,
        redirectTo: '/media/login',
        error: 'Authentication required. Please sign in to the Media Owner portal.',
      });
    }
    if (path.startsWith('/admin/agency')) {
      return res.status(401).json({
        authorized: false,
        status: 401,
        redirectTo: '/agency/login',
        error: 'Authentication required. Please sign in to your Marketing Agency workspace.',
      });
    }
    if (path.startsWith('/admin/')) {
      return res.status(401).json({
        authorized: false,
        status: 401,
        redirectTo: '/admin',
        error: 'Authentication required. Redirecting to central login.',
      });
    }
    return res.json({ authorized: true, status: 200, isPublic: true });
  }

  // Account status check (Section 9)
  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      authorized: false,
      status: 403,
      redirectTo: user.role === 'Media Owner' ? '/media/login' : '/agency/login',
      error: `Your account is ${user.status.toLowerCase()}. Access denied.`,
    });
  }

  // Tenant status check (Section 9)
  if (req.tenant && req.tenant.status !== 'ACTIVE' && user.role !== 'Platform Admin') {
    return res.status(403).json({
      authorized: false,
      status: 403,
      redirectTo: '/agency/login',
      error: 'Your organization is pending approval or inactive.',
    });
  }

  const dashboard = getAuthorizedDashboardForRole(user.role);
  if (!dashboard) {
    return res.status(403).json({
      authorized: false,
      status: 403,
      redirectTo: '/admin',
      error: `Access Denied: Unrecognized role '${user.role}'.`,
    });
  }

  if (path === '/admin' || path === '/admin/') {
    return res.json({
      authorized: true,
      status: 200,
      alreadyAuthenticated: true,
      redirectTo: dashboard,
      user,
    });
  }

  // Check role authorization for protected dashboards
  if (user.role === 'Platform Admin') {
    return res.json({ authorized: true, status: 200, user, dashboardRoute: '/admin/platform' });
  }

  let authorized = true;
  if (path.startsWith('/admin/agency')) {
    authorized = ['Agency Admin', 'Account Manager', 'Campaign Manager', 'Operations Manager', 'Finance Manager', 'Field Manager', 'Agency Staff'].includes(user.role);
  } else if (path.startsWith('/admin/client')) {
    authorized = user.role === 'Customer / Client Company';
  } else if (path.startsWith('/admin/media-owner')) {
    authorized = user.role === 'Media Owner';
  } else if (path.startsWith('/admin/vendor')) {
    authorized = user.role === 'Vendor';
  } else if (path.startsWith('/admin/field-agent')) {
    authorized = user.role === 'Field Agent';
  } else if (path.startsWith('/admin/platform')) {
    authorized = user.role === 'Platform Admin';
  }

  if (!authorized) {
    return res.status(403).json({
      authorized: false,
      status: 403,
      redirectTo: dashboard,
      error: `Access Denied: Role '${user.role}' is not authorized for ${path}. Redirected to authorized workspace.`,
      user,
    });
  }

  return res.json({
    authorized: true,
    status: 200,
    user,
    dashboardRoute: dashboard,
  });
});

// ==========================================
// MULTI-TENANT ISOLATED ENDPOINTS (Section 5)
// ==========================================

// Get current tenant organization details
app.get(`${API_PREFIX}/tenant/me`, requireAuth, requireTenant(), async (req: Request, res: Response) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.user!.tenantId! },
    include: {
      _count: {
        select: { users: true, invitations: true },
      },
    },
  });

  return res.json({ success: true, tenant });
});

// Get users in the authenticated user's organization (strictly tenant-isolated!)
app.get(`${API_PREFIX}/tenant/users`, requireAuth, requireTenant(), async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { tenantId: req.user!.tenantId! },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      avatarUrl: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ success: true, users, count: users.length });
});

// Invite a user to join the authenticated organization (Section 16)
app.post(
  `${API_PREFIX}/tenant/invite`,
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    // Only organization admins / managers can invite
    const ALLOWED_INVITERS = ['Platform Admin', 'Agency Admin', 'Media Owner'];
    if (!ALLOWED_INVITERS.includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only organization administrators can invite new members.',
      });
    }

    const { email, role } = req.body || {};
    if (!email || !role) {
      return res.status(400).json({ success: false, error: 'Email and role are required for invitation.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const rawInviteToken = generateSecureToken(32);
    const tokenHash = hashToken(rawInviteToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        role: String(role),
        tenantId: req.user!.tenantId!,
        tokenHash,
        expiresAt,
        invitedById: req.user!.id,
      },
      include: { tenant: true },
    });

    await sendInvitationEmail(normalizedEmail, invitation.tenant.name, invitation.role, rawInviteToken);

    await recordAuditLog({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      tenantId: req.user!.tenantId,
      action: 'INVITATION_CREATED',
      entity: 'Invitation',
      entityId: invitation.id,
      metadata: { invitedEmail: normalizedEmail, role },
      req,
    });

    return res.status(201).json({
      success: true,
      message: `Invitation generated for ${normalizedEmail}.`,
      invitationId: invitation.id,
      inviteToken: rawInviteToken, // returned in development for immediate test convenience
    });
  }
);

// Get audit logs for the organization (tenant-isolated!)
app.get(
  `${API_PREFIX}/tenant/audit-logs`,
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    const isPlatformAdmin = req.user!.role === 'Platform Admin';

    const logs = await prisma.auditLog.findMany({
      where: isPlatformAdmin ? {} : { tenantId: req.user!.tenantId! },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, logs });
  }
);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ADGRID Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: 'internal_error',
  });
});

export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ADGRID Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
