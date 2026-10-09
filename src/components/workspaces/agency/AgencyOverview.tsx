import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { StatusBadge } from '../../shared/StatusBadge';
import { KPISkeleton } from '../../shared/LoadingSkeleton';

interface AgencyOverviewProps {
  onNavigateTab: (tabId: string, params?: any) => void;
  onOpenCampaignDetail?: (campaignId: string) => void;
}

export const AgencyOverview: React.FC<AgencyOverviewProps> = ({
  onNavigateTab,
  onOpenCampaignDetail,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agency/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load agency overview');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
        <h3 className="font-bold text-red-900 text-sm">Failed to Load Agency Command Center</h3>
        <p className="text-xs text-red-700">{error}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const healthCounts = data?.healthCounts || { Healthy: 0, 'Needs Attention': 0, 'At Risk': 0, Critical: 0 };
  const attentionItems = data?.attentionItems || [];
  const recentCampaigns = data?.recentCampaigns || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time pan-African campaign pacing, verification rates, field health, and treasury overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('inventory')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-[#ef5a24] shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Inventory</span>
          </button>
          <button
            onClick={fetchOverview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <span>All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary 4 Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Active Campaigns"
          value={`${kpis.activeCampaignsCount || 0}`}
          subValue={`${kpis.totalCampaignsCount || 0} total on platform`}
          icon={Layers}
          onClick={() => onNavigateTab('campaigns')}
        />
        <KPICard
          label="Client Billed Revenue"
          value={`$${(kpis.totalRevenueUSD || 0).toLocaleString()}`}
          subValue={`Est. Profit: $${(kpis.estimatedProfitUSD || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: '100% Escrow Protected', isPositive: true }}
          onClick={() => onNavigateTab('finance')}
        />
        <KPICard
          label="Live Network Locations"
          value={`${kpis.liveLocationsCount || 0}`}
          subValue={`${kpis.verificationRate || 100}% PoP verified`}
          icon={MapPin}
          onClick={() => onNavigateTab('operations')}
        />
        <KPICard
          label="Upcoming Flight Expiries"
          value={`${kpis.upcomingExpiriesCount || 0}`}
          subValue={`${kpis.openIssuesCount || 0} open field issues`}
          icon={Clock}
          badge={
            kpis.openIssuesCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            ) : undefined
          }
          onClick={() => onNavigateTab('renewals')}
        />
      </div>

      {/* Campaign Health Matrix & Breakdown */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#181716]">Fleet Health Distribution</h3>
            <p className="text-xs text-zinc-500">
              Aggregated across delivery pace, optical verification, sensor uptime, and contractor SLA compliance.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs font-semibold text-[#ef5a24] hover:underline self-start sm:self-auto"
          >
            Filter by health →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Healthy
            </span>
            <div className="text-2xl font-black text-emerald-950 mt-1">{healthCounts.Healthy || 0}</div>
            <p className="text-[10px] text-emerald-800 mt-0.5">Uptime &gt;98%, 0 block issues</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-xs text-amber-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Needs Attention
            </span>
            <div className="text-2xl font-black text-amber-950 mt-1">{healthCounts['Needs Attention'] || 0}</div>
            <p className="text-[10px] text-amber-800 mt-0.5">Minor inspection delay</p>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200">
            <span className="text-xs text-orange-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              At Risk
            </span>
            <div className="text-2xl font-black text-orange-950 mt-1">{healthCounts['At Risk'] || 0}</div>
            <p className="text-[10px] text-orange-800 mt-0.5">Sightline or sensor offline</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-xs text-rose-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Critical
            </span>
            <div className="text-2xl font-black text-rose-950 mt-1">{healthCounts.Critical || 0}</div>
            <p className="text-[10px] text-rose-800 mt-0.5">Immediate crew required</p>
          </div>
        </div>
      </div>

      {/* Actionable "Needs Attention" Center */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ef5a24]" />
            <h3 className="font-bold text-sm text-[#181716]">Needs Attention Action Center</h3>
          </div>
          <span className="text-xs text-zinc-500">
            {attentionItems.length} actionable item{attentionItems.length === 1 ? '' : 's'}
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#faf9f6] text-center border border-[#eae7e1]">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-xs text-[#181716]">All campaigns operating nominal</p>
            <p className="text-[11px] text-zinc-500">No open blockers, upcoming critical expiries, or unresolved field alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#eae7e1] border border-[#eae7e1] rounded-xl overflow-hidden bg-white">
            {attentionItems.map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f6] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.severity === 'critical'
                          ? 'bg-rose-600'
                          : item.severity === 'high'
                          ? 'bg-orange-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <h4 className="font-bold text-xs text-[#181716]">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 pl-4">{item.description}</p>
                </div>

                <button
                  onClick={() => {
                    if (item.targetRoute.includes('/campaigns/')) {
                      const id = item.targetRoute.split('/campaigns/')[1];
                      onOpenCampaignDetail?.(id);
                    } else if (item.targetRoute.includes('/operations')) {
                      onNavigateTab('operations');
                    } else {
                      onNavigateTab('renewals');
                    }
                  }}
                  className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Recent Campaigns Stream */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#181716]">Active High-Impact Campaigns</h3>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs font-semibold text-[#ef5a24] hover:underline"
          >
            View all ({kpis.totalCampaignsCount || 0}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#eae7e1] text-zinc-400 font-bold">
                <th className="pb-3 pl-2">Campaign & Brand</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Health</th>
                <th className="pb-3">Delivery Pace</th>
                <th className="pb-3">Verification</th>
                <th className="pb-3">Spend / Budget</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae7e1]">
              {recentCampaigns.map((cmp: any) => (
                <tr key={cmp.id} className="hover:bg-[#faf9f6] transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-bold text-[#181716]">{cmp.name}</div>
                    <div className="text-[10px] text-zinc-500">{cmp.brand}</div>
                  </td>
                  <td className="py-3 font-medium text-zinc-700">{cmp.clientName}</td>
                  <td className="py-3">
                    <StatusBadge status={cmp.status} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={cmp.health} />
                  </td>
                  <td className="py-3 font-semibold text-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.min(100, cmp.deliveryRate)}%` }}
                        />
                      </div>
                      <span>{cmp.deliveryRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-emerald-800">
                    {cmp.verificationRate}% verified
                  </td>
                  <td className="py-3 font-medium text-zinc-700">
                    ${cmp.spendUSD.toLocaleString()} / ${cmp.budgetUSD.toLocaleString()}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => onOpenCampaignDetail?.(cmp.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
