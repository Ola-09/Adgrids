import React, { useEffect, useState } from 'react';
import { CheckCircle2, DollarSign, RefreshCw, Users, Wrench } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { KPICard } from '../../shared/KPICard';

export const AgencyVendors: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/vendors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const jobs = data?.jobs || [];
  const serviceGroups = data?.serviceGroups || [];
  const totalPayout = jobs.reduce((acc: number, j: any) => acc + (j.payoutUSD || 0), 0);
  const completedJobs = jobs.filter((j: any) => j.status === 'Completed').length;
  const completionRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Contractor & Vendor Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {jobs.length} Active Work Orders
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage Tier-1 fabrication specialists, grand-format printers, rigging teams, and installation SLAs.
          </p>
        </div>

        <button
          onClick={fetchVendors}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Contracted Work Orders"
          value={`${jobs.length}`}
          subValue={`${completedJobs} successfully executed`}
          icon={Wrench}
        />
        <KPICard
          label="Overall Job Completion Rate"
          value={`${completionRate}%`}
          subValue="Across all active campaigns"
          icon={CheckCircle2}
        />
        <KPICard
          label="Cumulative Vendor Payouts"
          value={`$${totalPayout.toLocaleString()}`}
          subValue="Escrow milestones released on PoP"
          icon={DollarSign}
        />
      </div>

      {/* Service Types Breakdown */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#181716]">Service Capability Allocation</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceGroups.map((grp: any) => (
            <div
              key={grp.serviceType}
              className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#181716]">{grp.serviceType}</h4>
                <span className="text-xs font-black text-emerald-800">
                  ${grp.totalPayoutUSD.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {grp.count} assigned orders • {grp.completedCount} completed
              </p>
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${grp.count > 0 ? (grp.completedCount / grp.count) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Jobs Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#eae7e1] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716]">All Contractor Work Orders</h3>
            <span className="text-xs text-zinc-400">{jobs.length} jobs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Site Location</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">{job.title}</td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{job.serviceType}</td>
                    <td className="py-3.5 px-3 text-zinc-600">{job.siteName}</td>
                    <td className="py-3.5 px-3 font-medium text-zinc-600">{job.assigneeName || 'Unassigned'}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#181716]">
                      ${job.payoutUSD.toLocaleString()}
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
