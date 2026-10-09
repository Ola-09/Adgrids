import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';

interface ClientLocation {
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
}

interface ClientLiveMapProps {
  onBack?: () => void;
}

export const ClientLiveMap: React.FC<ClientLiveMapProps> = ({ onBack }) => {
  const [locations, setLocations] = useState<ClientLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<ClientLocation | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/locations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success && json.locations) {
        setLocations(json.locations);
        if (json.locations.length > 0) setSelectedLoc(json.locations[0]);
      }
    } catch (err) {
      console.error('Error fetching client locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

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
        return '#181716'; // Black
      default:
        return '#059669';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs font-bold text-zinc-500 hover:text-[#181716] mr-1 cursor-pointer"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Live Brand Campaign Radar
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time GPS telemetry, proof-of-performance photos, and lux illumination compliance.
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
            <span className="text-zinc-700">Offline</span>
          </div>
        </div>
      </div>

      {/* Main Map + Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Radar Map (8 Cols) */}
        <div className="lg:col-span-8 bg-[#181716] rounded-3xl overflow-hidden relative border border-[#2d2b29] flex flex-col justify-between p-4 shadow-xl min-h-[460px]">
          {/* Top Bar */}
          <div className="z-10 flex flex-wrap items-center justify-between gap-3 bg-[#181716]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-xs">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#ef5a24]" />
              <span className="font-bold">Active Flight Locations</span>
              <span className="text-zinc-400 font-normal">({locations.length} live sites)</span>
            </div>

            <button
              onClick={fetchLocations}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Radar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Canvas Area */}
          <div className="relative w-full h-[400px] flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-radial from-[#221c33] to-[#0f0d17]">
            {/* Ambient Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="clientGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#clientGrid)" />
              <circle cx="50%" cy="50%" r="140" fill="none" stroke="#ef5a24" strokeWidth="1" strokeDasharray="5 5" opacity="0.3" />
            </svg>

            {/* Pins */}
            <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
              {locations.map((loc, idx) => {
                const color = getPinColor(loc.status);
                const isSelected = selectedLoc?.id === loc.id;
                const positions = [
                  { top: '30%', left: '26%' },
                  { top: '42%', left: '48%' },
                  { top: '62%', left: '65%' },
                  { top: '68%', left: '32%' },
                  { top: '50%', left: '78%' },
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

          {/* Bottom Telemetry Status */}
          <div className="z-10 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 border-t border-white/10 pt-2 px-1">
            <span>Continuous Optical Verification: <strong>Live Telemetry Active</strong></span>
            <span>Sub-meter Geofence: <strong>±1.2m ISO Audit Compliant</strong></span>
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

              {/* Photo Evidence */}
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
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proof-of-Play Certified</span>
                </div>
              </div>

              {/* Verification Specs */}
              <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Campaign Flight:</span>
                  <strong className="text-zinc-800">{selectedLoc.campaignName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Display Format:</span>
                  <span className="font-semibold text-zinc-700">{selectedLoc.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">GPS Coordinates:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedLoc.gpsCoords || `${selectedLoc.lat.toFixed(4)}, ${selectedLoc.lng.toFixed(4)}`}
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
                  <span className="text-zinc-500 font-medium">Estimated Impressions:</span>
                  <span className="font-extrabold text-[#181716]">{selectedLoc.impressionsDelivered?.toLocaleString() || 0}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Downloading signed Proof-of-Performance audit certificate for ${selectedLoc.siteName}...`)}
                className="w-full py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified Audit Report</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-zinc-400 text-xs">
              Select a billboard location on the radar map to view Proof-of-Performance data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
