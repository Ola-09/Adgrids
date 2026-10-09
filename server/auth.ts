import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { prisma } from './db';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'adgrid-dev-access-secret-32-chars-long';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const APP_URL = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface TokenUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  permissions: string[];
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): boolean {
  return password.length >= 8;
}

export function signAccessToken(user: TokenUserPayload): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL } as any
  );
}

export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
}

export function signMfaToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'mfa_challenge' },
    JWT_ACCESS_SECRET,
    { expiresIn: '5m' } as any
  );
}

export function verifyMfaToken(token: string): { sub: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as any;
    if (decoded?.type === 'mfa_challenge') {
      return { sub: decoded.sub, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const EXACT_ROLE_DASHBOARD_MAP: Record<string, string> = {
  'Media Owner': '/admin/media-owner',
  'Agency Admin': '/admin/agency',
  'Campaign Manager': '/admin/agency',
  'Operations Manager': '/admin/agency',
  'Account Manager': '/admin/agency',
  'Finance Manager': '/admin/agency',
  'Field Manager': '/admin/agency',
  'Agency Staff': '/admin/agency',
  'Customer / Client Company': '/admin/client',
  'Field Agent': '/admin/field-agent',
  'Vendor': '/admin/vendor',
  'Platform Admin': '/admin/platform',
};

// Map roles to authorized dashboard URLs (Section 12 & 13)
// Strictly returns null for unknown/invalid roles to prevent unauthorized access
export function getAuthorizedDashboardForRole(role: string): string | null {
  if (!role) return null;
  return EXACT_ROLE_DASHBOARD_MAP[role] || null;
}

// Canonical granular permissions per role
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'Platform Admin': [
    'platform:superadmin', 'platform.manage', 'governance:all', 'audit:all', 'audit.read',
    'tenants:all', 'security:all', 'users.manage', 'users.read',
    'campaigns:manage', 'operations:manage', 'finance:all', 'inventory:manage', 'billboards:create', 'billboards:export'
  ],
  'Agency Admin': [
    'agency:all', 'campaigns:manage', 'campaign.read', 'campaign.create', 'campaign.update', 'campaign.delete',
    'operations:manage', 'finance:view', 'finance.read', 'verification:approve',
    'clients:manage', 'client.read', 'client.create', 'reports:view',
    'bookings:manage', 'booking.create', 'booking.approve', 'locations:view', 'field-teams:manage', 'jobs:manage',
    'users.invite', 'users.read', 'users.manage'
  ],
  'Campaign Manager': [
    'campaigns:manage', 'campaign.read', 'campaign.create', 'campaign.update',
    'bookings:manage', 'booking.create', 'locations:view', 'reports:view', 'jobs:view'
  ],
  'Operations Manager': [
    'operations:manage', 'field-teams:manage', 'jobs:manage', 'jobs.execute', 'jobs.verify',
    'field-audit:manage', 'locations:view', 'evidence:manage', 'campaigns:view'
  ],
  'Account Manager': [
    'clients:manage', 'client.read', 'client.create', 'client.update',
    'campaigns:manage', 'campaign.read', 'reports:view', 'bookings:view'
  ],
  'Finance Manager': [
    'finance:all', 'finance.read', 'finance.manage', 'invoices:manage', 'settlements:manage', 'reports:view'
  ],
  'Field Manager': [
    'field-audit:manage', 'jobs:verify', 'jobs.verify', 'evidence:manage', 'field-teams:manage'
  ],
  'Agency Staff': [
    'campaigns:view', 'campaign.read', 'jobs:view', 'locations:view'
  ],
  'Customer / Client Company': [
    'client:tracker', 'client:campaigns', 'client.read', 'campaign.read',
    'client:purchase', 'booking.create', 'client:invoices', 'client:evidence', 'reports:view'
  ],
  'Media Owner': [
    'inventory:manage', 'inventory.read', 'inventory.create', 'inventory.update',
    'billboards:create', 'billboards:export', 'bookings:view', 'revenue:view', 'yield:optimize'
  ],
  'Vendor': [
    'jobs:assigned', 'jobs.assigned', 'jobs:update', 'jobs.execute', 'earnings:view', 'evidence:upload'
  ],
  'Field Agent': [
    'mobile-os:access', 'jobs:execute', 'jobs.execute', 'evidence:upload', 'gps:verify'
  ],
};

export async function resolvePermissionsForRole(role: string): Promise<string[]> {
  try {
    const dbPermissions = await prisma.rolePermission.findMany({
      where: { role },
      select: { permission: true },
    });
    if (dbPermissions.length > 0) {
      return dbPermissions.map((p) => p.permission);
    }
  } catch (error) {
    console.error('Failed to load role permissions from DB:', error);
  }
  return ROLE_DEFAULT_PERMISSIONS[role] || ['campaigns:view'];
}

// Database-backed Refresh Token Session management
export async function createRefreshTokenSession(
  userId: string,
  req?: Request
): Promise<string> {
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const userAgent = req?.headers['user-agent'] || undefined;
  const ip = (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req?.socket?.remoteAddress || undefined;

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ip,
    },
  });

  return rawToken;
}

