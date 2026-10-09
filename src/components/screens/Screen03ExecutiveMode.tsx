import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Eye,
  Download,
  Share2,
  FileText,
  Lock,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { AfricaCorridorMap } from '../common/AfricaCorridorMap';
import { ScreenId, VerificationItem } from '../../types';

interface Screen03Props {
  onNavigate: (screen: ScreenId) => void;
  onOpenProof: (item: VerificationItem) => void;
}

export const Screen03ExecutiveMode: React.FC<Screen03Props> = ({ onNavigate, onOpenProof }) => {
  const [assetFormatFilter, setAssetFormatFilter] = useState<'all' | 'dooh' | 'static'>('dooh');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Flight Window Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white rounded-2xl border border-[#eae7e1] text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#140338] text-white text-[10px] font-black uppercase tracking-wider">
            Live Flight Q4-AFR-5G
          </span>
          <span className="text-zinc-600 font-bold">
            Safaricom Group Executive Portal • Flight Window: Oct 15 – Nov 30 (45 Days – 68% Elapsed)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('screen-04')}
            className="text-xs font-bold text-[#140338] hover:text-[#556500] flex items-center gap-1"
          >
            <span>Switch to Live Tracker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Boardroom Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
            Pan-African 5G Network & M-Pesa Festive Blitz
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold text-zinc-500">
            <span className="text-zinc-700 font-bold">Active Capital Corridors:</span>
            {['Lagos, NG', 'Nairobi, KE', 'Johannesburg, ZA', 'Accra, GH', 'Kigali, RW', 'Kinshasa, CD'].map((c, i) => (
              <React.Fragment key={c}>
                <span className="text-[#140338] bg-zinc-100 px-2 py-0.5 rounded-md">{c}</span>
                {i < 5 && <span className="text-zinc-300">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Generating Board Summary Executive Deck...')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#eae7e1] hover:bg-zinc-50 rounded-xl text-xs font-bold text-[#140338] shadow-2xs"
          >
            <FileText className="w-4 h-4 text-zinc-600" />
            <span>Generate Board Summary</span>
          </button>

          <button
            onClick={() => alert('Viewing Deloitte & EY signed audit certificate...')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#140338] hover:bg-[#25005a] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>View Audit Certificate</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Media Investment</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              On Budget
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              $1,850,000
            </span>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 font-medium">
              <span><strong>$1.26M</strong> deployed</span>
              <span className="text-emerald-700 font-semibold">98.4% pacing accuracy</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Escrow Protected (Standard Bank)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Verified Network Delivery</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Continuous
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              99.4%
            </span>
            <div className="mt-3 text-xs text-zinc-600 font-medium">
              <strong>248 of 252</strong> monoliths optically verified
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telemetry Polling: 30s intervals</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Audited Audience Reach</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold flex items-center gap-1">
              <Eye className="w-3 h-3" /> Optical Sensor
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              142.8M
            </span>
            <div className="mt-3 text-xs text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% above festive forecast
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Vehicular (74%) • Pedestrian (26%)</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Proof-of-Play Compliance</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              SLA Guaranteed
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              100%
            </span>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 font-medium">
              <span><strong>0 Blackout</strong> Days</span>
              <span className="text-emerald-700 font-semibold">Real-time visual match</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audited by Deloitte Media Advisory</span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: PAN-AFRICAN MAP & CAPITAL ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Corridor Telemetry Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Corridor Telemetry Monitor
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Pan-African High-Impact Corridor Deployment
              </h3>
            </div>

            <div className="flex bg-[#f4f3f0] p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setAssetFormatFilter('dooh')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  assetFormatFilter === 'dooh' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                }`}
              >
                DOOH Monoliths (162)
              </button>
              <button
                onClick={() => setAssetFormatFilter('static')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  assetFormatFilter === 'static' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                }`}
              >
                Static Mega-Gantries (90)
              </button>
            </div>
          </div>

          <AfricaCorridorMap />
        </div>

        {/* Right: Metro Investment & Status (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Capital Allocation
                </span>
                <h3 className="font-extrabold text-base text-[#140338]">
                  Metro Investment & Status
                </h3>
              </div>
              <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                6 Metros Active
              </span>
            </div>

            <div className="space-y-3">
              {[
                { code: 'NG', name: 'Lagos Mega Metro', sites: '72 Monoliths • Lekki, Ikeja & VI', amount: '$620,000 (33.5%)', uptime: '99.8% Verified Uptime' },
                { code: 'KE', name: 'Nairobi Metropolitan', sites: '64 Monoliths • Westlands, Mombasa Rd', amount: '$490,000 (26.5%)', uptime: '100% Verified Uptime' },
                { code: 'ZA', name: 'Johannesburg & Sandton', sites: '54 Monoliths • M1, Rivonia, Rosebank', amount: '$410,000 (22.2%)', uptime: '99.1% Verified Uptime' },
                { code: 'GH', name: 'Accra Greater Region', sites: '28 Monoliths • Airport City, Osu', amount: '$180,000 (9.7%)', uptime: '100% Verified Uptime' },
                { code: 'RW/CD', name: 'Kigali & Kinshasa Corridors', sites: '30 Monoliths • Boulevard du 30 Juin', amount: '$150,000 (8.1%)', uptime: '98.9% Verified Uptime' },
              ].map((metro) => (
                <div
                  key={metro.name}
                  className="p-3 rounded-xl border border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#140338] text-white flex items-center justify-center font-bold text-xs">
                      {metro.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#140338]">{metro.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">{metro.sites}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-[#140338] block">{metro.amount}</span>
                    <span className="text-[10px] font-semibold text-emerald-700">{metro.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eae7e1] flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-600">
              Weighted Fleet Compliance: <strong className="text-emerald-700">99.58%</strong>
            </span>
            <button
              onClick={() => alert('Exporting regional capital breakdown...')}
              className="text-xs font-bold text-[#140338] hover:text-[#556500] flex items-center gap-1"
            >
              <span>Export Breakdown</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LOWER ROW: BURN CURVE & SHARE OF VOICE (SOV) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campaign Flight Progression & Burn Curve (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Pacing vs. Milestone Targets
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Campaign Flight Progression & Burn Curve
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#140338] text-xs font-black">
              Day 31 of 45 (68.8%)
            </span>
          </div>

          {/* Phased Flight Progression Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#140338] mb-1.5">
              <span>Phased Flight Progression</span>
              <span className="font-mono text-zinc-600">$1,265,000 of $1,850,000 Planned Deployed</span>
            </div>
            <div className="h-3.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
              <div className="bg-[#140338] h-full" style={{ width: '45%' }} title="Phase 1 (Completed)" />
              <div className="bg-[#7c3aed] h-full" style={{ width: '25%' }} title="Phase 2 (In Progress)" />
              <div className="bg-white h-full" style={{ width: '30%' }} title="Phase 3 (Scheduled)" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
              <div className="flex items-center gap-1.5 font-bold text-[#140338]">
                <span className="w-2 h-2 rounded-full bg-[#140338]" />
                <span>Phase 1: Capital Blitz</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Oct 15 - Oct 29 • Completed (100% Met)</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
              <div className="flex items-center gap-1.5 font-bold text-[#7c3aed]">
                <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                <span>Phase 2: Transit Expansion</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Oct 30 - Nov 15 • In Progress (Active)</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Phase 3: Festive Takeover</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Nov 16 - Nov 30 • Pre-synced (Ready)</p>
            </div>
          </div>

          {/* Guaranteed Spot Yield Fulfillment Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">Guaranteed Spot Yield Fulfillment</p>
                <p className="text-emerald-800 text-[11px]">
                  2,840,000 scheduled programmatic 15s impressions rendered with zero degradation.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 font-bold text-emerald-800 shrink-0">
              SLA Met (+1.2%)
            </span>
          </div>
        </div>

        {/* Right: Share of Voice (SOV) (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Competitive Dominance Index
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Key Junction Share of Voice (SOV)
              </h3>
            </div>
            <PieChart className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-500">Category Dominance: Telco & Fintech</span>
            <span className="font-bold text-[#140338]">58.4% Dominant SOV</span>
          </div>

          {/* SOV Bars */}
          <div className="space-y-3 text-xs">
            {/* Safaricom & M-Pesa (Our Campaign) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-[#140338]">Safaricom & M-Pesa (Our Campaign)</span>
                <span className="text-[#140338]">58.4%</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '58.4%' }} />
              </div>
            </div>

            {/* Airtel Africa */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-zinc-600">
                <span>Airtel Africa</span>
                <span>21.2%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-400 rounded-full" style={{ width: '21.2%' }} />
              </div>
            </div>

            {/* MTN Group */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-zinc-600">
                <span>MTN Group</span>
                <span>14.8%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-400 rounded-full" style={{ width: '14.8%' }} />
              </div>
            </div>

            {/* Other */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-zinc-500">
                <span>Other / Non-Category</span>
                <span>5.6%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-300 rounded-full" style={{ width: '5.6%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#eae7e1] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Benchmarked across 14 Top Arterial Corridors</span>
            <span className="font-bold text-emerald-700">SOV Lead: +37.2 pts</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME SENSOR FEED: ICONIC FLAGSHIP ASSETS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
              Real-Time Sensor Feed
            </span>
            <h2 className="text-lg font-bold text-[#140338]">
              Iconic Flagship Asset Spotlight & Live Proof-of-Play
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-[#eae7e1] rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              All 248 Active Monoliths
            </button>
            <button
              onClick={() => alert('Downloading Batch Proof-of-Play High-Res (ZIP)...')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#140338] text-white rounded-xl text-xs font-bold hover:bg-[#25005a]"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Batch PoP High-Res (ZIP)</span>
            </button>
          </div>
        </div>

        {/* 3 Billboard Photo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nairobi 3D Monolith */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#eae7e1] shadow-2xs hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video bg-black">
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"
                alt="Westlands Monolith"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE FEED
              </span>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                Lux: 4,820 cd/m²
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-zinc-500 font-bold">Nairobi, KE</span>
                  <span className="text-emerald-700 font-bold">99.9% AI Match</span>
                </div>
                <h3 className="font-extrabold text-sm text-[#140338]">
                  The Westlands 3D Curved Mega-Monolith
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Prime roundabout junction facing traffic toward Nairobi CBD & Expressway off-ramp.
                </p>
              </div>

              <div className="pt-3 border-t border-[#eae7e1] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Daily Gross Reach:</span>
                  <span className="font-bold text-[#140338]">342,000 Impressions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Optical Sensor Verification:</span>
                  <span className="font-bold text-emerald-700">100% Daylight Sync</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                  <span>GPS Coordinate Stamp:</span>
                  <span>1.2675° S, 36.8044° E</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lagos Mega Portal */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#eae7e1] shadow-2xs hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video bg-black">
              <img
                src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
                alt="Lekki Expressway Portal"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE FEED
              </span>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                Lux: 6,100 cd/m²
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-zinc-500 font-bold">Lagos, NG</span>
                  <span className="text-emerald-700 font-bold">100% AI Match</span>
                </div>
                <h3 className="font-extrabold text-sm text-[#140338]">
                  Lekki Expressway Dual Mega-Portal
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  High-density commuter corridor connecting Victoria Island with Lekki Phase 1.
                </p>
              </div>

              <div className="pt-3 border-t border-[#eae7e1] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Daily Gross Reach:</span>
                  <span className="font-bold text-[#140338]">580,000 Impressions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Optical Sensor Verification:</span>
                  <span className="font-bold text-emerald-700">Dual Camera Angle Audited</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                  <span>GPS Coordinate Stamp:</span>
                  <span>6.4384° N, 3.4735° E</span>
                </div>
              </div>
            </div>
          </div>

          {/* Johannesburg Sandton Central */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#eae7e1] shadow-2xs hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video bg-black">
              <img
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80"
                alt="Sandton Financial Gantry"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE FEED
              </span>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                Lux: 4,650 cd/m²
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-zinc-500 font-bold">Johannesburg, ZA</span>
                  <span className="text-emerald-700 font-bold">99.8% AI Match</span>
                </div>
                <h3 className="font-extrabold text-sm text-[#140338]">
                  Sandton Financial Central Gantry
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  South Africa's wealthiest square mile arterial corridor heading north to Pretoria.
                </p>
              </div>

              <div className="pt-3 border-t border-[#eae7e1] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Daily Gross Reach:</span>
                  <span className="font-bold text-[#140338]">412,000 Impressions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Optical Sensor Verification:</span>
                  <span className="font-bold text-emerald-700">Continuous Hardware Telemetry</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                  <span>GPS Coordinate Stamp:</span>
                  <span>26.1076° S, 28.0567° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INDEPENDENT THIRD-PARTY AUDIT CERTIFICATE BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-[#eae7e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                ISO 20560 Audited
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Continuous Blockchain Proof Log #84920
              </span>
            </div>
            <h4 className="font-extrabold text-base text-[#140338]">
              Independent Third-Party Verification Certificate
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl">
              Measurement statements and spot run logs are audited daily under Global OOH Standards (ISO 20560). Verified by Deloitte Media Advisory with encrypted hardware sensor telemetry across all 6 metropolitan hubs.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-3 shrink-0">
          <div className="text-right text-xs">
            <span className="font-bold text-[#140338] block">Deloitte & EY Media Advisory</span>
            <span className="text-emerald-700 font-semibold text-[11px]">Sign-off Valid through Dec 2025</span>
          </div>
          <button
            onClick={() => alert('Downloading signed ISO 20560 certificate (PDF)...')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#140338] hover:bg-[#25005a] text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download Signed Audit Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
