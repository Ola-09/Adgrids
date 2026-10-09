import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';

interface LocationPin {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  brand: string;
  siteName: string;
  billboardId?: string;
  metro: string;
  corridor: string;
  format: string;
  lat: number;
  lng: number;
  status: 'Live' | 'Verified' | 'Pending' | 'Issue' | 'Offline' | string;
  healthScore: number;
  previewUrl?: string;
  latestPhotoUrl?: string;
  luxScore: number;
  gpsCoords?: string;
  verifiedAt?: string;
  impressionsDelivered: number;
  issueHistory?: string;
}

interface AgencyCampaignMapProps {
  onBack?: () => void;
  onOpenCampaignDetail?: (id: string) => void;
}

export const AgencyCampaignMap: React.FC<AgencyCampaignMapProps> = ({
  onBack,
  onOpenCampaignDetail,
}) => {
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<LocationPin | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/operations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success && json.operations?.locations) {
        const mapped = json.operations.locations.map((l: any) => ({
          ...l,
          campaignName: l.campaign?.name || 'Campaign Flight',
          clientName: l.campaign?.clientName || 'Enterprise Advertiser',
          brand: l.campaign?.brand || 'Brand',
          issueHistory: l.status === 'Issue' ? 'Tree greenery overhanging top 15% sightline.' : '0 historical obstructions.',
        }));
        setLocations(mapped);
        if (mapped.length > 0) setSelectedLoc(mapped[0]);
      }
    } catch (err) {
      console.error('Error fetching map locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter((loc) => {
    if (filterStatus === 'ALL') return true;
    return loc.status === filterStatus;
  });

  const getPinColor = (status: string) => {
    switch (status) {
      case 'Verified':
      case 'Live':
        return '#059669'; // Green
      case 'Pending':
        return '#d97706'; // Yellow/Amber
      case 'Issue':
        return '#dc2626'; // Red
      case 'Offline':
      case 'Expired':
        return '#181716'; // Black/Dark
      default:
        return '#059669';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Map Key */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs font-bold text-zinc-500 hover:text-[#181716] mr-1"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Operational Campaign Flight Map
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Geofenced Proof-of-Play telemetry, optical inspection verification, and live site sightline monitor.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white px-3 py-2 rounded-xl border border-[#eae7e1] shadow-2xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span className="text-zinc-700">Verified / Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span className="text-zinc-700">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
            <span className="text-zinc-700">Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#181716]" />
            <span className="text-zinc-700">Offline / Expired</span>
          </div>
        </div>
      </div>

      {/* Main Map + Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Interactive Map Visual Area (8 Cols) */}
        <div className="lg:col-span-8 bg-[#181716] rounded-3xl overflow-hidden relative border border-[#2d2b29] flex flex-col justify-between p-4 shadow-xl min-h-[460px]">
          {/* Overlay Top Bar */}
          <div className="z-10 flex flex-wrap items-center justify-between gap-3 bg-[#181716]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-xs">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#ef5a24]" />
              <span className="font-bold">African Corridors Optical Radar</span>
              <span className="text-zinc-400 font-normal">({filtered.length} locations mapped)</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="ALL" className="bg-[#181716]">All Statuses</option>
                <option value="Verified" className="bg-[#181716]">Verified</option>
                <option value="Live" className="bg-[#181716]">Live</option>
                <option value="Issue" className="bg-[#181716]">Issue</option>
                <option value="Offline" className="bg-[#181716]">Offline</option>
              </select>

              <button
                onClick={fetchLocations}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Refresh Map"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulated Tactical SVG Geofence Canvas */}
          <div className="relative w-full h-[400px] flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-radial from-[#2a2438] to-[#120f1a]">
            {/* Ambient Map Grids & Corridors */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Telemetry corridor flight paths */}
              <path d="M 80 180 Q 240 120 420 220 T 700 300" fill="none" stroke="#ef5a24" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 120 320 Q 300 240 500 160 T 680 100" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Interactive Pins */}
            <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
              {filtered.map((loc, idx) => {
                const color = getPinColor(loc.status);
                const isSelected = selectedLoc?.id === loc.id;

                // Deterministic visual layout based on index
                const positions = [
                  { top: '28%', left: '22%' },
                  { top: '35%', left: '42%' },
                  { top: '55%', left: '68%' },
                  { top: '65%', left: '34%' },
                  { top: '48%', left: '80%' },
                  { top: '72%', left: '55%' },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    style={{ position: 'absolute', top: pos.top, left: pos.left }}
                    className={`group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ${
                          isSelected ? 'ring-4 ring-[#ef5a24] animate-bounce' : ''
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>

                      <div
                        className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-md transition-all ${
                          isSelected
                            ? 'bg-[#ef5a24] text-white'
                            : 'bg-white text-zinc-900 group-hover:bg-zinc-100'
                        }`}
                      >
                        {loc.siteName.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="z-10 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 border-t border-white/10 pt-2 px-1">
            <span>Sub-meter geofence accuracy: <strong>±1.2m</strong></span>
            <span>Daylight Lux Calibration: <strong>Active ISO-17025</strong></span>
          </div>
        </div>

        {/* Detailed Inspection Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#eae7e1] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          {selectedLoc ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#eae7e1]">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedLoc.status} />
                    <span className="text-[10px] text-zinc-400 font-mono">{selectedLoc.billboardId || selectedLoc.id}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#181716] mt-1">{selectedLoc.siteName}</h3>
                  <p className="text-xs text-zinc-500">{selectedLoc.corridor} ({selectedLoc.metro})</p>
                </div>
              </div>

              {/* Latest Photograph Evidence */}
              <div className="relative rounded-2xl overflow-hidden border border-[#eae7e1] bg-zinc-100 aspect-video">
                <img
                  src={
                    selectedLoc.latestPhotoUrl ||
                    selectedLoc.previewUrl ||
                    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={selectedLoc.siteName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Optical Verification Live</span>
                </div>
              </div>

              {/* Technical Inspection Attributes */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Assigned Campaign:</span>
                    <strong className="text-zinc-800">{selectedLoc.campaignName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Client / Brand:</span>
                    <span className="font-bold text-zinc-700">{selectedLoc.clientName} ({selectedLoc.brand})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Format:</span>
                    <span className="font-semibold text-zinc-700">{selectedLoc.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">GPS Geofence:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {selectedLoc.gpsCoords || `${selectedLoc.lat.toFixed(4)}° N, ${selectedLoc.lng.toFixed(4)}° E`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Daylight Illumination:</span>
                    <span className="font-bold text-zinc-800 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {selectedLoc.luxScore} Lux
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Impressions Delivered:</span>
                    <span className="font-extrabold text-[#181716]">{selectedLoc.impressionsDelivered?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Sightline & Issue History */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    selectedLoc.status === 'Issue'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedLoc.status === 'Issue' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Sightline & Inspection History:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-5">{selectedLoc.issueHistory}</p>
                </div>
              </div>

              {/* Action Button */}
              {onOpenCampaignDetail && (
                <button
                  onClick={() => onOpenCampaignDetail(selectedLoc.campaignId)}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#181716] text-xs font-bold transition-colors cursor-pointer"
                >
                  Open Campaign Flight Details →
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-zinc-400 text-xs">
              Select a pin on the radar map to inspect live optical verification details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
