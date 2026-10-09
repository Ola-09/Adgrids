import React, { useMemo, useState } from 'react';
import {
  Car,
  Camera,
  AlertTriangle,
  TrendingUp,
  Download,
  Clock,
  Radio,
  Battery,
  ShieldCheck,
  CheckCircle,
  Flag,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';
import { FIELD_AGENTS, VERIFICATION_ITEMS } from '../../data/mockData';
import { ScreenId, VerificationItem } from '../../types';
import { useBillboards } from '../../context/BillboardContext';

interface Screen02Props {
  onNavigate: (screen: ScreenId) => void;
  onOpenProof: (item: VerificationItem) => void;
}

export const Screen02FieldDispatch: React.FC<Screen02Props> = ({ onNavigate, onOpenProof }) => {
  const [selectedMetroFilter, setSelectedMetroFilter] = useState<'LOS' | 'NBO' | 'JNB' | 'ACC'>('LOS');
  const [activeTab, setActiveTab] = useState<'live' | 'replay' | 'telemetry'>('live');
  const [approvedItems, setApprovedItems] = useState<string[]>([]);
  const [trimmingDispatched, setTrimmingDispatched] = useState<boolean>(false);
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

  const priority1 = VERIFICATION_ITEMS[0];

  const handleApprove = (id: string) => {
    setApprovedItems((prev) => [...prev, id]);
    alert('Approved & Pushed to Client Live Tracking Portal!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Subheader Live Telemetry Ticker Banner */}
      <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#eae7e1] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All 6 Hubs Operational
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600 font-medium">
            <strong className="text-[#140338]">Lagos (LOS):</strong> 18 Crews,{' '}
            <strong className="text-[#140338]">Nairobi (NBO):</strong> 14 Crews,{' '}
            <strong className="text-[#140338]">Johannesburg (JNB):</strong> 11 Crews,{' '}
            <strong className="text-[#140338]">Accra (ACC):</strong> 7 Crews,{' '}
            <strong className="text-[#140338]">Kigali (KGL):</strong> 4 Crews
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-500 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <Radio className="w-3 h-3 text-emerald-600" />
            GNSS Constellation Locked
          </span>
          <span className="text-zinc-300">•</span>
          <span>Sync: Just now (0.4s lat)</span>
        </div>
      </div>

      {/* Main Title & Action Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
            Agency Operations & Field Dispatch Command
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Real-time agent coordination, field audit verification queue, and site incident dispatching across African metros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white p-1 rounded-xl border border-[#eae7e1] text-xs font-bold shadow-2xs">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'live' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
              }`}
            >
              Live Mode
            </button>
            <button
              onClick={() => setActiveTab('replay')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'replay' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
              }`}
            >
              Replay Flight
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'telemetry' ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
              }`}
            >
              Telemetry Log
            </button>
          </div>

          <button
            onClick={() => alert('Downloading flight dispatch data logs...')}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#eae7e1] rounded-xl hover:bg-zinc-50 text-zinc-700 shadow-2xs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Today's Field Dispatches</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum">54</span>
              <span className="text-xs font-bold text-zinc-500">Active Teams</span>
            </div>
            {/* Progress Segment Bar */}
            <div className="mt-3 h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
              <div className="bg-[#140338] h-full" style={{ width: '70%' }} />
              <div className="bg-white h-full" style={{ width: '25%' }} />
              <div className="bg-amber-400 h-full" style={{ width: '5%' }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-zinc-500">
              <span>38 En-Route</span>
              <span>14 On-Site</span>
              <span>2 Standby</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Evidence Awaiting Review</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum">19</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                Pending
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Turnaround: <strong>8.4 mins</strong></span>
              <span className="text-emerald-700 font-bold">98.2% AI Conf.</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Critical Field Incidents</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-600 tracking-tight tnum">2</span>
              <span className="text-xs font-bold text-red-700">Open Alerts</span>
            </div>
            <div className="mt-3 text-[11px] font-medium text-zinc-600 space-y-0.5">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Thika Rd: <strong>Obstructed Sightline</strong>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Sandton: <strong>Grid Fluctuations</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Campaign Delivery Pacing</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum">96.8%</span>
              <span className="text-xs font-bold text-emerald-700">On-Schedule</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-500">SLA Target: 95.0%</span>
              <span className="font-bold text-emerald-700">+1.8% Above Buffer</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: RADAR & VERIFICATION QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map & Crew Telemetry Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Field Radar Canvas */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-base text-[#140338]">Live Field Radar & Asset Canvas</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[#f4f3f0] p-0.5 rounded-xl text-xs font-bold">
                  {(['LOS', 'NBO', 'JNB', 'ACC'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMetroFilter(m)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedMetroFilter === m ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="px-2.5 py-1 bg-white border border-[#eae7e1] rounded-lg text-xs font-semibold text-zinc-700">
                  Format: All (DOOH & Static)
                </div>
              </div>
            </div>

            {/* Radar Map Component */}
            <InteractiveMap
              metroName="Lagos Hub"
              corridorName="Lekki-Epe Expressway & Victoria Island"
              selectedPinId="LOS-VI-088"
              pins={billboardPins}
              onSelectPin={(id) => onNavigate('screen-04')}
              heightClass="h-[380px]"
            />
          </div>

          {/* Active Crew Assignment & Telemetry Table */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#140338]" />
                <h3 className="font-extrabold text-base text-[#140338]">Active Crew Assignment & Telemetry</h3>
              </div>
              <span className="text-xs text-zinc-500 font-semibold">Showing 3 of 54 Units</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#eae7e1] text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Field Agent & Crew</th>
                    <th className="py-2.5 font-bold">Assigned Site / Corridor</th>
                    <th className="py-2.5 font-bold">Client Flight</th>
                    <th className="py-2.5 font-bold">Proximity / Status</th>
                    <th className="py-2.5 font-bold">Device Telemetry</th>
                    <th className="py-2.5 font-bold text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eae7e1]">
                  {FIELD_AGENTS.map((agent) => (
                    <tr key={agent.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#140338]">{agent.name}</p>
                            <p className="text-[10px] text-zinc-500">{agent.metro}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 font-medium">
                        <p className="font-bold text-[#140338]">{agent.assignedSiteId}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[130px]">{agent.assignedSiteName}</p>
                      </td>

                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-[11px] text-zinc-700">
                          {agent.clientFlight}
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            agent.status === 'On-Site'
                              ? 'bg-emerald-100 text-emerald-900'
                              : agent.status === 'In Transit'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          {agent.status} {agent.eta ? `• ETA ${agent.eta}` : '(24m)'}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-mono text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-zinc-700">
                          <Radio className="w-3 h-3 text-emerald-600" /> {agent.connectivity}
                          <Battery className="w-3 h-3 ml-1 text-emerald-600" /> {agent.battery}%
                        </span>
                      </td>

                      <td className="py-3 pl-2 text-right">
                        <button
                          onClick={() => alert(`Reassigning dispatcher for ${agent.name}...`)}
                          className="px-2.5 py-1 rounded-lg border border-[#eae7e1] hover:bg-zinc-100 font-bold text-[11px] text-[#140338]"
                        >
                          {agent.status === 'Verified / Standby' ? 'Assign New' : 'Reassign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Verification Queue & Incidents (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Evidence Verification Queue */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-base text-[#140338]">Live Evidence Verification Queue</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                3 Urgent
              </span>
            </div>

            {/* Priority 1 Verification Card */}
            <div className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                  Priority 1 Verification
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 99.4% AI Match
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-[#140338]">{priority1.siteName}</h4>
                <p className="text-xs text-zinc-500 font-medium">
                  {priority1.flightRef} • Captured 3m ago
                </p>
              </div>

              {/* Photo with HUD overlay */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-zinc-200 group">
                <img
                  src={priority1.imageUrl}
                  alt="Billboard"
                  className="w-full h-full object-cover"
                />
                {/* HUD bounding box */}
                <div className="absolute inset-4 border border-white rounded pointer-events-none">
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-white text-[#140338] text-[9px] font-black uppercase">
                    Optical CV Passed
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded text-white text-[10px] font-mono flex justify-between border border-white/10">
                  <span className="text-white">LAT: 6.4382° N, LON: 3.4721° E (GPS Locked)</span>
                  <span>16:42:19 WAT</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-[#eae7e1]">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Line of Sight</span>
                  <span className="font-bold text-emerald-800">100% Unobstructed</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#eae7e1]">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Illumination</span>
                  <span className="font-bold text-[#140338]">88,000 Lux</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#eae7e1]">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Screen Health</span>
                  <span className="font-bold text-emerald-800">0 Dead Pixels</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleApprove(priority1.id)}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 text-xs font-black rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Push to Client</span>
                </button>

                <button
                  onClick={() => alert('Requesting retake...')}
                  className="py-2.5 px-3 bg-white border border-[#eae7e1] hover:bg-zinc-100 text-[#140338] text-xs font-bold rounded-xl transition-colors"
                >
                  Request Retake
                </button>

                <button
                  onClick={() => alert('Incident flagged!')}
                  className="p-2.5 bg-white border border-[#eae7e1] hover:bg-red-50 text-red-600 rounded-xl"
                  title="Flag issue"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Priority 2 Item Preview */}
            <div className="p-3 bg-white rounded-xl border border-[#eae7e1] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    Priority 2 Verification
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">AI Match: 97.8%</span>
                </div>
                <h5 className="font-bold text-xs text-[#140338] mt-1">Westlands Monolith (NBO-WL-012)</h5>
                <p className="text-[10px] text-zinc-500">Safaricom 5G Launch • Agent: Wanjiku K.</p>
              </div>

              <button
                onClick={() => onOpenProof(VERIFICATION_ITEMS[1])}
                className="text-xs font-bold text-[#140338] hover:text-[#556500] flex items-center gap-1"
              >
                <span>Inspect Asset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Incident & Escalation Radar */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-extrabold text-base text-[#140338]">Incident & Escalation Radar</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold">
                1 High Severity
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-[#140338]">Thika Road Gantry (NBO-TK-004)</h4>
                  <p className="text-zinc-600 mt-0.5 leading-relaxed">
                    Tree branch partial obstruction detected by optical monitoring camera over south-bound slow lane.
                  </p>
                  <p className="text-zinc-500 font-medium text-[11px] mt-1">
                    Assigned: <strong>Nairobi Tech Team B</strong> • In Route - ETA 22m
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-red-100 flex justify-end">
                <button
                  onClick={() => {
                    setTrimmingDispatched(true);
                    alert('Trimming Unit Dispatched to Thika Road Gantry!');
                  }}
                  className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
                >
                  <span>{trimmingDispatched ? 'Trimming Unit Dispatched ✓' : 'Dispatch Trimming Unit →'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Flight Deadlines */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#140338]">Upcoming Flight Deadlines</h3>
              <span className="text-xs text-zinc-500 font-semibold">Before 18:00 WAT</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">Guinness 'Black Shines Brightest'</h4>
                  <p className="text-[11px] text-zinc-500">Ikorodu Rd Mega Board • Requires Initial PoP</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 block">42 mins left</span>
                  <span className="text-[10px] text-zinc-400">Crew En-Route</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">Standard Bank Private Wealth</h4>
                  <p className="text-[11px] text-zinc-500">Sandton City Digital Tower • Scheduled Flight Loop</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#140338] block">1h 15m left</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Site Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#eae7e1] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 font-medium">
        <div className="flex items-center gap-3">
          <span>ADGRID Core v4.8.2</span>
          <span>•</span>
          <span>Telemetry Relay: Pan-African Satellite Array 3B</span>
          <span>•</span>
          <span>Audit Protocol: ISO 20560 OOH Certified</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-[#140338]">Incident Escalation Policy</button>
          <button className="hover:text-[#140338]">Dispatcher Manual</button>
          <span className="font-mono text-[#140338]">UTC+1 (WAT) 16:45</span>
        </div>
      </div>
    </div>
  );
};
