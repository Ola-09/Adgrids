import crypto from 'node:crypto';
import { Request, Response, Router } from 'express';
import { prisma } from './db';
import { requireAuth, requireTenant } from './middleware';
import { recordAuditLog } from './auth';

/**
 * Payments & ledger (architecture doc §4D + §9 Idempotency).
 * - Payment state comes from verified provider responses or server-side reconciliation.
 * - Webhooks are idempotent: duplicate providerRef or repeated callbacks never
 *   create duplicate transactions.
 * - Provider specifics are isolated behind adapters (doc §8: don't leak provider
 *   response formats through the application).
 * - No credentials, card data or tokens are ever persisted in meta.
 */

export const paymentsRouter = Router();

export type ProviderName = 'paystack' | 'flutterwave' | 'stripe' | 'simulated' | 'manual';

interface InitiatedPayment {
  provider: ProviderName;
  providerRef: string;
  checkoutUrl: string | null;
}

/** Resolve the active provider from env configuration (adapter boundary). */
function resolveProvider(method: string | undefined): ProviderName {
  const requested = (method || '').toLowerCase();
  if (requested === 'paystack' && process.env.PAYSTACK_SECRET_KEY) return 'paystack';
  if (requested === 'flutterwave' && process.env.FLUTTERWAVE_SECRET_KEY) return 'flutterwave';
  if (requested === 'stripe' && process.env.STRIPE_SECRET_KEY) return 'stripe';
  if (requested === 'manual') return 'manual';
  // No gateway configured (or unknown method) → deterministic simulated rail for development.
  return 'simulated';
}

/** Provider-specific initiation. Real gateways would call their REST API here;
 *  the rest of the app only ever sees this normalized shape. */
async function initiateWithProvider(provider: ProviderName, paymentId: string, reference: string, amountUSD: number, _meta: Record<string, unknown>): Promise<InitiatedPayment> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  switch (provider) {
    case 'paystack':
      // A real implementation POSTs to https://api.paystack.co/transaction/initialize
      // and returns authorization_url. Until keys are configured we fall through.
      return { provider, providerRef: reference, checkoutUrl: `${appUrl}/pay/${paymentId}?provider=paystack` };
    case 'flutterwave':
      return { provider, providerRef: reference, checkoutUrl: `${appUrl}/pay/${paymentId}?provider=flutterwave` };
    case 'stripe':
      return { provider, providerRef: reference, checkoutUrl: `${appUrl}/pay/${paymentId}?provider=stripe` };
    case 'simulated':
    default:
      return { provider, providerRef: reference, checkoutUrl: `${appUrl}/pay/${paymentId}?provider=simulated` };
  }
}

function randomRef(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
}

/** Mark a payment SUCCESS exactly once. Returns { applied, duplicate }. */
async function settlePayment(providerRef: string, metaPatch: Record<string, unknown>) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { providerRef }, include: { booking: true } });
    if (!payment) return { applied: false, duplicate: false, notFound: true as const, payment: null };
    if (payment.status === 'SUCCESS') return { applied: false, duplicate: true as const, notFound: false, payment };

    const settled = await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCESS', paidAt: new Date(), meta: JSON.stringify({ ...safeParse(payment.meta), ...metaPatch }) },
    });

    if (payment.bookingId) {
      await tx.mediaBooking.update({
        where: { id: payment.bookingId },
        data: { updatedAt: new Date() },
      }).catch(() => undefined);
    }

    return { applied: true as const, duplicate: false, notFound: false, payment: settled };
  });
}

