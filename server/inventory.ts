import { Request, Response, Router } from 'express';
import { prisma } from './db';
import { requireAuth, requireRole, requireTenant } from './middleware';
import { recordAuditLog } from './auth';

/**
 * Inventory module (architecture doc §4B + §6A).
 * - Billboard is the core stable entity; `code` is the durable business ID.
 * - Importing a record and publishing a listing are separate actions.
 * - Spreadsheet updates never delete records, bookings, payments or history.
 * - All validation/dedup happens server-side (backend is authoritative).
 */

export const inventoryRouter = Router();

const MEDIA_OWNER_ROLES = [
  'Media Owner',
  'Agency Admin', // agencies may also own billboard agency inventory
  'Platform Admin',
];

const MANAGER_ROLES = [
  'Agency Admin',
  'Campaign Manager',
  'Operations Manager',
  'Media Owner',
  'Platform Admin',
];

const IMPORTABLE_FIELDS = [
  'name', 'metro', 'metroName', 'location', 'corridor', 'format', 'status',
  'client', 'brand', 'flightId', 'flightName', 'dimensions', 'resolution',
  'lightingType', 'dailyReach', 'availabilityStatus', 'audienceType',
  'campaignObjective', 'description', 'previewUrl', 'nightUrl',
  'mediaOwnerCompany', 'contactPerson', 'contactPhone', 'contactEmail',
  'licenseNumber',
] as const;

const NUMERIC_FIELDS: Record<string, 'int' | 'float'> = {
  priceMonthlyUSD: 'float',
  priceDailyUSD: 'float',
  dailyTrafficVehicles: 'int',
  dwellTimeSeconds: 'int',
  lat: 'float',
  lng: 'float',
  profileCompleteness: 'int',
};

function toStringValue(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
}

function toNumberValue(v: unknown, kind: 'int' | 'float'): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return kind === 'int' ? Math.round(n) : n;
}

/** Generate a stable, human-readable code: <METRO>-<SUFFIX> e.g. LOS-K3F9Q2 */
async function generateBillboardCode(metro: string | null): Promise<string> {
  const prefix = (metro || 'ADG').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'ADG';
  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const candidate = `${prefix}-${suffix}`;
    const existing = await prisma.billboard.findUnique({ where: { code: candidate } });
    if (!existing) return candidate;
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/** Compute profile completeness from filled fields (0-100). */
function computeCompleteness(data: Record<string, unknown>): number {
  const importantKeys = [
    'name', 'location', 'corridor', 'format', 'dimensions', 'lightingType',
    'priceMonthlyUSD', 'previewUrl', 'lat', 'lng', 'mediaOwnerCompany', 'description',
  ];
  const filled = importantKeys.filter((k) => {
    const v = (data as Record<string, unknown>)[k];
    return v !== null && v !== undefined && v !== '' && v !== 0;
  }).length;
  return Math.round((filled / importantKeys.length) * 100);
}

/** Map a raw spreadsheet/API row into a validated Prisma payload. */
function normalizeRow(raw: Record<string, unknown>) {
  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  const name = toStringValue(raw.name) || toStringValue(raw.siteName) || toStringValue(raw.billboardName);
  if (!name) errors.push('Missing required field: name');

  for (const field of IMPORTABLE_FIELDS) {
    const value = toStringValue(raw[field]);
    if (value !== null) data[field] = value;
  }
  if (name) data.name = name;

  for (const [field, kind] of Object.entries(NUMERIC_FIELDS)) {
    const value = toNumberValue(raw[field], kind);
    if (value !== null) data[field] = value;
    else if (raw[field] !== undefined && raw[field] !== null && raw[field] !== '') {
      errors.push(`Invalid numeric value for ${field}: ${String(raw[field])}`);
    }
  }

  if (raw.specsList !== undefined) {
    if (Array.isArray(raw.specsList)) data.specsList = JSON.stringify(raw.specsList);
    else {
      const parsed = toStringValue(raw.specsList);
      if (parsed) data.specsList = parsed;
    }
  }

  const code = toStringValue(raw.code) || toStringValue(raw.id) || toStringValue(raw.billboardId);
  return { code, data, errors };
}

/** Shared overlap filter: blocks that actually constrain a billboard's calendar. */
function activeBlockFilter(code: string, startAt: Date, endAt: Date) {
  return {
    billboardId: code,
    // Overlap test: existing.start < new.end AND existing.end > new.start
    startAt: { lt: endAt },
    endAt: { gt: startAt },
    OR: [
      { reason: { in: ['BOOKED', 'MAINTENANCE', 'UNAVAILABLE'] } },
      { reason: 'HOLD', holdExpiresAt: { gt: new Date() } }, // expired holds do not block
    ],
  };
}

/** Check a date range against confirmed blocks + active bookings. Returns conflict list. */
export async function findBookingConflicts(
  billboardCode: string,
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string,
) {
  const [blocks, bookings] = await Promise.all([
    prisma.availabilityBlock.findMany({
      where: activeBlockFilter(billboardCode, startAt, endAt),
      select: { id: true, reason: true, startAt: true, endAt: true, sourceId: true },
    }),
    prisma.mediaBooking.findMany({
      where: {
        billboardId: billboardCode,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ['Approved', 'Active'] },
        startDate: { lt: endAt },
        endDate: { gt: startAt },
      },
      select: { id: true, status: true, startDate: true, endDate: true, campaignName: true },
    }),
  ]);
  return { blocks, bookings };
}

