import { Request, Response, Router } from 'express';
import { prisma } from './db';
import { requireAuth, requireRole, requireTenant } from './middleware';
import { recordAuditLog } from './auth';
import { findBookingConflicts } from './inventory';

/**
 * Booking & availability engine (architecture doc §4C + §6B).
 * - Backend is the single source of truth for availability.
 * - Creating a booking places a temporary HOLD; approval locks the dates (HOLD → BOOKED).
 * - Availability re-check + all writes run inside one transaction so simultaneous
 *   overlapping requests can never both become confirmed. Losers get HTTP 409.
 */

export const bookingsRouter = Router();

const HOLD_WINDOW_HOURS = 48;
const DEPOSIT_PERCENT = Number(process.env.BOOKING_DEPOSIT_PERCENT || 50);

const AGENCY_BOOKING_ROLES = [
  'Agency Admin',
  'Campaign Manager',
  'Account Manager',
  'Media Buyer',
  'Operations Manager',
  'Platform Admin',
];

const MEDIA_OWNER_ROLES = ['Media Owner', 'Platform Admin'];

function parseRange(body: { startDate?: unknown; endDate?: unknown }) {
  const startAt = new Date(String(body.startDate || ''));
  const endAt = new Date(String(body.endDate || ''));
  return { startAt, endAt, valid: !Number.isNaN(startAt.getTime()) && !Number.isNaN(endAt.getTime()) && startAt < endAt };
}

function conflictResponse(conflicts: Awaited<ReturnType<typeof findBookingConflicts>>) {
  return {
    success: false,
    error: 'Booking conflict: the selected dates overlap an existing booking, hold or maintenance window for this billboard.',
    code: 'booking_conflict',
    conflicts: [
      ...conflicts.blocks.map((b) => ({ type: 'block', reason: b.reason, startAt: b.startAt, endAt: b.endAt, ref: b.sourceId })),
      ...conflicts.bookings.map((b) => ({ type: 'booking', reason: b.status, startAt: b.startDate, endAt: b.endDate, ref: b.id, campaignName: b.campaignName })),
    ],
  };
}

