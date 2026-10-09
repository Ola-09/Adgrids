import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  RefreshCw,
  Wrench,
} from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface VendorOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenJobDetail?: (job: any) => void;
}

export const VendorOverview: React.FC<VendorOverviewProps> = ({
  onNavigateTab,
  onOpenJobDetail,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
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
      console.error('Error fetching vendor overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = data?.kpis || {};
  const jobs = data?.jobs || [];
  const urgentJobs = jobs.filter(
    (j: any) => j.status !== 'Completed'
  ).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Contractor & Fabrication Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Active Dispatch
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            What jobs do I need to complete? Immediate work orders, deadlines, rigging milestones, and payout settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOverview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>All Work Orders</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs: Assigned, Due Today, Overdue, Completed, Earnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Assigned Work Orders"
          value={`${kpis.assignedJobsCount || 0}`}
          subValue={`${kpis.dueTodayCount || 0} due today`}
          icon={Wrench}
          onClick={() => onNavigateTab('jobs')}
        />
        <KPICard
          label="Critical / Overdue Jobs"
          value={`${kpis.overdueCount || 0}`}
          subValue="Immediate site crew required"
          icon={AlertTriangle}
          badge={
            kpis.overdueCount > 0 ? (
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">Urgent</span>
            ) : undefined
          }
          onClick={() => onNavigateTab('jobs')}
        />
        <KPICard
          label="Completed Executions"
          value={`${kpis.completedCount || 0}`}
          subValue="100% verified with photo proof"
          icon={CheckCircle2}
          trend={{ value: 'SLA Met', isPositive: true }}
        />
        <KPICard
          label="Cumulative Earnings"
          value={`$${(kpis.totalEarningsUSD || 0).toLocaleString()}`}
          subValue="Released on verified completion"
          icon={DollarSign}
          onClick={() => onNavigateTab('earnings')}
        />
      </div>

      {/* Actionable "What Should I Do Next?" Task Stream */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#181716]">Active Priority Work Orders</h3>
            <p className="text-xs text-zinc-500">
              Orders requiring print production, mounting, or lighting maintenance.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="text-xs font-semibold text-[#ef5a24] hover:underline"
          >
            View all ({jobs.length}) →
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : urgentJobs.length === 0 ? (
          <div className="p-8 text-center bg-[#faf9f6] rounded-xl border border-[#eae7e1] text-xs text-zinc-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            No pending or overdue work orders. Great job!
          </div>
        ) : (
          <div className="divide-y divide-[#eae7e1] border border-[#eae7e1] rounded-xl overflow-hidden">
            {urgentJobs.map((job: any) => (
              <div
                key={job.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="font-black text-xs text-[#181716]">{job.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Location: <strong>{job.siteName}</strong> ({job.location}) • Service:{' '}
                    <span className="font-medium text-zinc-700">{job.serviceType}</span>
                  </p>
                  {job.instructions && (
                    <p className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                      “{job.instructions}”
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold block text-[10px]">Deadline</span>
                    <span className="font-bold text-zinc-800">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold block text-[10px]">Payout</span>
                    <span className="font-black text-[#181716]">${job.payoutUSD.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenJobDetail) onOpenJobDetail(job);
                      else onNavigateTab('jobs');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#181716] hover:bg-zinc-800 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Update Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
