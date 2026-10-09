import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, Building2, CheckCircle2, DollarSign, Download, Lock, RefreshCw } from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { StatusBadge } from '../../shared/StatusBadge';

export const MediaOwnerRevenue: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media-owner/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching media owner revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const bookings = data?.bookings || [];
  const totalGross = bookings.reduce((acc: number, b: any) => acc + (b.totalAmountUSD || 0), 0);
  const approvedBookings = bookings.filter((b: any) => b.status === 'Approved' || b.status === 'Active');
  const clearedGross = approvedBookings.reduce((acc: number, b: any) => acc + (b.totalAmountUSD || 0), 0);
  const escrowPending = totalGross - clearedGross;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Concession Revenue & Settlement Payouts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Escrow Direct Clearing
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit-grade concession contract earnings, cross-border currency disbursements, and settlement escrow releases.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Cumulative Contract Value"
          value={`$${totalGross.toLocaleString()}`}
          subValue="Across all active flight contracts"
          icon={DollarSign}
        />
        <KPICard
          label="Cleared Escrow Settlements"
          value={`$${clearedGross.toLocaleString()}`}
          subValue={`${approvedBookings.length} confirmed flights`}
          icon={CheckCircle2}
          trend={{ value: 'Released to Bank', isPositive: true }}
        />
        <KPICard
          label="Pending Contract Settlement"
          value={`$${escrowPending.toLocaleString()}`}
          subValue="Pending milestone verification"
          icon={Lock}
        />
      </div>

      {/* Settlements Table */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#eae7e1] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716]">Escrow Payout Settlement Orders</h3>
            <span className="text-xs text-zinc-400">{bookings.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Concession Asset</th>
                  <th className="py-3 px-3">Advertiser / Agency</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Flight Dates</th>
                  <th className="py-3 px-4 text-right">Settlement Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {bookings.map((bkg: any) => (
                  <tr key={bkg.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">{bkg.billboardName}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-zinc-800">{bkg.brand}</span>
                      <span className="text-[10px] text-zinc-400 block">{bkg.agencyName}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={bkg.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {new Date(bkg.startDate).toLocaleDateString()} – {new Date(bkg.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#181716]">
                      ${bkg.totalAmountUSD.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
