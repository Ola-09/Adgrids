import React, { useState } from 'react';
import {
  Send,
  Wrench,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ArrowRight,
  Radio,
  Battery,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
} from 'lucide-react';
import { BILLBOARD_ASSETS, FIELD_AGENTS, METROS } from '../../data/mockData';
import { ScreenId, VerificationItem } from '../../types';

interface Screen01Props {
  onNavigate: (screen: ScreenId) => void;
  onOpenProof: (item: VerificationItem) => void;
}

export const Screen01OperationsCenter: React.FC<Screen01Props> = ({ onNavigate, onOpenProof }) => {
  const [selectedMetro, setSelectedMetro] = useState<string>('LOS');
  const [pipelineStage, setPipelineStage] = useState<string>('all');
  const [qaApproved, setQaApproved] = useState<boolean>(false);

  const mockQaItem: VerificationItem = {
    id: 'VER-003',
    siteId: 'LOS-LK-004',
    siteName: 'Lekki Toll Gate LED Spectacular',
    flightRef: 'Zenith Bank Fintech Q3 Launch (Creative Version 4B)',
    agent: 'Emeka Adeleke',
    timestamp: '14:28 WAT',
    gpsCoords: '6.4381° N, 3.4682° E',
    matchPercent: 99.8,
    lineOfSight: '100% Clear',
    illuminationLux: 84200,
    deadPixels: 0,
    creativeFilename: 'Zenith_Cardless_Q3.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    status: 'Pending',
    priority: 1,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
              Pan-African Operations Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              38 Flights Active • 428 Billboards Live
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Real-time multi-metro execution, automated audit streams, and IoT billboard display telemetrics.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#eae7e1] rounded-xl text-xs font-semibold text-[#140338] shadow-2xs hover:bg-[#faf9f6]">
              <span>Q3 Pan-African Flight (Aug - Oct)</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('screen-02')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#eae7e1] rounded-xl text-xs font-bold text-[#140338] hover:bg-[#faf9f6] transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-zinc-600" />
            <span>Dispatch Field Crew</span>
          </button>

          <button
            onClick={() => alert('Exporting ISO 20560 compliant audit pack (ZIP/PDF)...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#eae7e1] rounded-xl text-xs font-bold text-[#140338] hover:bg-[#faf9f6] transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Export Audit Pack</span>
          </button>
        </div>
      </div>

      {/* METRO RADAR ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-zinc-500 shrink-0 mr-1">
          METRO RADAR:
        </span>
        {METROS.map((metro) => (
          <button
            key={metro.code}
            onClick={() => setSelectedMetro(metro.code)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all shrink-0 ${
              selectedMetro === metro.code
                ? 'bg-[#140338] text-white border-[#140338] font-bold shadow-2xs'
                : 'bg-white text-zinc-700 border-[#eae7e1] hover:border-zinc-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedMetro === metro.code ? 'bg-white' : 'bg-emerald-500'}`} />
            <span className="font-bold">{metro.code}</span>
            <span className="text-zinc-600 font-medium">
              {metro.name} ({metro.sitesCount} Sites)
            </span>
          </button>
        ))}
      </div>

      {/* 4 PRIMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Active Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight block tnum">
              42 Active Flights
            </span>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +14% MoM
              </span>
              <span className="text-zinc-600">across 6 nations</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Billboard Jobs in Progress</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight block tnum">
              184 Sites
            </span>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-bold text-[#140338] bg-white px-2 py-0.5 rounded-full">
                92% on-schedule
              </span>
              <span className="text-zinc-600">print & mounting</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Verified Proof-of-Play</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight block tnum">
              98.4%
            </span>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                AI Vision Verified
              </span>
              <span className="text-zinc-600">GPS synchronized</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Gross Billing & Budget</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight block tnum">
              $1.42M
            </span>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full">
                84% burn rate
              </span>
              <span className="text-emerald-700 font-semibold">Healthy margin status</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE BILLBOARD OPERATIONS PIPELINE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#140338]">Live Billboard Operations Pipeline</h2>
            <p className="text-xs text-zinc-500">
              Tracking physical media production, logistics, deployment, and live screen health across all African clusters.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setPipelineStage('prep')}
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700 flex items-center gap-1.5"
            >
              <span>Site Prep</span>
              <span className="px-1.5 py-0.2 bg-zinc-100 rounded-md font-bold text-[11px]">18</span>
            </button>
            <button
              onClick={() => setPipelineStage('print')}
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700 flex items-center gap-1.5"
            >
              <span>Print & Logistics</span>
              <span className="px-1.5 py-0.2 bg-zinc-100 rounded-md font-bold text-[11px]">34</span>
            </button>
            <button
              onClick={() => setPipelineStage('mounting')}
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-[#eae7e1] rounded-xl text-zinc-700 flex items-center gap-1.5"
            >
              <span>Mounting & Tech</span>
              <span className="px-1.5 py-0.2 bg-zinc-100 rounded-md font-bold text-[11px]">27</span>
            </button>
            <button
              onClick={() => setPipelineStage('all')}
              className="px-3 py-1.5 bg-white text-[#140338] rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <span>Verified Live</span>
              <span className="px-1.5 py-0.2 bg-[#140338] text-white rounded-md font-bold text-[11px]">105</span>
            </button>
          </div>
        </div>

        {/* 4 Pipeline Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BILLBOARD_ASSETS.slice(0, 4).map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl p-4 border border-[#eae7e1] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#140338] text-[10px] font-extrabold uppercase">
                    {asset.format}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {asset.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-[#140338] leading-snug">{asset.name}</h3>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  {asset.metroName} • {asset.location}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 font-semibold">Client/Brand:</span>
                    <span className="font-bold text-[#140338] truncate ml-1">{asset.brand}</span>
                  </div>
                  {asset.sensorSignal && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-semibold">Sensor/Loop:</span>
                      <span className="font-bold text-emerald-700">{asset.sensorSignal} • {asset.fps} fps</span>
                    </div>
                  )}
                  {asset.playsCount && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-semibold">Proof-of-Play:</span>
                      <span className="font-bold text-[#140338]">{asset.playsCount}</span>
                    </div>
                  )}
                  {asset.illumination && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-semibold">Illumination:</span>
                      <span className="font-bold text-emerald-700">{asset.illumination}</span>
                    </div>
                  )}
                  {asset.fieldCrew && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-semibold">Field Crew:</span>
                      <span className="font-bold text-[#140338]">{asset.fieldCrew}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 font-medium">
                  Flight: {asset.flightId}
                </span>
                <button
                  onClick={() =>
                    onOpenProof({
                      id: asset.id,
                      siteId: asset.id,
                      siteName: asset.name,
                      flightRef: asset.flightName || asset.brand,
                      agent: 'Field Auditor Dispatch',
                      timestamp: 'Just now',
                      gpsCoords: `${asset.lat}° N, ${asset.lng}° E`,
                      matchPercent: asset.matchScore || 99.4,
                      lineOfSight: '100% Clear',
                      illuminationLux: asset.lux || 85000,
                      deadPixels: 0,
                      creativeFilename: 'Campaign_Master_Render.mp4',
                      imageUrl: asset.previewUrl,
                      status: 'Pending',
                      priority: 1,
                    })
                  }
                  className="text-xs font-bold text-[#140338] hover:text-[#556500] flex items-center gap-1 group"
                >
                  <span>Inspect Feed</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOWER 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Field Agents & Live Telemetry */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#140338]">Field Agents & Live Telemetry</h3>
                <p className="text-xs text-zinc-500">
                  28 active field personnel equipped with real-time GPS sync, high-res audit cameras, and cellular links.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#140338] text-xs font-black">
                28 Agents Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Emeka */}
              <div className="p-3.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#140338] text-white flex items-center justify-center font-bold text-xs">
                    EA
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#140338]">Emeka Adeleke</h4>
                    <p className="text-[11px] text-zinc-500">Lagos Metro (Lekki Corridor)</p>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="font-bold text-emerald-700 flex items-center justify-end gap-1">
                    <Radio className="w-3 h-3 text-emerald-600" /> 5G Sync
                  </span>
                  <span className="text-zinc-600 font-semibold">94% Batt • 18 Audits</span>
                </div>
              </div>

              {/* Wanjiku */}
              <div className="p-3.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#140338] text-white flex items-center justify-center font-bold text-xs">
                    WK
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#140338]">Wanjiku Kamau</h4>
                    <p className="text-[11px] text-zinc-500">Nairobi (Mombasa Rd & CBD)</p>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="font-bold text-emerald-700 flex items-center justify-end gap-1">
                    <Radio className="w-3 h-3 text-emerald-600" /> 4G Sync
                  </span>
                  <span className="text-zinc-600 font-semibold">82% Batt • 14 Audits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instant QA Verification Queue */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-base text-[#140338]">Instant QA Verification Queue</h3>
              </div>
              <span className="text-xs font-semibold text-zinc-500">Pending Approvals: 3</span>
            </div>

            <div className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                <img
                  src={mockQaItem.imageUrl}
                  alt="Billboard Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white" /> GPS Locked
                  </span>
                </div>
              </div>

              <div className="flex-1 text-xs space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#140338]">Lekki Toll Gate LED Spectacular</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                    99.8% Match
                  </span>
                </div>
                <p className="text-zinc-500 text-[11px]">
                  Agent Emeka A. • GPS [6.4381° N, 3.4682° E] • 14:28 WAT
                </p>
                <p className="text-zinc-700 font-medium">
                  Flight: Zenith Bank Fintech Q3 Launch (Creative Version 4B)
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQaApproved(true);
                      alert('Proof-of-Play Approved! Pushed to advertiser client live portal.');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      qaApproved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#140338] hover:bg-[#25005a] text-white shadow-2xs'
                    }`}
                  >
                    {qaApproved ? 'Approved ✓' : 'Approve PoP'}
                  </button>

                  <button
                    onClick={() => alert('Retake notification sent to Agent Emeka A.')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                  >
                    Retake
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client Transparency Engine (Dark Card banner linking to Screen 04) */}
          <div className="rounded-2xl p-6 bg-[#140338] text-white relative overflow-hidden shadow-lg border border-white/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-extrabold tracking-wider uppercase mb-2 inline-block">
                  Client Transparency Engine
                </span>
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  Customer Live Tracking Portal
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
                  View real-time client perspective: share white-labeled, interactive GPS maps and validated photo proofs directly with advertiser brand managers.
                </p>
              </div>

              <button
                onClick={() => onNavigate('screen-04')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 font-bold text-xs shrink-0 shadow-md transition-all group"
              >
                <span>Switch to Customer Live Portal</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Metro Compliance Score */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-base text-[#181716]">Metro Compliance Score</h3>
              <button
                onClick={() => onNavigate('screen-08')}
                className="text-xs text-zinc-500 hover:text-[#181716] font-bold"
              >
                Full Analytics
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Live audit fulfillment rate per region</p>

            <div className="space-y-3.5">
              {[
                { name: 'Johannesburg (JNB)', rate: 98, color: 'bg-[#ef5a24]' },
                { name: 'Lagos (LOS)', rate: 96, color: 'bg-[#181716]' },
                { name: 'Nairobi (NBO)', rate: 91, color: 'bg-[#ef5a24]' },
                { name: 'Accra (ACC)', rate: 88, color: 'bg-[#181716]' },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#181716]">{item.name}</span>
                    <span className="text-[#181716] font-bold">{item.rate}% verified</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Stream */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#181716]">Recent Audit Stream</h3>
              <History className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#181716]">Field audit photo uploaded</h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    MTN 5G Campaign in Lekki Expressway. Verified by Computer Vision inspection model.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">
                    3 mins ago • Lagos Hub
                  </span>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#181716]">Coca-Cola seasonal wrap approved</h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Sandton Central Spectacular passed daylight and nighttime lux compliance audits.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">
                    18 mins ago • JNB Field Ops
                  </span>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#181716]">Issue flagged on Thika Road display</h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Sensor ping alert: 2 LED cabinet panels unresponsive. Maintenance ticket auto-generated.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">
                    42 mins ago • Nairobi Tech Support
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('screen-02')}
              className="w-full mt-4 py-2 text-center text-xs font-bold text-[#181716] hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200"
            >
              View Full Operations Log →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
