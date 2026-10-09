import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CalendarPlus,
  CreditCard,
  Lock,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { useAuth } from '../../../context/AuthContext';
import { useBillboards } from '../../../context/BillboardContext';

/**
 * Agency Bookings workspace — wired to the real booking & payment engine:
 *  GET  /api/bookings                → tenant-scoped list with paid/balance totals
 *  POST /api/bookings                → creates booking + 48h inventory hold (transactional)
 *  POST /api/bookings/:id/cancel     → releases hold
 *  POST /api/payments/initiate       → idempotent payment initiation (Idempotency-Key)
 *  POST /api/payments/:id/simulate-success → dev settlement rail (no gateway keys configured)
 */

interface BookingRow {
  id: string;
  billboardId: string;
  billboardName: string;
  brand: string;
  campaignName: string;
  agencyName: string;
  startDate: string;
  endDate: string;
  rateMonthlyUSD: number;
  totalAmountUSD: number;
  status: string;
  paymentRequirement: string;
  paidUSD: number;
  balanceUSD: number;
  availabilityBlocks: { id: string; reason: string; startAt: string; endAt: string; holdExpiresAt: string | null }[];
  payments: { id: string; status: string; amountUSD: number; kind: string; method: string | null; paidAt: string | null }[];
  createdAt: string;
}

interface Banner {
  type: 'success' | 'error';
  message: string;
  details?: string[];
  payAction?: { bookingId: string; label: string; amountUSD: number };
}

const fmtUSD = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

function monthsBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
  return Math.max(1, Math.ceil((end - start) / (30 * 24 * 60 * 60 * 1000)));
}

