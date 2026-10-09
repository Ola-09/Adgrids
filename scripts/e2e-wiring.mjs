/**
 * E2E wiring verification — exercises the exact endpoints the UI now calls.
 * Run: node scripts/e2e-wiring.mjs
 */
const BASE = 'http://localhost:3000';
const PASS = 'AdGrid2026!';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function login(email) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS }),
  });
  const json = await res.json();
  if (!json.accessToken && !json.token) throw new Error(`login failed for ${email}: ${JSON.stringify(json).slice(0, 200)}`);
  return json.accessToken || json.token;
}

async function api(path, token, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { status: res.status, json };
}

// ── Run ──────────────────────────────────────────────────────────────────────
const agencyToken = await login('agency@adgrid.test');
check('Agency login', true, 'agency@adgrid.test');

// 1. Bookings list (what <AgencyBookings/> loads)
const list1 = await api('/api/bookings', agencyToken);
check('GET /api/bookings (agency)', list1.status === 200 && list1.json.success, `${list1.json.bookings?.length ?? 0} bookings`);

// 2. Create booking (same POST the modal sends) — dates chosen in a clean window
//    clear of seed bookings (mbk-01..03 end 2026-12-31; blocks start 2027-02-01)
const start = new Date(Date.now() + 80 * 86400000).toISOString().slice(0, 10);
const end = new Date(Date.now() + 110 * 86400000).toISOString().slice(0, 10);
const created = await api('/api/bookings', agencyToken, {
  method: 'POST',
  body: JSON.stringify({
    billboardCode: 'LOS-DOOH-101',
    campaignName: 'E2E Wiring Flight',
    brand: 'Wiring Test',
    startDate: start,
    endDate: end,
  }),
});
if (created.status !== 201) {
  check('POST /api/bookings → 201 + hold', false, JSON.stringify(created.json).slice(0, 300));
  console.log('\nAborting — booking creation failed.');
  process.exit(1);
}
check('POST /api/bookings → 201 + hold', true,
  `hold expires ${created.json.holdExpiresAt?.slice(0, 10) || '?'} · $${created.json.booking.totalAmountUSD}`);
const bookingId = created.json.booking?.id;
const deposit = created.json.paymentRequirement?.amountDueUSD;

// 3. Exact same window again → guaranteed 409 (what the modal banner displays)
const conflict = await api('/api/bookings', agencyToken, {
  method: 'POST',
  body: JSON.stringify({
    billboardCode: 'LOS-DOOH-101',
    campaignName: 'Overlap Attempt',
    brand: 'Wiring Test',
    startDate: start,
    endDate: end,
  }),
});
check('Overlapping booking → 409 booking_conflict', conflict.status === 409 && conflict.json.code === 'booking_conflict',
  `${conflict.json.conflicts?.length ?? 0} conflict(s) reported`);

// 4. Approve WITHOUT deposit via LEGACY media-owner path → must be blocked by engine
const moToken = await login('mediaowner@adgrid.test');
const earlyApprove = await api(`/api/media-owner/bookings/${bookingId}/action`, moToken, {
  method: 'POST',
  body: JSON.stringify({ action: 'approve' }),
});
check('Legacy MO approve w/o deposit → 409 payment_required', earlyApprove.status === 409 && earlyApprove.json.code === 'payment_required',
  earlyApprove.json.paymentRequirement ? `needs $${earlyApprove.json.paymentRequirement.requiredAmountUSD}` : JSON.stringify(earlyApprove.json).slice(0, 160));

// 5. Pay deposit exactly like the UI does: initiate (idempotent key) + simulate-success
const idemKey = crypto.randomUUID();
const initiate = await api('/api/payments/initiate', agencyToken, {
  method: 'POST',
  headers: { 'Idempotency-Key': idemKey },
  body: JSON.stringify({ bookingId, amountUSD: deposit }),
});
check('POST /api/payments/initiate', initiate.status === 201 && initiate.json.payment?.id,
  `$${initiate.json.payment?.amountUSD} via ${initiate.json.payment?.method}`);

const settle = await api(`/api/payments/${initiate.json.payment.id}/simulate-success`, agencyToken, { method: 'POST' });
check('Settle simulated payment', settle.status === 200 && settle.json.payment?.status === 'SUCCESS');

// 5b. Replay the same Idempotency-Key → duplicate, no second charge
const replay = await api('/api/payments/initiate', agencyToken, {
  method: 'POST',
  headers: { 'Idempotency-Key': idemKey },
  body: JSON.stringify({ bookingId, amountUSD: deposit }),
});
check('Idempotency-Key replay → duplicate:true', replay.json.duplicate === true);

// 6. Approve via LEGACY path again → engine converts HOLD → BOOKED
const approved = await api(`/api/media-owner/bookings/${bookingId}/action`, moToken, {
  method: 'POST',
  body: JSON.stringify({ action: 'approve' }),
});
check('Legacy MO approve after deposit → Approved', approved.status === 200 && approved.json.booking?.status === 'Approved');

// 7. Media-owner overview now carries paid/balance (what MO table renders)
const moOverview = await api('/api/media-owner/overview', moToken);
const moRow = (moOverview.json.bookings || []).find((b) => b.id === bookingId);
check('MO overview has paidUSD/balanceUSD', !!moRow && typeof moRow.paidUSD === 'number' && moRow.balanceUSD === moRow.totalAmountUSD - moRow.paidUSD,
  moRow ? `paid $${moRow.paidUSD} / bal $${moRow.balanceUSD}` : '');

// 8. Agency list reflects paid + locked dates (what the bookings table shows)
const list2 = await api('/api/bookings', agencyToken);
const row2 = (list2.json.bookings || []).find((b) => b.id === bookingId);
const hasBookedBlock = (row2?.availabilityBlocks || []).some((a) => a.reason === 'BOOKED');
check('Agency booking list: paid + dates locked', !!row2 && row2.paidUSD === deposit && hasBookedBlock,
  `paid $${row2?.paidUSD}, blocks: ${(row2?.availabilityBlocks || []).map((a) => a.reason).join(',') || 'none'}`);

// 9. Isolation sanity: agency cannot cancel a booking it doesn't own is covered elsewhere;
//    here verify agency CAN cancel its own pending (create a second one then cancel)
const second = await api('/api/bookings', agencyToken, {
  method: 'POST',
  body: JSON.stringify({
    billboardCode: 'LOS-VI-088',
    campaignName: 'Cancel Me',
    brand: 'Wiring Test',
    startDate: start,
    endDate: end,
  }),
});
const cancelled = await api(`/api/bookings/${second.json.booking?.id}/cancel`, agencyToken, { method: 'POST' });
check('Cancel booking releases hold', cancelled.status === 200 && cancelled.json.booking?.status === 'Cancelled');

// Summary
const failed = results.filter((r) => !r.ok);
console.log('\n────────────────────────────');
console.log(`${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
