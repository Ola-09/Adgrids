import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Download, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { KPICard } from '../../shared/KPICard';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const AgencyFinance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/finance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching finance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const summary = data?.summary || {};
  const invoices = data?.invoices || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Treasury & Financial Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Multi-Currency Escrow
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Commercial billing, concessionaire payouts, production cost accounting, and gross profit breakdown.
          </p>
        </div>

        <button
          onClick={fetchFinance}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Finance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Total Invoiced to Clients"
          value={`$${(summary.totalBilledUSD || 0).toLocaleString()}`}
          subValue={`$${(summary.receivedUSD || 0).toLocaleString()} cleared`}
          icon={ArrowDownLeft}
        />
        <KPICard
          label="Outstanding Balances"
          value={`$${(summary.outstandingUSD || 0).toLocaleString()}`}
          subValue="Due in upcoming billing cycles"
          icon={FileText}
          trend={{ value: 'Escrow Backed', isPositive: true }}
        />
        <KPICard
          label="Media & Vendor Costs"
          value={`$${((summary.mediaCosts || 0) + (summary.vendorCosts || 0)).toLocaleString()}`}
          subValue={`Media: $${(summary.mediaCosts || 0).toLocaleString()} • Ops: $${(summary.vendorCosts || 0).toLocaleString()}`}
          icon={ArrowUpRight}
        />
        <KPICard
          label="Estimated Gross Profit"
          value={`$${(summary.estimatedProfit || 0).toLocaleString()}`}
          subValue="Net of direct media & production"
          icon={DollarSign}
        />
      </div>

      {/* Profitability Calculation Equation Card */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-[#181716]">Transparent Agency Profit Equation</h3>
        <p className="text-xs text-zinc-500">Calculated strictly from audited transaction balances in the platform ledger.</p>

        <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-zinc-500 font-semibold block">Client Revenue</span>
            <span className="text-base font-extrabold text-[#181716]">${(summary.totalBilledUSD || 0).toLocaleString()}</span>
          </div>

          <span className="text-zinc-400 font-black text-base">−</span>

          <div className="space-y-0.5">
            <span className="text-zinc-500 font-semibold block">Media Concession Costs</span>
            <span className="text-base font-extrabold text-zinc-700">${(summary.mediaCosts || 0).toLocaleString()}</span>
          </div>

          <span className="text-zinc-400 font-black text-base">−</span>

          <div className="space-y-0.5">
            <span className="text-zinc-500 font-semibold block">Contractor Production</span>
            <span className="text-base font-extrabold text-zinc-700">${(summary.vendorCosts || 0).toLocaleString()}</span>
          </div>

          <span className="text-zinc-400 font-black text-base">=</span>

          <div className="space-y-0.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-800 font-bold block">Gross Profit</span>
            <span className="text-lg font-black text-emerald-950">${(summary.estimatedProfit || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#eae7e1] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716]">Agency Invoices & Settlement Orders</h3>
            <span className="text-xs text-zinc-400">{invoices.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Party Organization</th>
                  <th className="py-3 px-3">Description Summary</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#181716]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-3 font-bold text-zinc-800">{inv.clientName}</td>
                    <td className="py-3.5 px-3 text-zinc-600 max-w-xs truncate">{inv.itemsSummary || 'Campaign Flight Services'}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#181716]">
                      ${inv.amountUSD.toLocaleString()}
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