// ── Agency creates a booking request (places a temporary HOLD) ──────────────
bookingsRouter.post(
  '/',
  requireAuth,
  requireRole(AGENCY_BOOKING_ROLES),
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const { billboardCode, campaignName, brand, rateMonthlyUSD, totalAmountUSD } = req.body || {};
      const { startAt, endAt, valid } = parseRange(req.body || {});

      if (!billboardCode || !campaignName) {
        return res.status(400).json({ success: false, error: 'billboardCode and campaignName are required.', code: 'validation_failed' });
      }
      if (!valid) {
        return res.status(400).json({ success: false, error: 'Invalid date range: startDate must be before endDate.', code: 'invalid_dates' });
      }

      const code = String(billboardCode).toUpperCase();

      // Everything (conflict re-check + booking + hold) happens in one transaction.
      const result = await prisma.$transaction(async (tx) => {
        const billboard = await tx.billboard.findUnique({ where: { code } });
        if (!billboard) {
          throw Object.assign(new Error('Billboard not found.'), { status: 404, code: 'not_found' });
        }
        if (billboard.lifecycleStatus !== 'PUBLISHED') {
          throw Object.assign(new Error('This billboard is not publicly bookable yet.'), { status: 409, code: 'not_publishable' });
        }

        const conflicts = await findBookingConflicts(code, startAt, endAt);
        if (conflicts.blocks.length > 0 || conflicts.bookings.length > 0) {
          throw Object.assign(new Error('Booking conflict.'), { status: 409, code: 'booking_conflict', conflicts });
        }

        const months = Math.max(1, Math.ceil((endAt.getTime() - startAt.getTime()) / (30 * 24 * 60 * 60 * 1000)));
        const rate = Number(rateMonthlyUSD) > 0 ? Number(rateMonthlyUSD) : billboard.priceMonthlyUSD;
        const total = Number(totalAmountUSD) > 0 ? Number(totalAmountUSD) : Math.round(rate * months * 100) / 100;

        const agency = req.user!.tenantId
          ? await tx.tenant.findUnique({ where: { id: req.user!.tenantId } })
          : null;

        const booking = await tx.mediaBooking.create({
          data: {
            mediaOwnerTenantId: billboard.tenantId || 'unassigned',
            agencyTenantId: req.user!.tenantId,
            billboardId: code,
            billboardName: billboard.name,
            brand: String(brand || campaignName),
            campaignName: String(campaignName),
            agencyName: agency?.name || req.user!.name,
            startDate: startAt,
            endDate: endAt,
            rateMonthlyUSD: rate,
            totalAmountUSD: total,
            status: 'Pending',
            paymentRequirement: 'DEPOSIT',
            createdById: req.user!.id,
          },
        });

        await tx.availabilityBlock.create({
          data: {
            billboardId: code,
            startAt,
            endAt,
            reason: 'HOLD',
            sourceType: 'booking',
            sourceId: booking.id,
            holdExpiresAt: new Date(Date.now() + HOLD_WINDOW_HOURS * 60 * 60 * 1000),
            createdById: req.user!.id,
          },
        });

        return { booking, months, rate, total };
      }, { timeout: 10000 });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BOOKING_REQUESTED',
        entity: 'MediaBooking',
        entityId: result.booking.id,
        metadata: { billboardCode: code, startAt, endAt, holdHours: HOLD_WINDOW_HOURS, totalAmountUSD: result.total },
        req,
      });

      return res.status(201).json({
        success: true,
        booking: result.booking,
        paymentRequirement: {
          type: 'DEPOSIT',
          percent: DEPOSIT_PERCENT,
          amountDueUSD: Math.round(result.total * (DEPOSIT_PERCENT / 100) * 100) / 100,
        },
        holdExpiresAt: new Date(Date.now() + HOLD_WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
        message: `Booking requested. A ${HOLD_WINDOW_HOURS}h hold is placed on ${code}. Deposit (${DEPOSIT_PERCENT}%) must be paid before the media owner can confirm.`,
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json(
          error.code === 'booking_conflict'
            ? conflictResponse(error.conflicts)
            : { success: false, error: error.message, code: error.code },
        );
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── List bookings for the caller's organization ─────────────────────────────
bookingsRouter.get(
  '/',
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const isPlatformAdmin = req.user!.role === 'Platform Admin';
      const tenantId = req.user!.tenantId;
      const bookings = await prisma.mediaBooking.findMany({
        where: isPlatformAdmin
          ? {}
          : { OR: [{ agencyTenantId: tenantId }, { mediaOwnerTenantId: tenantId }] },
        orderBy: { createdAt: 'desc' },
        include: {
          payments: { select: { id: true, status: true, amountUSD: true, kind: true, method: true, paidAt: true } },
          availabilityBlocks: { select: { id: true, reason: true, startAt: true, endAt: true, holdExpiresAt: true } },
        },
      });

      const paidByBooking = new Map<string, number>();
      for (const b of bookings) {
        paidByBooking.set(b.id, b.payments.filter((p) => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amountUSD, 0));
      }

      return res.json({
        success: true,
        bookings: bookings.map((b) => ({
          ...b,
          paidUSD: Math.round((paidByBooking.get(b.id) || 0) * 100) / 100,
          balanceUSD: Math.round((b.totalAmountUSD - (paidByBooking.get(b.id) || 0)) * 100) / 100,
        })),
        total: bookings.length,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Agency cancels its own pending booking (releases the hold) ──────────────
bookingsRouter.post(
  '/:id/cancel',
  requireAuth,
  requireRole(AGENCY_BOOKING_ROLES),
  async (req: Request, res: Response) => {
    try {
      const booking = await prisma.mediaBooking.findUnique({ where: { id: req.params.id } });
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
      if (req.user!.role !== 'Platform Admin') {
        if (!req.user!.tenantId || booking.agencyTenantId !== req.user!.tenantId) {
          return res.status(403).json({ success: false, error: 'You can only cancel your own bookings.', code: 'tenant_isolation_violation' });
        }
      }
      if (!['Pending', 'Approved'].includes(booking.status)) {
        return res.status(409).json({ success: false, error: `Booking with status ${booking.status} cannot be cancelled.`, code: 'invalid_state' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.availabilityBlock.deleteMany({ where: { sourceId: booking.id, reason: 'HOLD' } });
        return tx.mediaBooking.update({
          where: { id: booking.id },
          data: { status: 'Cancelled', cancelledAt: new Date() },
        });
      });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BOOKING_CANCELLED',
        entity: 'MediaBooking',
        entityId: booking.id,
        metadata: { billboardCode: booking.billboardId },
        req,
      });

      return res.json({ success: true, booking: updated, message: 'Booking cancelled and inventory hold released.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Media owner approve/reject with transactional confirmation ──────────────
// Exported so the legacy /media-owner/bookings/:id/action route delegates to the
// exact same engine (no unguarded bypass path).
export async function bookingActionHandler(req: Request, res: Response) {
  {
    try {
      const { action } = req.body || {}; // 'approve' | 'reject'
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, error: 'action must be "approve" or "reject".' });
      }

      const booking = await prisma.mediaBooking.findUnique({
        where: { id: req.params.id },
        include: { payments: true },
      });
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

      if (req.user!.role !== 'Platform Admin') {
        if (!req.user!.tenantId || booking.mediaOwnerTenantId !== req.user!.tenantId) {
          return res.status(403).json({ success: false, error: 'Only the inventory owner can action this booking.', code: 'tenant_isolation_violation' });
        }
      }
      if (booking.status !== 'Pending') {
        return res.status(409).json({ success: false, error: `Booking is ${booking.status}; only Pending bookings can be actioned.`, code: 'invalid_state' });
      }

      if (action === 'reject') {
        const updated = await prisma.$transaction(async (tx) => {
          await tx.availabilityBlock.deleteMany({ where: { sourceId: booking.id, reason: 'HOLD' } });
          return tx.mediaBooking.update({ where: { id: booking.id }, data: { status: 'Rejected' } });
        });
        await recordAuditLog({
          actorId: req.user!.id, actorRole: req.user!.role, tenantId: req.user!.tenantId,
          action: 'BOOKING_REJECTED', entity: 'MediaBooking', entityId: booking.id, req,
        });
        return res.json({ success: true, booking: updated, message: 'Booking rejected and hold released.' });
      }

      // ── Approve path: enforce configured payment requirement, then lock dates ──
      const successTotal = booking.payments
        .filter((p) => p.status === 'SUCCESS' && p.kind === 'PAYMENT')
        .reduce((acc, p) => acc + p.amountUSD, 0);

      let requiredAmount = 0;
      if (booking.paymentRequirement === 'DEPOSIT') requiredAmount = Math.round(booking.totalAmountUSD * (DEPOSIT_PERCENT / 100) * 100) / 100;
      if (booking.paymentRequirement === 'FULL') requiredAmount = booking.totalAmountUSD;

      if (requiredAmount > 0 && successTotal < requiredAmount) {
        return res.status(409).json({
          success: false,
          error: `Payment requirement not met: ${booking.paymentRequirement.toLowerCase()} of $${requiredAmount} required before approval ($${successTotal} paid so far).`,
          code: 'payment_required',
          paymentRequirement: { type: booking.paymentRequirement, requiredAmountUSD: requiredAmount, paidUSD: successTotal },
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Re-check availability inside the transaction: simultaneous approvals cannot both win.
        const conflicts = await findBookingConflicts(booking.billboardId, booking.startDate, booking.endDate, booking.id);
        if (conflicts.blocks.filter((b) => b.sourceId !== booking.id).length > 0 || conflicts.bookings.length > 0) {
          throw Object.assign(new Error('Booking conflict.'), { status: 409, code: 'booking_conflict', conflicts });
        }

        // HOLD → BOOKED (or create the lock for legacy bookings that never had one).
        const holds = await tx.availabilityBlock.findMany({ where: { sourceId: booking.id, reason: 'HOLD' } });
        if (holds.length > 0) {
          await tx.availabilityBlock.updateMany({
            where: { sourceId: booking.id, reason: 'HOLD' },
            data: { reason: 'BOOKED', holdExpiresAt: null },
          });
        } else {
          await tx.availabilityBlock.create({
            data: {
              billboardId: booking.billboardId,
              startAt: booking.startDate,
              endAt: booking.endDate,
              reason: 'BOOKED',
              sourceType: 'booking',
              sourceId: booking.id,
              createdById: req.user!.id,
            },
          });
        }

        return tx.mediaBooking.update({
          where: { id: booking.id },
          data: { status: 'Approved', approvedAt: new Date(), approvedById: req.user!.id },
        });
      }, { timeout: 10000 });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'BOOKING_APPROVED',
        entity: 'MediaBooking',
        entityId: booking.id,
        metadata: { billboardCode: booking.billboardId, paidUSD: successTotal },
        req,
      });

      return res.json({ success: true, booking: updated, message: 'Booking confirmed. Inventory dates are now locked.' });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json(
          error.code === 'booking_conflict'
            ? conflictResponse(error.conflicts)
            : { success: false, error: error.message, code: error.code },
        );
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

bookingsRouter.post('/:id/action', requireAuth, requireRole(MEDIA_OWNER_ROLES), bookingActionHandler);
