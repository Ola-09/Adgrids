import React, { useEffect, useState } from 'react';
import { CheckCircle2, DollarSign, Download, Lock, RefreshCw, Wrench } from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { StatusBadge } from '../../shared/StatusBadge';

export const VendorEarnings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendor/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching vendor earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const jobs = data?.jobs || [];
  const completed = jobs.filter((j: any) => j.status === 'Completed');
  const earnedUSD = completed.reduce((acc: number, j: any) => acc + (j.payoutUSD || 0), 0);
  const inEscrowUSD = jobs
    .filter((j: any) => j.status !== 'Completed')
    .reduce((acc: number, j: any) => acc + (j.payoutUSD || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Contractor Payouts & Escrow Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Guaranteed Milestone Release
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Verified work order receipts, released milestone settlements, and upcoming pending disbursements.
          </p>
        </div>

        <button
          onClick={fetchEarnings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Cleared Earnings"
          value={`$${earnedUSD.toLocaleString()}`}
          subValue={`${completed.length} completed work orders`}
          icon={CheckCircle2}
          trend={{ value: 'Released to Bank', isPositive: true }}
        />
        <KPICard
          label="In-Progress Escrow Balance"
          value={`$${inEscrowUSD.toLocaleString()}`}
          subValue="Funds held pending completion proof"
          icon={Lock}
        />
        <KPICard
          label="Total Contracted Value"
          value={`$${(earnedUSD + inEscrowUSD).toLocaleString()}`}
          subValue="Across all assigned orders"
          icon={DollarSign}
        />
      </div>

      {/* Payouts Table */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#eae7e1] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716]">Work Order Disbursement Records</h3>
            <span className="text-xs text-zinc-400">{jobs.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Site Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-4 text-right">Fee ($ USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {jobs.map((j: any) => (
                  <tr key={j.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">{j.title}</td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{j.serviceType}</td>
                    <td className="py-3.5 px-3 text-zinc-600">{j.siteName}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {new Date(j.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#181716]">
                      ${j.payoutUSD.toLocaleString()}
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