export async function rotateRefreshTokenSession(
  rawOldToken: string,
  req?: Request
): Promise<{ success: boolean; newRawToken?: string; user?: any; error?: string }> {
  const oldHash = hashToken(rawOldToken);

  const existingRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
    include: { user: { include: { tenant: true } } },
  });

  if (!existingRecord) {
    return { success: false, error: 'Invalid refresh token.' };
  }

  // Detect replay attack: token already revoked!
  if (existingRecord.revokedAt) {
    // Revoke ALL active sessions for this user to protect compromised account
    await prisma.refreshToken.updateMany({
      where: { userId: existingRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await recordAuditLog({
      actorId: existingRecord.userId,
      action: 'REPLAY_ATTACK_DETECTED',
      entity: 'RefreshToken',
      entityId: existingRecord.id,
      metadata: { reason: 'Revoked refresh token was re-submitted. Revoked all sessions for security.' },
      req,
    });

    return {
      success: false,
      error: 'Security alert: Refresh token has already been used. All sessions have been terminated.',
    };
  }

  // Check expiration
  if (existingRecord.expiresAt < new Date()) {
    return { success: false, error: 'Refresh token has expired.' };
  }

  // Generate new token and rotate
  const newRawToken = generateSecureToken(32);
  const newHash = hashToken(newRawToken);
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const userAgent = req?.headers['user-agent'] || existingRecord.userAgent || undefined;
  const ip = (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req?.socket?.remoteAddress || existingRecord.ip || undefined;

  // Revoke old token and create new one in a transaction
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existingRecord.id },
      data: {
        revokedAt: new Date(),
        replacedByTokenHash: newHash,
      },
    }),
    prisma.refreshToken.create({
      data: {
        userId: existingRecord.userId,
        tokenHash: newHash,
        expiresAt: newExpiresAt,
        userAgent,
        ip,
      },
    }),
  ]);

  return {
    success: true,
    newRawToken,
    user: existingRecord.user,
  };
}

export async function revokeRefreshTokenSession(rawToken: string, req?: Request): Promise<void> {
  const hash = hashToken(rawToken);
  const session = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (session && !session.revokedAt) {
    await prisma.refreshToken.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    await recordAuditLog({
      actorId: session.userId,
      action: 'LOGOUT',
      entity: 'RefreshToken',
      entityId: session.id,
      metadata: { reason: 'User session logged out' },
      req,
    });
  }
}

export async function revokeAllSessionsForUser(userId: string, req?: Request): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await recordAuditLog({
    actorId: userId,
    action: 'LOGOUT_ALL',
    entity: 'User',
    entityId: userId,
    metadata: { reason: 'All user sessions revoked' },
    req,
  });
}

// Audit logging helper
export interface AuditLogParams {
  actorId?: string | null;
  actorRole?: string | null;
  tenantId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  req?: Request;
}

export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const ip = params.req
      ? (params.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || params.req.socket?.remoteAddress
      : undefined;
    const userAgent = params.req?.headers['user-agent'] || undefined;

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || undefined,
        actorRole: params.actorRole || undefined,
        tenantId: params.tenantId || undefined,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || undefined,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        ip,
        userAgent,
      },
    });
  } catch (err) {
    console.error('AuditLog error:', err);
  }
}

// Email helper
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.log(`[Email Service - dev mode] Skipping email to ${to}: ${subject}`);
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM_EMAIL, to: [to], subject, html }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.warn(`Resend email warning (${response.status}): ${details}`);
    }
  } catch (error) {
    console.warn('Failed to send email via Resend:', error);
  }
}

export async function sendVerificationEmail(email: string, rawToken: string) {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your ADGRID Cloud email',
    html: `
      <h2>Welcome to ADGRID Cloud</h2>
      <p>Please click the link below to verify your corporate email address:</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#ef5a24;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email Address</a></p>
      <p>Or copy and paste this link: ${link}</p>
      <p>This verification link will expire in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, rawToken: string) {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your ADGRID Cloud password',
    html: `
      <h2>ADGRID Cloud Password Reset</h2>
      <p>A password reset was requested for your account. Click the link below to set a new password:</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#ef5a24;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
      <p>Or copy and paste this link: ${link}</p>
      <p>This link expires in 1 hour and can only be used once.</p>
    `,
  });
}

export async function sendInvitationEmail(email: string, tenantName: string, role: string, rawToken: string) {
  const link = `${APP_URL}/accept-invitation?token=${encodeURIComponent(rawToken)}`;
  await sendEmail({
    to: email,
    subject: `You have been invited to join ${tenantName} on ADGRID`,
    html: `
      <h2>ADGRID Organization Invitation</h2>
      <p>You have been invited to join <strong>${tenantName}</strong> as a <strong>${role}</strong>.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#ef5a24;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Accept Invitation</a></p>
      <p>Or paste this link into your browser: ${link}</p>
      <p>This invitation link expires in 7 days.</p>
    `,
  });
}

export async function sendAgencyApprovalEmail(email: string, agencyName: string, approved: boolean) {
  const loginLink = `${APP_URL}/agency/login`;
  await sendEmail({
    to: email,
    subject: approved
      ? `Your Marketing Agency application for ${agencyName} has been approved`
      : `Update regarding your Marketing Agency application for ${agencyName}`,
    html: approved
      ? `
        <h2>Agency Application Approved</h2>
        <p>Your Marketing Agency registration for <strong>${agencyName}</strong> has been approved by the Media Owner network.</p>
        <p>You may now sign in to your Agency Workspace:</p>
        <p><a href="${loginLink}" style="display:inline-block;padding:10px 18px;background:#ef5a24;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Sign In to Agency Workspace</a></p>
        <p>Or visit: ${loginLink}</p>
      `
      : `
        <h2>Agency Application Update</h2>
        <p>Your application for <strong>${agencyName}</strong> was not approved by the media concessionaire network.</p>
        <p>If you have questions, please contact platform operations.</p>
      `,
  });
}

// MFA Helpers
export function generateMfaSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'ADGRID', secret);
  return { secret, otpauth };
}

export async function generateQrCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}