export const AgencyBookings: React.FC = () => {
  const { activePurchaseBillboard, setActivePurchaseBillboard } = useAuth();
  const { billboards } = useBillboards();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  // New-booking modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [billboardCode, setBillboardCode] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [brand, setBrand] = useState('');
  const [startDate, setStartDate] = useState(toISODate(new Date(Date.now() + 7 * 86400000)));
  const [endDate, setEndDate] = useState(toISODate(new Date(Date.now() + 37 * 86400000)));

  const authHeaders = useCallback(
    (): HeadersInit => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
    }),
    [],
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setBookings(json.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  // Marketplace purchase intent → open the booking modal pre-filled.
  useEffect(() => {
    if (activePurchaseBillboard) {
      setBillboardCode(activePurchaseBillboard.id);
      setModalOpen(true);
      setBanner(null);
    }
  }, [activePurchaseBillboard]);

  const closeBanner = () => setBanner(null);

  const dismissModal = () => {
    setModalOpen(false);
    if (activePurchaseBillboard) setActivePurchaseBillboard(null);
  };

  const selectedBillboard = useMemo(
    () => billboards.find((b) => b.id === billboardCode) || null,
    [billboards, billboardCode],
  );

  const monthsPreview = monthsBetween(startDate, endDate);
  const ratePreview = selectedBillboard?.priceMonthlyUSD || 0;
  const totalPreview = Math.round(ratePreview * monthsPreview * 100) / 100;
  const depositPreview = Math.round(totalPreview * 0.5 * 100) / 100;

  // ── Payments ────────────────────────────────────────────────────────────────
  const initiatePayment = useCallback(
    async (bookingId: string, amountUSD: number, label: string) => {
      setPayingId(bookingId);
      setBanner(null);
      try {
        // Idempotency-Key guarantees a retry never double-charges (doc §9).
        const res = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { ...authHeaders(), 'Idempotency-Key': crypto.randomUUID() },
          body: JSON.stringify({ bookingId, amountUSD }),
        });
        const json = await res.json();
        if (!json.success) {
          setBanner({ type: 'error', message: json.error || 'Payment initiation failed.' });
          return;
        }
        const payment = json.payment;
        if (json.duplicate && payment.status === 'SUCCESS') {
          setBanner({ type: 'success', message: 'Payment already settled (idempotent replay detected).' });
          await loadBookings();
          return;
        }

        // Development rail: no gateway keys configured → settle the simulated payment.
        if (payment.method === 'simulated' || payment.method === 'manual') {
          const settleRes = await fetch(`/api/payments/${payment.id}/simulate-success`, {
            method: 'POST',
            headers: authHeaders(),
          });
          const settleJson = await settleRes.json();
          if (settleJson.success) {
            setBanner({
              type: 'success',
              message: `${label} of ${fmtUSD(payment.amountUSD)} settled (${payment.method} rail). ${
                settleJson.duplicate ? 'Duplicate settlement ignored.' : ''
              }`.trim(),
            });
          } else {
            setBanner({ type: 'error', message: settleJson.error || 'Settlement failed.' });
          }
        } else if (json.checkoutUrl) {
          // Real gateway configured → redirect to provider checkout.
          window.location.href = json.checkoutUrl;
          return;
        }
        await loadBookings();
      } catch (err: any) {
        setBanner({ type: 'error', message: err.message || 'Payment failed.' });
      } finally {
        setPayingId(null);
      }
    },
    [authHeaders, loadBookings],
  );

  // ── Booking actions ─────────────────────────────────────────────────────────
  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billboardCode || !campaignName.trim()) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          billboardCode,
          campaignName: campaignName.trim(),
          brand: brand.trim() || campaignName.trim(),
          startDate,
          endDate,
          rateMonthlyUSD: ratePreview || undefined,
          totalAmountUSD: totalPreview || undefined,
        }),
      });
      const json = await res.json();

      if (res.status === 409 && json.code === 'booking_conflict') {
        const details = (json.conflicts || []).map(
          (c: any) =>
            `${c.type === 'block' ? 'Hold/lock' : 'Booking'}: ${fmtDate(c.startAt)} → ${fmtDate(c.endAt)} (${c.reason || c.campaignName || c.ref})`,
        );
        setBanner({
          type: 'error',
          message: json.error || 'Booking conflict for the selected dates.',
          details: details.length > 0 ? details : undefined,
        });
        return;
      }
      if (!json.success) {
        setBanner({ type: 'error', message: json.error || 'Booking request failed.' });
        return;
      }

      const deposit = json.paymentRequirement?.amountDueUSD || depositPreview;
      setBanner({
        type: 'success',
        message: `Booking requested — a 48h hold is placed on ${billboardCode}. Deposit must be paid before the media owner can confirm.`,
        payAction: {
          bookingId: json.booking.id,
          label: 'Deposit',
          amountUSD: deposit,
        },
      });
      dismissModal();
      setCampaignName('');
      setBrand('');
      await loadBookings();
    } catch (err: any) {
      setBanner({ type: 'error', message: err.message || 'Booking request failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setPayingId(bookingId);
    setBanner(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setBanner({ type: 'success', message: json.message || 'Booking cancelled and hold released.' });
      } else {
        setBanner({ type: 'error', message: json.error || 'Cancellation failed.' });
      }
      await loadBookings();
    } catch (err: any) {
      setBanner({ type: 'error', message: err.message || 'Cancellation failed.' });
    } finally {
      setPayingId(null);
    }
  };

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalValue = bookings.reduce((acc, b) => acc + b.totalAmountUSD, 0);
    const collected = bookings.reduce((acc, b) => acc + b.paidUSD, 0);
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      confirmed: bookings.filter((b) => ['Approved', 'Active'].includes(b.status)).length,
      totalValue,
      collected,
      outstanding: totalValue - collected,
    };
  }, [bookings]);

  const renderPayButton = (b: BookingRow) => {
    const depositDue = Math.round(b.totalAmountUSD * 0.5 * 100) / 100;
    const depositUnpaid = b.paymentRequirement === 'DEPOSIT' && b.paidUSD < depositDue - 0.001;

    if (b.balanceUSD <= 0.001) return <span className="text-zinc-400 font-medium">Fully paid</span>;
    if (!['Pending', 'Approved'].includes(b.status)) {
      return <span className="text-zinc-400 font-medium">—</span>;
    }

    if (depositUnpaid) {
      return (
        <button
          onClick={() => initiatePayment(b.id, depositDue, 'Deposit')}
          disabled={payingId === b.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          <Wallet className="w-3.5 h-3.5" />
          {payingId === b.id ? 'Processing…' : `Pay Deposit (${fmtUSD(depositDue)})`}
        </button>
      );
    }

    return (
      <button
        onClick={() => initiatePayment(b.id, b.balanceUSD, 'Balance payment')}
        disabled={payingId === b.id}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181716] hover:bg-black disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        {payingId === b.id ? 'Processing…' : `Pay Balance (${fmtUSD(b.balanceUSD)})`}
      </button>
    );
  };

  const holdInfo = (b: BookingRow) => {
    const hold = b.availabilityBlocks?.find((a) => a.reason === 'HOLD');
    if (hold?.holdExpiresAt) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
          <Lock className="w-3 h-3" /> Hold expires {new Date(hold.holdExpiresAt).toLocaleDateString()}
        </span>
      );
    }
    const locked = b.availabilityBlocks?.find((a) => a.reason === 'BOOKED');
    if (locked) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <Lock className="w-3 h-3" /> Dates locked
        </span>
      );
    }
    return <span className="text-[10px] text-zinc-400">No hold</span>;
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Toast / result banner */}
      {banner && (
        <div
          className={`rounded-2xl border p-4 text-xs ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="font-bold">{banner.message}</p>
              {banner.details && banner.details.length > 0 && (
                <ul className="list-disc pl-4 space-y-0.5 font-medium text-[11px]">
                  {banner.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
              {banner.payAction && (
                <button
                  onClick={() => {
                    const action = banner.payAction!;
                    setBanner(null);
                    void initiatePayment(action.bookingId, action.amountUSD, action.label);
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-xs cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Pay Deposit ({fmtUSD(banner.payAction.amountUSD)})
                </button>
              )}
            </div>
            <button onClick={closeBanner} className="text-zinc-500 hover:text-zinc-800 font-black cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">Media Bookings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {kpis.total} total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Request flights on marketplace inventory — the backend places a 48h hold, collects the deposit, then the media owner confirms.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadBookings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setBanner(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-md transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Bookings', value: String(kpis.total) },
          { label: 'Pending', value: String(kpis.pending) },
          { label: 'Confirmed', value: String(kpis.confirmed) },
          { label: 'Contract Value', value: fmtUSD(kpis.totalValue) },
          { label: 'Collected', value: fmtUSD(kpis.collected) },
          { label: 'Outstanding', value: fmtUSD(kpis.outstanding) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#eae7e1] p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">{kpi.label}</p>
            <p className="text-sm font-black text-[#181716] mt-1 truncate">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center">
          <AlertTriangle className="w-6 h-6 text-zinc-300 mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-medium">
            No bookings yet. Browse the marketplace and book a billboard, or hit “New Booking”.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Billboard</th>
                  <th className="py-3 px-3">Campaign & Brand</th>
                  <th className="py-3 px-3">Flight Window</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Financials</th>
                  <th className="py-3 px-3">Inventory Lock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#181716]">{b.billboardName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{b.billboardId}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-800">{b.campaignName}</div>
                      <div className="text-[10px] text-zinc-400">{b.brand}</div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-black text-[#181716]">{fmtUSD(b.totalAmountUSD)}</div>
                      <div className="text-[10px] font-semibold">
                        <span className="text-emerald-600">Paid {fmtUSD(b.paidUSD)}</span>
                        {' · '}
                        <span className="text-zinc-500">Bal {fmtUSD(b.balanceUSD)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">{holdInfo(b)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {renderPayButton(b)}
                        {['Pending', 'Approved'].includes(b.status) && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            disabled={payingId === b.id}
                            title="Cancel booking and release the hold"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-700 font-bold text-xs cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={submitBooking}
            className="bg-white w-full max-w-lg rounded-2xl border border-[#eae7e1] shadow-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-base font-black text-[#181716]">Request Media Booking</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Submitting places a 48h hold on the inventory. A 50% deposit is required before the media owner can confirm.
              </p>
            </div>

            {activePurchaseBillboard && (
              <div className="rounded-xl bg-[#fff5f2] border border-[#ef5a24]/30 px-3.5 py-2.5 text-xs font-semibold text-[#b3401a]">
                Booking from marketplace selection: {activePurchaseBillboard.name}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Billboard</label>
              <select
                value={billboardCode}
                onChange={(e) => setBillboardCode(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-white text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#ef5a24]/30"
              >
                <option value="" disabled>
                  Select published inventory…
                </option>
                {billboards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.id} · {b.metroName || b.metro} · {fmtUSD(b.priceMonthlyUSD)}/mo
                  </option>
                ))}
              </select>
              {billboards.length === 0 && (
                <p className="text-[10px] text-amber-600 font-semibold">
                  Loading marketplace inventory… If empty, the media owner has not published inventory yet.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Campaign name</label>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  placeholder="e.g. Q1 Lagos Launch"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Brand</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Defaults to campaign name"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Flight start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Flight end</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]/30"
                />
              </div>
            </div>

            {selectedBillboard && (
              <div className="rounded-xl bg-[#faf9f6] border border-[#eae7e1] px-3.5 py-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Months</p>
                  <p className="text-xs font-black text-[#181716]">{monthsPreview}</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Contract total</p>
                  <p className="text-xs font-black text-[#181716]">{fmtUSD(totalPreview)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Deposit (50%)</p>
                  <p className="text-xs font-black text-[#ef5a24]">{fmtUSD(depositPreview)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={dismissModal}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !billboardCode}
                className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                {submitting ? 'Requesting…' : 'Request Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
