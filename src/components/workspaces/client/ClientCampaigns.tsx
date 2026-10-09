import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface ClientCampaignsProps {
  onOpenLiveMap: () => void;
  onOpenCampaignDetail?: (id: string) => void;
}

export const ClientCampaigns: React.FC<ClientCampaignsProps> = ({
  onOpenLiveMap,
  onOpenCampaignDetail,
}) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching client campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Contracted Advertising Campaigns
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              {campaigns.length} Active Flights
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Transparent flight pacing, optical verification audits, site locations, and certified delivery reports.
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
            onClick={onOpenLiveMap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>View All on Live Radar</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No campaigns found for your brand account.
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#dcd7ce] transition-colors"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-[#181716]">{c.name}</h3>
                  <StatusBadge status={c.status} />
                  <StatusBadge status={c.health} />
                </div>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  Brand: <strong className="text-zinc-800">{c.brand}</strong> • Flight Dates:{' '}
                  <span className="font-semibold text-zinc-700">
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                  </span>{' '}
                  • {c.locations?.length || 0} contracted billboard locations
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="text-zinc-500">
                    Target Impressions: <strong className="text-zinc-800">{c.targetImpressions?.toLocaleString() || 'N/A'}</strong>
                  </span>
                  <span className="text-zinc-500">
                    Flight Code: <code className="font-mono text-zinc-700 font-semibold">{c.id}</code>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs border-t lg:border-t-0 pt-3 lg:pt-0 border-[#eae7e1]">
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase tracking-wider">
                    Pacing Delivery
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-zinc-900">{c.deliveryRate}%</span>
                    <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, c.deliveryRate)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase tracking-wider">
                    Verification
                  </span>
                  <span className="text-base font-black text-emerald-800 mt-0.5 block">
                    {c.verificationRate}% PoP
                  </span>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase tracking-wider">
                    Media Investment
                  </span>
                  <span className="text-base font-black text-[#181716] mt-0.5 block">
                    ${c.spendUSD.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Generating certified Proof-of-Play flight report for ${c.name}...`)}
                    className="p-2.5 rounded-xl border border-[#eae7e1] hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
                    title="Download Certified Flight Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenLiveMap}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Radar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