// ── Public marketplace listing (published inventory only, no auth) ──────────
inventoryRouter.get('/marketplace/billboards', async (_req: Request, res: Response) => {
  try {
    const billboards = await prisma.billboard.findMany({
      where: { lifecycleStatus: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, billboards });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── List inventory visible to the caller's organization ────────────────────
inventoryRouter.get(
  '/inventory',
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const isPlatformAdmin = req.user!.role === 'Platform Admin';
      const billboards = await prisma.billboard.findMany({
        where: isPlatformAdmin ? {} : { tenantId: req.user!.tenantId },
        orderBy: { createdAt: 'desc' },
        include: {
          availabilityBlocks: {
            where: {
              OR: [
                { reason: { in: ['BOOKED', 'MAINTENANCE', 'UNAVAILABLE'] } },
                { reason: 'HOLD', holdExpiresAt: { gt: new Date() } },
              ],
            },
            select: { startAt: true, endAt: true, reason: true },
          },
        },
      });
      return res.json({ success: true, billboards, total: billboards.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Create a single billboard record ────────────────────────────────────────
inventoryRouter.post(
  '/inventory',
  requireAuth,
  requireRole(MANAGER_ROLES),
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const { code: explicitCode, ...rest } = req.body || {};
      const { data, errors } = normalizeRow({ code: explicitCode, ...rest });
      if (errors.length > 0) {
        return res.status(400).json({ success: false, error: errors.join('; '), code: 'validation_failed' });
      }

      let code = explicitCode ? String(explicitCode).trim().toUpperCase() : null;
      if (code) {
        const existing = await prisma.billboard.findUnique({ where: { code } });
        if (existing) {
          return res.status(409).json({
            success: false,
            error: `Billboard code ${code} already exists. Reuse it via update/import instead of creating a duplicate.`,
            code: 'duplicate_code',
          });
        }
      } else {
        code = await generateBillboardCode((data.metro as string) || null);
      }

      const billboard = await prisma.billboard.create({
        data: {
          ...(data as any),
          code,
          tenantId: req.user!.tenantId,
          importSource: 'manual',
          profileCompleteness: computeCompleteness(data),
        },
      });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BILLBOARD_CREATED',
        entity: 'Billboard',
        entityId: billboard.code,
        metadata: { source: 'manual' },
        req,
      });

      return res.status(201).json({ success: true, billboard });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Update a billboard (ID preserved, history preserved) ────────────────────
inventoryRouter.patch(
  '/inventory/:code',
  requireAuth,
  requireRole(MANAGER_ROLES),
  async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      const existing = await prisma.billboard.findUnique({ where: { code } });
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Billboard not found.', code: 'not_found' });
      }
      if (req.user!.role !== 'Platform Admin' && existing.tenantId !== req.user!.tenantId) {
        return res.status(403).json({
          success: false,
          error: 'You cannot modify another organization’s inventory.',
          code: 'tenant_isolation_violation',
        });
      }

      const { code: _ignored, lifecycleStatus, ...rest } = req.body || {};
      const { data, errors } = normalizeRow(rest);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, error: errors.join('; '), code: 'validation_failed' });
      }
      // Lifecycle transitions go through /publish and /unpublish only.
      delete (data as Record<string, unknown>).lifecycleStatus;
      if (lifecycleStatus !== undefined) {
        return res.status(400).json({
          success: false,
          error: 'Use /inventory/:code/publish or /unpublish to change lifecycle status.',
          code: 'lifecycle_route_required',
        });
      }

      const billboard = await prisma.billboard.update({
        where: { code },
        data: {
          ...(data as any),
          profileCompleteness: computeCompleteness({ ...existing, ...data }),
        },
      });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BILLBOARD_UPDATED',
        entity: 'Billboard',
        entityId: code,
        metadata: { fields: Object.keys(data) },
        req,
      });

      return res.json({ success: true, billboard });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Publishing is a separate action from importing (doc §6A) ────────────────
inventoryRouter.post(
  '/inventory/:code/publish',
  requireAuth,
  requireRole(MANAGER_ROLES),
  async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      const existing = await prisma.billboard.findUnique({ where: { code } });
      if (!existing) return res.status(404).json({ success: false, error: 'Billboard not found.' });
      if (req.user!.role !== 'Platform Admin' && existing.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ success: false, error: 'Tenant boundary violation.', code: 'tenant_isolation_violation' });
      }
      const billboard = await prisma.billboard.update({
        where: { code },
        data: { lifecycleStatus: 'PUBLISHED' },
      });
      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BILLBOARD_PUBLISHED',
        entity: 'Billboard',
        entityId: code,
        req,
      });
      return res.json({ success: true, billboard });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

