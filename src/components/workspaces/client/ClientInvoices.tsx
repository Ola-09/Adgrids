import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, CheckCircle2, Clock, Download, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { KPICard } from '../../shared/KPICard';

export const ClientInvoices: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching client invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const invoices = data?.invoices || [];
  const totalInvoiced = invoices.reduce((acc: number, inv: any) => acc + (inv.amountUSD || 0), 0);
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'Paid');
  const paidTotal = paidInvoices.reduce((acc: number, inv: any) => acc + (inv.amountUSD || 0), 0);
  const pendingTotal = totalInvoiced - paidTotal;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Invoices & Media Billing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Escrow Guaranteed
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit-grade flight billing records, escrow milestone receipts, and payment receipts.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Billed Media"
          value={`$${totalInvoiced.toLocaleString()}`}
          subValue="Audited flight billings"
          icon={ArrowDownLeft}
        />
        <KPICard
          label="Cleared Escrow Payments"
          value={`$${paidTotal.toLocaleString()}`}
          subValue={`${paidInvoices.length} invoices cleared`}
          icon={CheckCircle2}
          trend={{ value: '100% Settled', isPositive: true }}
        />
        <KPICard
          label="Pending Payment"
          value={`$${pendingTotal.toLocaleString()}`}
          subValue="Upcoming milestone disbursements"
          icon={Clock}
        />
      </div>

      {/* Invoices Table */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No billing records available for this account.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Description / Summary</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#181716]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-3 font-medium text-zinc-700">{inv.itemsSummary || 'OOH Campaign Flight'}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#181716]">
                      ${inv.amountUSD.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading verified PDF receipt for invoice ${inv.invoiceNumber}...`)}
                        className="p-1.5 rounded-lg border border-[#eae7e1] hover:bg-zinc-100 text-zinc-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Download PDF Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">PDF</span>
                      </button>
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
