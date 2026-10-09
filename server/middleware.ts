import { NextFunction, Request, Response } from 'express';
import { prisma } from './db';
import { resolvePermissionsForRole, verifyAccessToken } from './auth';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  status: string;
  permissions: string[];
}

export interface AuthenticatedTenant {
  id: string;
  name: string;
  type: string;
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenant?: AuthenticatedTenant | null;
    }
  }
}

// Authentication middleware: resolves identity from JWT
export async function authenticateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | null = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      return next();
    }

    // Resolve user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { tenant: true },
    });

    if (!user) {
      return next();
    }

    // Check account status (Section 9)
    if (user.status !== 'ACTIVE') {
      return next();
    }

    // Check organization tenant status (Section 9)
    if (user.tenant && user.tenant.status !== 'ACTIVE' && user.role !== 'Platform Admin') {
      return next();
    }

    const permissions = await resolvePermissionsForRole(user.role);

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status,
      permissions,
    };

    if (user.tenant) {
      req.tenant = {
        id: user.tenant.id,
        name: user.tenant.name,
        type: user.tenant.type,
        status: user.tenant.status,
      };
    } else {
      req.tenant = null;
    }

    next();
  } catch (error) {
    console.error('Error in authenticateRequest middleware:', error);
    next();
  }
}

// Reusable guard requiring authenticated session
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
      code: 'unauthenticated',
    });
  }
  next();
}

// Role guard helper
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'unauthenticated',
      });
    }

    // Platform Admin has global override
    if (req.user.role === 'Platform Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Role '${req.user.role}' is not authorized for this resource.`,
        code: 'forbidden',
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

// Granular permission guard helper
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'unauthenticated',
      });
    }

    if (req.user.role === 'Platform Admin') {
      return next();
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Missing permission '${permission}'.`,
        code: 'insufficient_permissions',
        requiredPermission: permission,
      });
    }

    next();
  };
}

// Strict tenant isolation guard helper
// Ensures a user can never access or modify another organization's records
export function requireTenant(
  getResourceTenantId?: (req: Request) => string | undefined | null
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'unauthenticated',
      });
    }

    // Platform Admins can manage cross-tenant records
    if (req.user.role === 'Platform Admin') {
      return next();
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        error: 'User is not assigned to any active organization.',
        code: 'no_tenant',
      });
    }

    if (getResourceTenantId) {
      const targetTenantId = getResourceTenantId(req);
      if (targetTenantId && targetTenantId !== req.user.tenantId) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Tenant boundary violation. You cannot access another organization’s data.',
          code: 'tenant_isolation_violation',
        });
      }
    }

    next();
  };
}