inventoryRouter.post(
  '/inventory/:code/unpublish',
  requireAuth,
  requireRole(MANAGER_ROLES),
  async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      const existing = await prisma.billboard.findUnique({ where: { code } });
      if (!existing) return res.status(404).json({ success: false, error: 'Billboard not found.' });
      if (req.user!.role !== 'Platform Admin' && existing.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ success: false, error: 'Tenant boundary violation.', code: 'tenant_isolation_violation' });
      }
      const billboard = await prisma.billboard.update({
        where: { code },
        data: { lifecycleStatus: 'UNPUBLISHED' },
      });
      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BILLBOARD_UNPUBLISHED',
        entity: 'Billboard',
        entityId: code,
        req,
      });
      return res.json({ success: true, billboard });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Availability calendar query ─────────────────────────────────────────────
inventoryRouter.get(
  '/inventory/:code/availability',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      const startParam = toStringValue(req.query.start);
      const endParam = toStringValue(req.query.end);
      if (!startParam || !endParam) {
        return res.status(400).json({ success: false, error: 'start and end query params are required (ISO dates).' });
      }
      const startAt = new Date(startParam);
      const endAt = new Date(endParam);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
        return res.status(400).json({ success: false, error: 'Invalid date range.' });
      }

      const billboard = await prisma.billboard.findUnique({ where: { code } });
      if (!billboard) return res.status(404).json({ success: false, error: 'Billboard not found.' });

      const { blocks, bookings } = await findBookingConflicts(code, startAt, endAt);
      return res.json({
        success: true,
        available: blocks.length === 0 && bookings.length === 0,
        conflicts: [
          ...blocks.map((b) => ({ type: 'block', reason: b.reason, startAt: b.startAt, endAt: b.endAt, ref: b.sourceId })),
          ...bookings.map((b) => ({ type: 'booking', reason: b.status, startAt: b.startDate, endAt: b.endDate, ref: b.id, campaignName: b.campaignName })),
        ],
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Server-side bulk import (Excel/CSV rows already parsed client-side) ─────
inventoryRouter.post(
  '/inventory/import',
  requireAuth,
  requireRole(MANAGER_ROLES),
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const rows: Record<string, unknown>[] = Array.isArray(req.body?.rows) ? req.body.rows : [];
      const fileName = toStringValue(req.body?.fileName) || 'bulk_import';

      if (rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No rows supplied for import.', code: 'empty_import' });
      }
      if (rows.length > 2000) {
        return res.status(400).json({ success: false, error: 'Import batch too large (max 2000 rows per call).', code: 'batch_too_large' });
      }

      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const attention: { row: number; reason: string; name?: string }[] = [];
      const seenKeys = new Set<string>(); // in-batch dedup (natural key: name+metro)

      // eslint-disable-next-line no-restricted-syntax
      for (let index = 0; index < rows.length; index++) {
        const raw = rows[index];
        const { code, data, errors } = normalizeRow(raw);
        const rowLabel = index + 1;

        if (errors.length > 0) {
          skippedCount += 1;
          attention.push({ row: rowLabel, reason: errors.join('; '), name: (data.name as string) || undefined });
          continue;
        }

        const metro = (data.metro as string) || '';
        const naturalKey = `${String(data.name).trim().toLowerCase()}|${metro.trim().toUpperCase()}`;
        if (seenKeys.has(naturalKey)) {
          skippedCount += 1;
          attention.push({ row: rowLabel, reason: 'Duplicate of an earlier row in this batch (same name + metro).', name: String(data.name) });
          continue;
        }
        seenKeys.add(naturalKey);

        // Resolve existing record: prefer explicit code, fall back to natural key.
        let existing = code ? await prisma.billboard.findUnique({ where: { code: code.toUpperCase() } }) : null;
        if (!existing) {
          existing = await prisma.billboard.findFirst({
            where: {
              name: { equals: String(data.name).trim(), },
              metro: metro ? { equals: metro } : undefined,
              tenantId: req.user!.tenantId,
            },
          });
        }

        const payload = {
          ...(data as any),
          tenantId: req.user!.tenantId,
          lastImportedAt: new Date(),
          importSource: 'spreadsheet',
          profileCompleteness: computeCompleteness(data),
        };

        if (existing) {
          // Update in place — the stable `code` (and all booking/payment history) is preserved.
          await prisma.billboard.update({ where: { code: existing.code }, data: payload });
          updatedCount += 1;
          attention.push({ row: rowLabel, reason: `Updated existing billboard ${existing.code} (matched by ${code ? 'code' : 'name + metro'}).`, name: String(data.name) });
        } else {
          const newCode = code ? code.toUpperCase() : await generateBillboardCode(metro || null);
          await prisma.billboard.create({ data: { ...payload, code: newCode, lifecycleStatus: 'DRAFT' } });
          importedCount += 1;
        }
      }

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'INVENTORY_BULK_IMPORTED',
        entity: 'Billboard',
        entityId: fileName,
        metadata: { importedCount, updatedCount, skippedCount, fileName, totalRows: rows.length },
        req,
      });

      return res.json({
        success: true,
        importedCount,
        updatedCount,
        skippedCount,
        attention,
        message: `Import complete: ${importedCount} created, ${updatedCount} updated, ${skippedCount} skipped. New records start as DRAFT — publish them separately.`,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Delete (only when no bookings exist — preserve history) ─────────────────
inventoryRouter.delete(
  '/inventory/:code',
  requireAuth,
  requireRole(MANAGER_ROLES),
  async (req: Request, res: Response) => {
    try {
      const code = req.params.code.toUpperCase();
      const existing = await prisma.billboard.findUnique({
        where: { code },
        include: { _count: { select: { bookings: true } } },
      });
      if (!existing) return res.status(404).json({ success: false, error: 'Billboard not found.' });
      if (req.user!.role !== 'Platform Admin' && existing.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ success: false, error: 'Tenant boundary violation.', code: 'tenant_isolation_violation' });
      }
      if (existing._count.bookings > 0) {
        return res.status(409).json({
          success: false,
          error: `This billboard has ${existing._count.bookings} booking(s). Booking and payment history must be preserved — unpublish it instead.`,
          code: 'has_bookings',
        });
      }
      await prisma.billboard.delete({ where: { code } });
      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BILLBOARD_DELETED',
        entity: 'Billboard',
        entityId: code,
        req,
      });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);