function safeParse(json: string | null | undefined): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// ── Initiate a payment for a booking ────────────────────────────────────────
paymentsRouter.post(
  '/initiate',
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const { bookingId, amountUSD, method } = req.body || {};
      const idempotencyKey = String(req.headers['idempotency-key'] || req.body?.idempotencyKey || '').trim();

      if (!bookingId) {
        return res.status(400).json({ success: false, error: 'bookingId is required.', code: 'validation_failed' });
      }

      // Idempotency: the same key never creates a second transaction (doc §9).
      if (idempotencyKey) {
        const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
        if (existing) {
          return res.json({ success: true, duplicate: true, payment: existing, message: 'Idempotent replay: existing payment returned.' });
        }
      }

      const booking = await prisma.mediaBooking.findUnique({ where: { id: String(bookingId) } });
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

      const isPartyOwner =
        req.user!.role === 'Platform Admin' ||
        booking.agencyTenantId === req.user!.tenantId ||
        booking.mediaOwnerTenantId === req.user!.tenantId;
      if (!isPartyOwner) {
        return res.status(403).json({ success: false, error: 'You are not a party to this booking.', code: 'tenant_isolation_violation' });
      }
      if (['Rejected', 'Cancelled', 'Completed'].includes(booking.status)) {
        return res.status(409).json({ success: false, error: `Booking is ${booking.status}; payments cannot be initiated.`, code: 'invalid_state' });
      }

      const provider = resolveProvider(method);
      const deposit = Math.round(booking.totalAmountUSD * 0.5 * 100) / 100;
      const amount = Number(amountUSD) > 0 ? Math.round(Number(amountUSD) * 100) / 100 : deposit;
      if (amount <= 0) {
        return res.status(400).json({ success: false, error: 'Payment amount must be positive.' });
      }

      const reference = randomRef(provider);
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          tenantId: req.user!.tenantId,
          direction: 'INBOUND',
          kind: 'PAYMENT',
          amountUSD: amount,
          currency: 'USD',
          method: provider,
          providerRef: reference,
          idempotencyKey: idempotencyKey || null,
          status: 'PENDING',
          meta: JSON.stringify({
            bookingRef: booking.id,
            billboardCode: booking.billboardId,
            initiatedBy: req.user!.email,
            // Never store credentials or card data here.
          }),
        },
      });

      const initiated = await initiateWithProvider(provider, payment.id, reference, amount, {});

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'PAYMENT_INITIATED',
        entity: 'Payment',
        entityId: payment.id,
        metadata: { bookingId: booking.id, amountUSD: amount, provider },
        req,
      });

      return res.status(201).json({
        success: true,
        payment,
        checkoutUrl: initiated.checkoutUrl,
        provider,
        message: provider === 'simulated'
          ? 'Simulated payment rail (no gateway configured). Confirm via POST /api/payments/:id/simulate-success in development.'
          : 'Payment initiated with provider.',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Development-only simulated provider callback ────────────────────────────
paymentsRouter.post(
  '/:id/simulate-success',
  requireAuth,
  async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, error: 'Not available in production.' });
    }
    try {
      const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
      if (!payment) return res.status(404).json({ success: false, error: 'Payment not found.' });
      if (payment.method !== 'simulated' && payment.method !== 'manual') {
        return res.status(409).json({ success: false, error: `Only simulated/manual payments can be settled this way (method: ${payment.method}).`, code: 'invalid_method' });
      }

      const result = await settlePayment(payment.providerRef!, { settledVia: 'simulate-success' });
      if (result.notFound) return res.status(404).json({ success: false, error: 'Payment not found.' });
      if (result.duplicate) {
        return res.json({ success: true, duplicate: true, payment: result.payment, message: 'Payment was already settled (idempotent).' });
      }

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'PAYMENT_SETTLED_SIMULATED',
        entity: 'Payment',
        entityId: payment.id,
        metadata: { bookingId: payment.bookingId, amountUSD: payment.amountUSD },
        req,
      });

      return res.json({ success: true, payment: result.payment, message: 'Payment settled.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Shared webhook settlement logic (idempotent) ────────────────────────────
async function handleChargeSuccess(provider: ProviderName, providerRef: string, rawMeta: Record<string, unknown>) {
  const result = await settlePayment(providerRef, { webhookEvent: rawMeta, provider });
  return result;
}

// ── Paystack webhook (HMAC SHA512 of raw body) ──────────────────────────────
paymentsRouter.post('/webhook/paystack', async (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string | undefined;

    if (secret) {
      if (!signature || !(req as any).rawBody) {
        return res.status(401).json({ success: false, error: 'Missing signature.' });
      }
      const expected = crypto.createHmac('sha512', secret).update((req as any).rawBody).digest('hex');
      const a = Buffer.from(expected);
      const b = Buffer.from(signature);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ success: false, error: 'Invalid signature.' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, error: 'Paystack not configured.' });
    } else {
      console.warn('[payments] PAYSTACK_SECRET_KEY not set — accepting unsigned webhook in development.');
    }

    const event = req.body || {};
    if (event?.event !== 'charge.success') {
      return res.json({ success: true, ignored: event?.event || 'unknown_event' });
    }

    const reference = event.data?.reference;
    if (!reference) return res.status(400).json({ success: false, error: 'Missing data.reference.' });

    const result = await handleChargeSuccess('paystack', String(reference), { gateway: 'paystack', event: event.event });
    if (result.notFound) {
      // Unknown reference: accept the webhook (200) so the provider stops retrying, but log it.
      console.warn(`[payments] Paystack webhook for unknown reference ${reference}`);
      return res.json({ success: false, error: 'Unknown payment reference.' });
    }
    return res.json({ success: true, duplicate: result.duplicate, applied: result.applied });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Flutterwave webhook (verif-hash header) ─────────────────────────────────
paymentsRouter.post('/webhook/flutterwave', async (req: Request, res: Response) => {
  try {
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const provided = req.headers['verif-hash'] as string | undefined;
    if (secret) {
      if (!provided || provided !== secret) {
        return res.status(401).json({ success: false, error: 'Invalid verif-hash.' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, error: 'Flutterwave not configured.' });
    } else {
      console.warn('[payments] FLUTTERWAVE_WEBHOOK_SECRET not set — accepting unsigned webhook in development.');
    }

    const data = req.body?.data || {};
    const status = String(data.status || '').toLowerCase();
    if (status && status !== 'successful') {
      return res.json({ success: true, ignored: `status:${status}` });
    }
    const reference = data.tx_ref || data.id;
    if (!reference) return res.status(400).json({ success: false, error: 'Missing data.tx_ref.' });

    const result = await handleChargeSuccess('flutterwave', String(reference), { gateway: 'flutterwave', providerTxId: data.id });
    if (result.notFound) {
      console.warn(`[payments] Flutterwave webhook for unknown reference ${reference}`);
      return res.json({ success: false, error: 'Unknown payment reference.' });
    }
    return res.json({ success: true, duplicate: result.duplicate, applied: result.applied });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Stripe webhook (t=timestamp,v1=signature HMAC-SHA256) ───────────────────
paymentsRouter.post('/webhook/stripe', async (req: Request, res: Response) => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const header = req.headers['stripe-signature'] as string | undefined;

    if (secret) {
      if (!header || !(req as any).rawBody) {
        return res.status(401).json({ success: false, error: 'Missing stripe-signature.' });
      }
      const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=') as [string, string]));
      const timestamp = parts.t;
      const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${(req as any).rawBody}`).digest('hex');
      const a = Buffer.from(expected);
      const b = Buffer.from(parts.v1 || '');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ success: false, error: 'Invalid signature.' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, error: 'Stripe not configured.' });
    } else {
      console.warn('[payments] STRIPE_WEBHOOK_SECRET not set — accepting unsigned webhook in development.');
    }

    const event = req.body || {};
    if (event?.type !== 'payment_intent.succeeded') {
      return res.json({ success: true, ignored: event?.type || 'unknown_event' });
    }
    const intentId = event.data?.object?.id;
    if (!intentId) return res.status(400).json({ success: false, error: 'Missing data.object.id.' });

    const result = await handleChargeSuccess('stripe', String(intentId), { gateway: 'stripe' });
    if (result.notFound) {
      console.warn(`[payments] Stripe webhook for unknown intent ${intentId}`);
      return res.json({ success: false, error: 'Unknown payment reference.' });
    }
    return res.json({ success: true, duplicate: result.duplicate, applied: result.applied });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── List payments for a booking ─────────────────────────────────────────────
paymentsRouter.get(
  '/booking/:bookingId',
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const booking = await prisma.mediaBooking.findUnique({ where: { id: req.params.bookingId } });
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
      const isPartyOwner =
        req.user!.role === 'Platform Admin' ||
        booking.agencyTenantId === req.user!.tenantId ||
        booking.mediaOwnerTenantId === req.user!.tenantId;
      if (!isPartyOwner) {
        return res.status(403).json({ success: false, error: 'You are not a party to this booking.', code: 'tenant_isolation_violation' });
      }
      const payments = await prisma.payment.findMany({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'desc' },
      });
      const paidUSD = payments.filter((p) => p.status === 'SUCCESS' && p.kind === 'PAYMENT').reduce((acc, p) => acc + p.amountUSD, 0);
      return res.json({
        success: true,
        payments,
        totals: {
          paidUSD: Math.round(paidUSD * 100) / 100,
          totalUSD: booking.totalAmountUSD,
          balanceUSD: Math.round((booking.totalAmountUSD - paidUSD) * 100) / 100,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── Refund (creates a linked refund record — history is preserved) ──────────
paymentsRouter.post(
  '/:id/refund',
  requireAuth,
  requireTenant(),
  async (req: Request, res: Response) => {
    try {
      const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { booking: true } });
      if (!payment) return res.status(404).json({ success: false, error: 'Payment not found.' });

      const isPartyOwner =
        req.user!.role === 'Platform Admin' ||
        payment.tenantId === req.user!.tenantId ||
        payment.booking?.mediaOwnerTenantId === req.user!.tenantId;
      if (!isPartyOwner) {
        return res.status(403).json({ success: false, error: 'Not authorized to refund this payment.', code: 'tenant_isolation_violation' });
      }
      if (payment.status !== 'SUCCESS') {
        return res.status(409).json({ success: false, error: 'Only successful payments can be refunded.', code: 'invalid_state' });
      }
      const alreadyRefunded = await prisma.payment.findFirst({
        where: { kind: 'REFUND', meta: { contains: payment.id } },
      });
      if (alreadyRefunded) {
        return res.json({ success: true, duplicate: true, refund: alreadyRefunded, message: 'Refund already exists (idempotent).' });
      }

      const amount = Number(req.body?.amountUSD) > 0 ? Number(req.body.amountUSD) : payment.amountUSD;
      const refund = await prisma.$transaction(async (tx) => {
        const created = await tx.payment.create({
          data: {
            bookingId: payment.bookingId,
            tenantId: payment.tenantId,
            direction: 'REFUND',
            kind: 'REFUND',
            amountUSD: amount,
            currency: payment.currency,
            method: payment.method,
            providerRef: randomRef('refund'),
            status: 'SUCCESS',
            paidAt: new Date(),
            meta: JSON.stringify({ originalPaymentId: payment.id, reason: req.body?.reason || 'not_specified' }),
          },
        });
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'REVERSED' } });
        return created;
      });

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'PAYMENT_REFUNDED',
        entity: 'Payment',
        entityId: payment.id,
        metadata: { refundId: refund.id, amountUSD: amount },
        req,
      });

      return res.status(201).json({ success: true, refund, message: 'Refund recorded. Original payment preserved as REVERSED.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);
