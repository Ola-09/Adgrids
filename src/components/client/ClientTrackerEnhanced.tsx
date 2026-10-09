import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  ArrowRight,
  X,
  Upload,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClientBillboardPin, JobLifecycleStep, RealtimeJobEvent } from '../../types';

// The 11 canonical steps requested in the prompt
const LIFECYCLE_STEPS: JobLifecycleStep[] = [
  'Scheduled',
  'Assigned',
  'Agent En Route',
  'Agent Arrived',
  'Installation Started',
  'Installation Completed',
  'Evidence Submitted',
  'AI Verification',
  'Agency Review',
  'Client Verification',
  'Completed',
];

// Initial mock billboard pins across African metros
const INITIAL_PINS: ClientBillboardPin[] = [
  {
    id: 'LOS-VI-088',
    name: 'Lekki Expressway Mega DOOH',
    location: 'Ozumba Mbadiwe Ave, Victoria Island',
    corridor: 'Lekki Coastal Corridor',
    city: 'Lagos',
    lat: 6.4281,
    lng: 3.4219,
    status: 'live',
    statusLabel: 'Live / Verified',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    campaign: 'Safaricom 5G Launch & M-Pesa Blitz',
    agency: 'AfriReach Flight Command West Africa',
    currentStep: 'Completed',
    assignedAgent: 'Babatunde Oladipo',
    latestEvidence: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    gpsVerification: '6.4281° N, 3.4219° E • Within 0.8m Geofence',
    timestamp: '16:42:19 WAT',
    verificationResult: '99.4% AI Match • 85,000 Lux Daylight Calibrated • 0 Dead Pixels',
    issueHistory: 'None. Continuous 60 FPS playback audited.',
    specDimensions: '24m x 8m (192 sq.m)',
    luxScore: 85000,
    jobTimeline: LIFECYCLE_STEPS.map((step) => ({
      step,
      time: 'Completed Today',
      completed: true,
    })),
  },
  {
    id: 'NBO-WL-012',
    name: 'Westlands 3D Curved Monolith',
    location: 'Waiyaki Way Roundabout, Westlands',
    corridor: 'Westlands Commercial Node',
    city: 'Nairobi',
    lat: -1.2675,
    lng: 36.8044,
    status: 'progress',
    statusLabel: 'Job in Progress',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    campaign: 'Safaricom 5G Launch & M-Pesa Blitz',
    agency: 'AfriReach East Africa Hub',
    currentStep: 'Evidence Submitted',
    assignedAgent: 'Wanjiku Kamau',
    latestEvidence: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    gpsVerification: '1.2675° S, 36.8044° E • Verified Geofence',
    timestamp: '15:10:04 EAT',
    verificationResult: '97.8% AI Match • Foliage Clear • Daylight Matrix Nominal',
    issueHistory: 'Minor traffic vibration compensated by rig stabilization.',
    specDimensions: '30m x 10m Curved 3D',
    luxScore: 78200,
    jobTimeline: LIFECYCLE_STEPS.map((step, idx) => ({
      step,
      time: idx <= 6 ? 'Pass' : 'In Progress',
      completed: idx <= 6,
    })),
  },
  {
    id: 'JNB-RV-044',
    name: 'Sandton City Financial Gantry Spectacular',
    location: 'Rivonia Rd & M1 Overpass',
    corridor: 'Sandton Financial Strip',
    city: 'Johannesburg',
    lat: -26.1076,
    lng: 28.0567,
    status: 'live',
    statusLabel: 'Live / Verified',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    campaign: 'Safaricom 5G Launch & M-Pesa Blitz',
    agency: 'AfriReach Southern Africa Logistics',
    currentStep: 'Completed',
    assignedAgent: 'Tendai Moyo',
    latestEvidence: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    gpsVerification: '26.1076° S, 28.0567° E • High Precision RTK',
    timestamp: '14:28:00 SAST',
    verificationResult: '99.8% Match • Full Lumens Verified • Zero Sightline Occlusion',
    issueHistory: 'Standard Bank building reflections filtered.',
    specDimensions: '42m x 9m Gantry Monolith',
    luxScore: 82000,
    jobTimeline: LIFECYCLE_STEPS.map((step) => ({
      step,
      time: 'Verified',
      completed: true,
    })),
  },
  {
    id: 'ACC-AP-003',
    name: 'Airport Bypass Static Gantry',
    location: 'Liberation Rd, Airport Bypass',
    corridor: 'Airport City & Ridge Expressway',
    city: 'Accra',
    lat: 5.6037,
    lng: -0.1708,
    status: 'scheduled',
    statusLabel: 'Scheduled',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    campaign: 'Safaricom 5G Launch & M-Pesa Blitz',
    agency: 'AfriReach West Africa Agency',
    currentStep: 'Scheduled',
    assignedAgent: 'Emmanuel Darko',
    gpsVerification: 'Pending On-Site Arrival',
    timestamp: 'Scheduled for Tomorrow 08:00 GMT',
    verificationResult: 'Awaiting Physical Mounting & Lighting Check',
    issueHistory: 'None. Vinyl printing passed QA.',
    specDimensions: '20m x 8m Frontlit Vinyl',
    luxScore: 46000,
    jobTimeline: LIFECYCLE_STEPS.map((step, idx) => ({
      step,
      time: idx === 0 ? 'Queued' : 'Pending',
      completed: idx === 0,
    })),
  },
  {
    id: 'LOS-IK-009',
    name: 'Ikorodu Expressway Dual Unipole',
    location: 'Ojota Interchange, Ikorodu Rd',
    corridor: 'Mainland Commercial Corridor',
    city: 'Lagos',
    lat: 6.5753,
    lng: 3.3762,
    status: 'issue',
    statusLabel: 'Issue / Attention Required',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    campaign: 'Safaricom 5G Launch & M-Pesa Blitz',
    agency: 'AfriReach Rapid Dispatch',
    currentStep: 'Installation Started',
    assignedAgent: 'Chinedu Eze',
    gpsVerification: '6.5753° N, 3.3762° E',
    timestamp: '11:15:00 WAT',
    verificationResult: 'Sightline tree branch obstruction detected on right quad.',
    issueHistory: 'Technician crew dispatched with municipal pruning permit.',
    specDimensions: '22m x 7m Unipole',
    luxScore: 32000,
    jobTimeline: LIFECYCLE_STEPS.map((step, idx) => ({
      step,
      time: idx <= 4 ? 'Alert' : 'Pending',
      completed: idx <= 4,
    })),
  },
];

