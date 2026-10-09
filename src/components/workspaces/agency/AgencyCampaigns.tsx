import React, { useEffect, useState } from 'react';
import {
  ArrowUpDown,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { EmptyState } from '../../shared/EmptyState';

interface AgencyCampaignsProps {
  onOpenCampaignDetail: (campaignId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const AgencyCampaigns: React.FC<AgencyCampaignsProps> = ({
  onOpenCampaignDetail,
  onNavigateTab,
}) => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (healthFilter !== 'ALL') params.append('health', healthFilter);

      const res = await fetch(`/api/agency/campaigns?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, healthFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Campaign Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {campaigns.length} Flights
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Operational flight pacing, optical verification rates, contracted budgets, and renewals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCampaigns}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('marketplace')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign flight, client brand, or corridor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          >
            <option value="ALL">All Flight Statuses</option>
            <option value="Active">Active</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          >
            <option value="ALL">All Health Ratings</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="At Risk">At Risk</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description="Try adjusting your search terms or filters, or launch a new campaign from the marketplace."
          actionText="Browse Inventory"
          onAction={() => onNavigateTab('marketplace')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Campaign Flight</th>
                  <th className="py-3 px-3">Client & Brand</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Health</th>
                  <th className="py-3 px-3">Locations</th>
                  <th className="py-3 px-3">Pacing Delivery</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Spend / Budget</th>
                  <th className="py-3 px-3">Flight Dates</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onOpenCampaignDetail(c.id)}
                    className="hover:bg-[#faf9f6] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-[#181716] group-hover:text-[#ef5a24] transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{c.id}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-800">{c.clientName}</div>
                      <div className="text-[11px] text-zinc-500">{c.brand}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.health} />
                    </td>

                    <td className="py-3.5 px-3 font-bold text-zinc-700">
                      {c._count?.locations || 0} sites
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                          <span>{c.deliveryRate}%</span>
                        </div>
                        <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${Math.min(100, c.deliveryRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-emerald-800">
                      {c.verificationRate}% PoP
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#181716]">${c.spendUSD.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-400">of ${c.budgetUSD.toLocaleString()}</div>
                    </td>

                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {new Date(c.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(c.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenCampaignDetail(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-xs transition-colors"
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
      )}
    </div>
  );
};
