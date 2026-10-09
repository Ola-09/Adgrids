import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Eye,
  ShieldCheck,
  Calendar,
  Share2,
  Download,
  Search,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Clock,
  Radio,
  Maximize2,
} from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';
import { BILLBOARD_ASSETS, VERIFICATION_ITEMS } from '../../data/mockData';
import { ScreenId, VerificationItem } from '../../types';
import { useBillboards } from '../../context/BillboardContext';

interface Screen04Props {
  onNavigate: (screen: ScreenId) => void;
  onOpenProof: (item: VerificationItem) => void;
}

export const Screen04CustomerTracker: React.FC<Screen04Props> = ({ onNavigate, onOpenProof }) => {
  const [selectedMetro, setSelectedMetro] = useState<string>('LOS');
  const [siteFilter, setSiteFilter] = useState<'all' | 'digital' | 'static'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { billboards } = useBillboards();

  const billboardPins = useMemo(
    () => billboards.map((billboard) => ({
      id: billboard.id,
      name: billboard.name,
      x: 50,
      y: 50,
      lat: billboard.lat,
      lng: billboard.lng,
      status: billboard.status.toLowerCase().includes('alert') ? 'alert' as const : 'live' as const,
      code: billboard.id,
      type: billboard.format,
      client: billboard.client,
    })),
    [billboards]
  );

  const filteredAssets = BILLBOARD_ASSETS.filter((a) => {
    if (siteFilter === 'digital' && a.format !== 'Digital LED' && a.format !== 'Iconic 3D LED') return false;
    if (siteFilter === 'static' && a.format !== 'Static Unipole' && a.format !== 'Gantry Monolith') return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Client Portal Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7e1] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#140338] text-white text-[10px] font-black uppercase tracking-wider">
              Live Client Transparency Portal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active • 248 of 248 Sites Verified
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-[#140338] tracking-tight">
            Safaricom Global – Pan-African 5G Launch & Festive Blitz (Q4)
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Independent, real-time proof-of-play dashboard. Zero latency visual confirmation and IoT sensor feed.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('White-label client link copied to clipboard: https://live.adgrid.cloud/c/safaricom-q4')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#eae7e1] hover:bg-zinc-50 rounded-xl text-xs font-bold text-[#140338] shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>Share White-Label Link</span>
          </button>

          <button
            onClick={() => alert('Exporting full client compliance pack (PDF)...')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 rounded-xl text-xs font-black text-[#140338] shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Compliance Pack (PDF)</span>
          </button>
        </div>
      </div>

      {/* 4 TRANSPARENCY KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Verified Sites</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              248 Active
            </span>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">100% Verified Uptime</span>
              <span className="text-zinc-600 font-semibold">0 Sites Offline</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Impressions Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              68,420,000
            </span>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-600">14.2M Weekly Pace</span>
              <span className="text-emerald-700 font-bold">+8.4% above pacing</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Proof-of-Play Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              99.8% Match
            </span>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-600">3,410 Photos Audited</span>
              <span className="text-emerald-700 font-bold">Real-time Optical AI</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Active Campaign Flight</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              Day 18 of 45
            </span>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-600">40% Completed</span>
              <span className="text-zinc-600">Ends Nov 30 • On Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAP & SITE DIRECTORY SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Interactive Fleet View
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Live Corridor Telemetry & Site Map
              </h3>
            </div>

            {/* Metro selector pills */}
            <div className="flex items-center gap-1 bg-[#f4f3f0] p-0.5 rounded-xl text-xs font-bold">
              {[
                { code: 'LOS', label: 'Lagos, NG (84)' },
                { code: 'NBO', label: 'Nairobi, KE (68)' },
                { code: 'JNB', label: 'Johannesburg, ZA (52)' },
                { code: 'ACC', label: 'Accra, GH (28)' },
              ].map((m) => (
                <button
                  key={m.code}
                  onClick={() => setSelectedMetro(m.code)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedMetro === m.code ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Live GPS tracking with real-time screen status, illumination sensors, and verified field captures.
          </p>

          <InteractiveMap
            metroName={selectedMetro === 'NBO' ? 'Nairobi' : selectedMetro === 'JNB' ? 'Johannesburg' : 'Lagos'}
            corridorName="Key Arterial Corridors & Highways"
            selectedPinId="LOS-VI-088"
            pins={billboardPins}
            onSelectPin={(id) => {
              const item = VERIFICATION_ITEMS.find((v) => v.siteId === id) || VERIFICATION_ITEMS[0];
              onOpenProof(item);
            }}
            heightClass="h-[420px]"
          />
        </div>

        {/* Right: Active Site Directory (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Active Site Directory
                </span>
                <h3 className="font-extrabold text-base text-[#140338]">
                  Lagos Hub Locations
                </h3>
              </div>
              <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                84 Sites
              </span>
            </div>

            {/* Search & Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter sites by street or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8f7f4] border border-[#eae7e1] rounded-xl focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex bg-[#f4f3f0] p-0.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSiteFilter('all')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    siteFilter === 'all' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                  }`}
                >
                  All (84)
                </button>
                <button
                  onClick={() => setSiteFilter('digital')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    siteFilter === 'digital' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                  }`}
                >
                  Digital (52)
                </button>
                <button
                  onClick={() => setSiteFilter('static')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    siteFilter === 'static' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                  }`}
                >
                  Static (32)
                </button>
              </div>
            </div>

            {/* List of Sites */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl border border-[#eae7e1] bg-[#faf9f6] hover:bg-white hover:border-zinc-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#140338] truncate">{asset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#140338] font-bold shrink-0">
                        {asset.format}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{asset.location}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                      <span className="font-bold text-emerald-700">99.8% Match</span>
                      <span>•</span>
                      <span>420K Impressions/wk</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onOpenProof({
                        id: asset.id,
                        siteId: asset.id,
                        siteName: asset.name,
                        flightRef: 'Safaricom 5G Launch',
                        agent: 'Field Auditor Dispatch',
                        timestamp: '14:28 WAT',
                        gpsCoords: `${asset.lat}° N, ${asset.lng}° E`,
                        matchPercent: asset.matchScore || 99.8,
                        lineOfSight: '100% Clear',
                        illuminationLux: 84000,
                        deadPixels: 0,
                        creativeFilename: 'Safaricom_Festive_5G.mp4',
                        imageUrl: asset.previewUrl,
                        status: 'Approved',
                        priority: 1,
                      })
                    }
                    className="shrink-0 p-2 rounded-lg bg-white border border-[#eae7e1] hover:bg-zinc-100 text-[#140338] font-bold text-xs flex items-center gap-1"
                  >
                    <span>View PoP</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#eae7e1] flex items-center justify-between text-xs">
            <span className="text-zinc-500">Audit SLA: <strong>100% Fulfilled</strong></span>
            <button
              onClick={() => alert('Downloading full site audit history...')}
              className="text-xs font-bold text-[#140338] hover:text-[#556500]"
            >
              Export CSV Telemetry →
            </button>
          </div>
        </div>
      </div>

      {/* PROOF-OF-PLAY AUDIT GALLERY */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
              Cryptographically Stamped Evidence
            </span>
            <h2 className="text-lg font-bold text-[#140338]">
              Verified Proof-of-Play Audit Gallery
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Every photo is cryptographically signed with GPS coordinates, timestamp, and computer vision match score.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button className="px-3 py-1.5 bg-[#140338] text-white rounded-xl font-bold shadow-2xs">
              Latest Captures
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700">
              Daylight Audits
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700">
              Night Illumination
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700">
              Angle Breakdown
            </button>
          </div>
        </div>

        {/* 4 Verification Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {VERIFICATION_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#eae7e1] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-black group">
                  <img
                    src={item.imageUrl}
                    alt={item.siteName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white text-[#140338] text-[9px] font-black uppercase">
                    {item.matchPercent}% Match
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-white text-[9px] font-mono flex justify-between">
                    <span>{item.timestamp}</span>
                    <span className="text-white">GPS Verified</span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="font-extrabold text-sm text-[#140338] leading-snug">{item.siteName}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono">{item.gpsCoords}</p>
                  <p className="text-[11px] text-zinc-600 font-medium">Auditor: {item.agent}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onOpenProof(item)}
                  className="w-full py-2 bg-[#f4f3f0] hover:bg-[#140338] hover:text-white rounded-xl text-xs font-bold text-[#140338] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Inspection</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLIENT TRANSPARENCY GUARANTEE BANNER */}
      <div className="bg-[#140338] text-white rounded-2xl p-6 shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] font-extrabold uppercase tracking-wider">
            SLA Commitment
          </span>
          <h3 className="text-xl font-extrabold text-white">Client Transparency Guarantee</h3>
          <p className="text-xs text-zinc-300 max-w-xl">
            Real-time, unedited field telemetry with zero latency. Every proof is backed by our ISO 20560 audited escrow disbursement schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => alert('Exporting complete raw telemetry logs in CSV...')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
          >
            Download Full Raw Telemetry (CSV)
          </button>
          <button
            onClick={() => alert('Opening scheduler for client agency review...')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 text-xs font-black transition-colors"
          >
            Schedule Agency Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