export const ClientTrackerEnhanced: React.FC = () => {
  const { activePurchaseBillboard } = useAuth();
  const [pins, setPins] = useState<ClientBillboardPin[]>(INITIAL_PINS);
  const [selectedPin, setSelectedPin] = useState<ClientBillboardPin | null>(INITIAL_PINS[0]);
  const [events, setEvents] = useState<RealtimeJobEvent[]>([
    {
      id: 'EVT-101',
      jobId: 'JOB-9418',
      siteId: 'LOS-VI-088',
      siteName: 'Lekki Expressway Mega DOOH',
      campaignName: 'Safaricom 5G Launch',
      step: 'Completed',
      timestamp: 'Just now',
      agentName: 'Babatunde Oladipo',
      description: 'Proof-of-play verified via ISO 20560 AI optical model. Flight officially Live.',
      statusTone: 'success',
    },
    {
      id: 'EVT-102',
      jobId: 'JOB-3320',
      siteId: 'NBO-WL-012',
      siteName: 'Westlands 3D Curved Monolith',
      campaignName: 'Safaricom 5G Launch',
      step: 'Evidence Submitted',
      timestamp: '4m ago',
      agentName: 'Wanjiku Kamau',
      description: 'Auditor captured 4K RAW proof. Optical computer vision inference initiated.',
      statusTone: 'info',
    },
    {
      id: 'EVT-103',
      jobId: 'JOB-8812',
      siteId: 'JNB-RV-044',
      siteName: 'Sandton City Spectacular',
      campaignName: 'Safaricom 5G Launch',
      step: 'Completed',
      timestamp: '18m ago',
      agentName: 'Tendai Moyo',
      description: 'Lux levels passed at 82,000 lumens. Daylight visibility 100%.',
      statusTone: 'success',
    },
  ]);

  // Real-time WebSocket / Event stream simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const liveEvents: RealtimeJobEvent[] = [
        {
          id: `EVT-${Date.now()}`,
          jobId: 'JOB-3320',
          siteId: 'NBO-WL-012',
          siteName: 'Westlands 3D Curved Monolith',
          campaignName: 'Safaricom 5G Launch',
          step: 'AI Verification',
          timestamp: 'Just now',
          agentName: 'AI Optical Vision Engine',
          description: 'Verified 99.8% pixel alignment against master Safaricom 5G creative vector.',
          statusTone: 'success',
        },
        {
          id: `EVT-${Date.now() + 1}`,
          jobId: 'JOB-9418',
          siteId: 'LOS-VI-088',
          siteName: 'Lekki Expressway Mega DOOH',
          campaignName: 'Safaricom 5G Launch',
          step: 'Completed',
          timestamp: 'Just now',
          agentName: 'IoT Sensor Array',
          description: 'Loop counter incremented: 1,840 plays logged today with 0 packet drops.',
          statusTone: 'info',
        },
      ];

      const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      setEvents((prev) => [randomEvent, ...prev.slice(0, 7)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Status badge styling helper
  const getStatusBadge = (status: ClientBillboardPin['status']) => {
    switch (status) {
      case 'live':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          text: 'text-emerald-950',
          chip: 'bg-emerald-100 text-emerald-900',
          label: 'Live / Verified (Green)',
        };
      case 'progress':
        return {
          bg: 'bg-white',
          border: 'border-zinc-400',
          text: 'text-zinc-900',
          chip: 'bg-white text-zinc-900 border border-zinc-300 font-black',
          label: 'Job in Progress (White)',
        };
      case 'scheduled':
        return {
          bg: 'bg-[#ef5a24]',
          border: 'border-[#d94e1d]',
          text: 'text-orange-950',
          chip: 'bg-orange-100 text-orange-900',
          label: 'Scheduled (Accent)',
        };
      case 'issue':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-red-950',
          chip: 'bg-red-100 text-red-900 font-bold',
          label: 'Issue / Attention (Red)',
        };
      default:
        return {
          bg: 'bg-zinc-800',
          border: 'border-black',
          text: 'text-zinc-900',
          chip: 'bg-zinc-200 text-zinc-800',
          label: 'Offline / Expired (Black)',
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Campaign Overview Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#eae7e1] shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl lg:text-3xl font-black text-[#181716] tracking-tight">
                Client Campaign Tracker
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#181716] text-white text-xs font-black">
                Active Flight #FLT-SAF-2024
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              Safaricom Festive 5G & M-Pesa Pan-African Blitz • Client: Safaricom PLC • Agency: AfriReach
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500">Dates:</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1] text-xs font-black text-[#181716]">
              Nov 01, 2024 — Jan 15, 2025
            </span>
          </div>
        </div>

        {/* High-Level Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-[#eae7e1]">
          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">
              Completion Rate
            </span>
            <span className="text-2xl font-black text-[#181716] tracking-tight block mt-0.5">
              86%
            </span>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#ef5a24] h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">
              Total Locations
            </span>
            <span className="text-2xl font-black text-[#181716] tracking-tight block mt-0.5">
              84 Sites
            </span>
            <span className="text-[11px] text-zinc-500 font-semibold block mt-1">4 African Metros</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] uppercase font-extrabold text-emerald-800 block">
              Live & Verified
            </span>
            <span className="text-2xl font-black text-emerald-700 tracking-tight block mt-0.5">
              72 Sites
            </span>
            <span className="text-[11px] text-emerald-800 font-bold block mt-1">ISO 20560 Pass</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-2 border-zinc-300 shadow-xs">
            <span className="text-[10px] uppercase font-extrabold text-zinc-600 block">
              Jobs in Progress
            </span>
            <span className="text-2xl font-black text-[#181716] tracking-tight block mt-0.5">
              8 Sites
            </span>
            <span className="text-[11px] text-zinc-600 font-semibold block mt-1">Mounting & Proof</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200">
            <span className="text-[10px] uppercase font-extrabold text-[#ef5a24] block">
              Scheduled
            </span>
            <span className="text-2xl font-black text-[#181716] tracking-tight block mt-0.5">
              3 Sites
            </span>
            <span className="text-[11px] text-orange-700 font-semibold block mt-1">Next 48 Hours</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200">
            <span className="text-[10px] uppercase font-extrabold text-red-800 block">
              Active Issues
            </span>
            <span className="text-2xl font-black text-red-600 tracking-tight block mt-0.5">
              1 Site
            </span>
            <span className="text-[11px] text-red-700 font-semibold block mt-1">Pruning Permit</span>
          </div>
        </div>
      </div>

      {/* New Purchase In-Progress Alert (if came from Marketplace "Purchase Billboard") */}
      {activePurchaseBillboard && (
        <div className="bg-[#181716] text-white rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#ef5a24] text-white text-xs font-black uppercase tracking-wider inline-block">
              Marketplace Reservation Loaded
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Configure Purchase Flight: {activePurchaseBillboard.name}
            </h3>
            <p className="text-xs text-zinc-300">
              Corridor: {activePurchaseBillboard.location} • Rate: ${activePurchaseBillboard.priceMonthlyUSD.toLocaleString()}/mo • Standard Bank Escrow Ready
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Creative asset uploader opened for newly purchased billboard slot!')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#181716] border border-zinc-200 font-black text-xs transition-colors shadow-sm"
            >
              Upload Creative Flight MP4
            </button>
            <button
              onClick={() => alert('Escrow funds locked via Standard Bank Treasury Rail.')}
              className="px-4 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-xs transition-colors"
            >
              Lock Escrow ($ {activePurchaseBillboard.priceMonthlyUSD})
            </button>
          </div>
        </div>
      )}

      {/* Map Status Color Key Ticker */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#eae7e1] flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <span className="text-zinc-400 uppercase text-[10px] tracking-wider">
          Billboard Status Color Key:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-zinc-700">GREEN = Live / Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm border border-zinc-400" />
            <span className="text-zinc-700">WHITE = Job in Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ef5a24] shadow-sm" />
            <span className="text-zinc-700">ACCENT = Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm" />
            <span className="text-zinc-700">RED = Issue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-black shadow-sm" />
            <span className="text-zinc-700">BLACK = Offline / Expired</span>
          </div>
        </div>
      </div>

      {/* MAIN TRACKER: Live Map & Interactive Pins (Left 7 Cols) + Real-time Activity (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Billboard Pinboard / Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#181716]">
                  Live Campaign Deployment Map
                </h3>
                <p className="text-xs text-zinc-500">
                  Click any billboard pin below to open its verified detail drawer
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                5 Active Arteries Locked
              </span>
            </div>

            {/* Pins Grid List */}
            <div className="space-y-3">
              {pins.map((pin) => {
                const styling = getStatusBadge(pin.status);
                const isSelected = selectedPin?.id === pin.id;

                return (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedPin(pin)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#faf9f6] border-[#181716] ring-2 ring-[#181716]/10 shadow-sm'
                        : 'bg-white border-[#eae7e1] hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pin Color Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full ${styling.bg} shrink-0 border border-black/10`}
                        title={styling.label}
                      />
                      <img
                        src={pin.imageUrl}
                        alt={pin.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#181716] truncate">
                            {pin.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                            {pin.id}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                          {pin.location} ({pin.city})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${styling.chip}`}>
                        {pin.statusLabel}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Real-time Job Events & WebSocket Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-extrabold text-base text-[#181716]">
                  Real-Time Job Telemetry Feed
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 font-mono text-zinc-600 font-bold">
                WebSocket: Connected
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              Live updates of field mounting, camera telemetry, and AI verification logs.
            </p>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-1.5 transition-all hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181716] text-white">
                      {evt.step}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{evt.timestamp}</span>
                  </div>

                  <h5 className="font-extrabold text-xs text-[#181716]">
                    {evt.siteName}
                  </h5>
                  <p className="text-xs text-zinc-600 leading-snug">
                    {evt.description}
                  </p>
                  <span className="text-[10px] text-zinc-400 block pt-1">
                    Auditor / Machine: <strong>{evt.agentName}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROUNDED DETAIL DRAWER (When clicking a billboard) */}
      {selectedPin && (
        <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl border-l border-[#eae7e1] z-50 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#eae7e1]">
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  getStatusBadge(selectedPin.status).bg
                }`}
              />
              <span className="font-extrabold text-xs text-zinc-400 uppercase tracking-wider">
                Billboard Detail Inspection Drawer
              </span>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Billboard Image */}
          <div className="rounded-2xl overflow-hidden aspect-video relative bg-black shadow-md border border-[#eae7e1]">
            <img
              src={selectedPin.imageUrl}
              alt={selectedPin.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-bold">
              {selectedPin.specDimensions}
            </div>
          </div>

          {/* Location & Campaign info */}
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#181716]">{selectedPin.name}</h2>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {selectedPin.location} • {selectedPin.corridor} ({selectedPin.city})
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 text-[11px] font-bold">
                Campaign: {selectedPin.campaign}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 text-[11px] font-bold">
                Agency: {selectedPin.agency}
              </span>
            </div>
          </div>

          {/* Assigned Field Agent & GPS Verification */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">Assigned Field Agent:</span>
              <span className="font-bold text-[#181716]">{selectedPin.assignedAgent || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">GPS Sub-Meter Geofence:</span>
              <span className="font-mono font-bold text-emerald-700">{selectedPin.gpsVerification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">Latest Telemetry Timestamp:</span>
              <span className="font-mono text-zinc-600">{selectedPin.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">Illumination Rating:</span>
              <span className="font-bold text-[#181716]">{selectedPin.luxScore.toLocaleString()} Lux (Daylight Calibrated)</span>
            </div>
          </div>

          {/* Verification Result & Issue History */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI Verification Result:</span>
            </div>
            <p className="text-emerald-950 font-medium leading-relaxed pl-6">
              {selectedPin.verificationResult}
            </p>
            <div className="pt-2 border-t border-emerald-200/60 pl-6 text-emerald-800">
              <strong>Sightline & Issue History:</strong> {selectedPin.issueHistory}
            </div>
          </div>

          {/* 11-Step Real-time Job Lifecycle Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              Canonical Job Lifecycle Progression (11 Stages)
            </h4>

            <div className="space-y-2 pl-2">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isCompleted =
                  selectedPin.currentStep === 'Completed' ||
                  idx <= LIFECYCLE_STEPS.indexOf(selectedPin.currentStep);

                const isCurrent = selectedPin.currentStep === step;

                return (
                  <div key={step} className="flex items-center gap-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-white text-[#ef5a24] ring-2 ring-[#ef5a24] border border-orange-200 shadow-sm'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <span
                      className={`font-bold ${
                        isCompleted ? 'text-zinc-800' : isCurrent ? 'text-[#ef5a24] underline' : 'text-zinc-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions & 360 Reference Report */}
          <div className="pt-4 border-t border-[#eae7e1] flex items-center gap-3">
            <button
              onClick={() => alert(`Downloading 360 reference audit certificate for ${selectedPin.id}...`)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-black text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Download 360 Audit Report</span>
            </button>
            <button
              onClick={() => alert(`Client verification accepted for ${selectedPin.id}. Funds milestone unlocked.`)}
              className="py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-[#181716] border border-zinc-200 font-black text-xs transition-colors shadow-2xs"
            >
              Confirm Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
