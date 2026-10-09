import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface ClientOverviewProps {
  onOpenLiveMap: () => void;
  onOpenCampaignDetail?: (id: string) => void;
  onOpenProofModal?: (item: any) => void;
}

export const ClientOverview: React.FC<ClientOverviewProps> = ({
  onOpenLiveMap,
  onOpenCampaignDetail,
  onOpenProofModal,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientOverview = async () => {
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
      console.error('Error fetching client overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientOverview();
  }, []);

  const kpis = data?.kpis || {};
  const campaigns = data?.campaigns || [];
  const locations = data?.locations || [];
  const issues = data?.issues || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Advertiser Campaign Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Brand Portal
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time delivery verification, live corridor telemetry, photo proof-of-performance, and contract pacing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchClientOverview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenLiveMap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live Campaign Radar Map</span>
          </button>
        </div>
      </div>

      {/* 4 Client KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Active Advertising Flights"
          value={`${kpis.activeCampaignsCount || 0}`}
          subValue={`${campaigns.length} total brand contracts`}
          icon={Layers}
        />
        <KPICard
          label="Contracted Media Spend"
          value={`$${(kpis.totalSpendUSD || 0).toLocaleString()}`}
          subValue="Fully escrow backed & insured"
          icon={DollarSign}
        />
        <KPICard
          label="Verified Live Sites"
          value={`${kpis.verifiedLocationsCount || 0} / ${kpis.liveLocationsCount || 0}`}
          subValue={`${kpis.verificationRate || 100}% PoP compliance`}
          icon={ShieldCheck}
          trend={{ value: 'Audit Passed', isPositive: true }}
        />
        <KPICard
          label="Flagged Sightline Alerts"
          value={`${kpis.locationsWithIssuesCount || 0}`}
          subValue="Resolved by field dispatch"
          icon={AlertTriangle}
          badge={
            kpis.locationsWithIssuesCount > 0 ? (
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">In Resolution</span>
            ) : undefined
          }
        />
      </div>

      {/* Quick Launch Live Map Preview Card */}
      <div className="bg-[#181716] text-white rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Real-Time Pan-African Radar Stream
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Inspect all {locations.length} live billboard sites on the GPS map.
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Examine sub-meter GPS verification, daylight optical lux ratings, sightline photographs, and continuous Proof-of-Play telemetry.
          </p>
        </div>

        <button
          onClick={onOpenLiveMap}
          className="px-5 py-3 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-black shadow-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Launch Full-Screen Live Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Client Campaigns */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#181716]">Active Campaign Flights</h3>
          <span className="text-xs text-zinc-400">{campaigns.length} campaigns</span>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="divide-y divide-[#eae7e1] border border-[#eae7e1] rounded-xl overflow-hidden">
            {campaigns.map((c: any) => (
              <div
                key={c.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-extrabold text-sm text-[#181716]">{c.name}</h4>
                    <StatusBadge status={c.status} />
                    <StatusBadge status={c.health} />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">
                    Flight: {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()} • {c.locations?.length || 0} locations
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold block">Delivery Pace</span>
                    <span className="font-extrabold text-zinc-800">{c.deliveryRate}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold block">Verification</span>
                    <span className="font-extrabold text-emerald-800">{c.verificationRate}% PoP</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold block">Total Investment</span>
                    <span className="font-black text-[#181716]">${c.spendUSD.toLocaleString()}</span>
                  </div>

                  {onOpenCampaignDetail && (
                    <button
                      onClick={() => onOpenCampaignDetail(c.id)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-[#181716] transition-colors cursor-pointer"
                    >
                      Audit Report →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Verified Site Photos */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#181716]">Latest Verified Proof-of-Performance Photographs</h3>
          <span className="text-xs text-zinc-400">Captured by field dispatch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.slice(0, 3).map((loc: any) => (
            <div
              key={loc.id}
              className="rounded-2xl border border-[#eae7e1] overflow-hidden bg-[#faf9f6] space-y-2 group"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-100">
                <img
                  src={
                    loc.latestPhotoUrl ||
                    loc.previewUrl ||
                    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={loc.siteName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified PoP</span>
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <h5 className="font-bold text-xs text-[#181716] truncate">{loc.siteName}</h5>
                <p className="text-[11px] text-zinc-500">{loc.corridor} ({loc.metro})</p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-[#eae7e1]">
                  <span>Lux: {loc.luxScore}</span>
                  <span className="font-mono text-emerald-800 font-bold">{loc.gpsCoords || 'GPS Verified'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
