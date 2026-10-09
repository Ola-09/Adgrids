import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Compass,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Radio,
  Battery,
  Wifi,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface Screen05Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen05MobileFieldOS: React.FC<Screen05Props> = ({ onNavigate }) => {
  const [photoSnapped, setPhotoSnapped] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeCameraMode, setActiveCameraMode] = useState<'normal' | 'wide' | 'lux'>('normal');

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Mobile Device Container Frame */}
      <div className="bg-[#140338] text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Device Top Status Bar */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold">09:41</span>
            <span className="text-zinc-400">•</span>
            <span className="text-white font-semibold">Field Operative OS</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3.5 h-3.5" /> 5G
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" /> 94%
            </span>
          </div>
        </div>

        {/* Auditor Profile & Hub Strip */}
        <div className="pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
              alt="Babatunde"
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white"
            />
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Babatunde Oladipo</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white text-[#140338] rounded font-extrabold">
                  PRO
                </span>
              </h2>
              <p className="text-[11px] text-zinc-300 font-medium">Field Auditor • Lagos Fleet Alpha</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ON-SITE • LEKKI
            </span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Assigned Shift #481</p>
          </div>
        </div>

        {/* Active Site Assignment Card */}
        <div className="my-3 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-black uppercase text-white tracking-wider">
              Current Target Asset
            </span>
            <span className="text-zinc-300 font-mono text-[11px]">LOS-VI-088</span>
          </div>

          <h3 className="text-base font-extrabold text-white">Victoria Island Mega DOOH Unipole</h3>
          <p className="text-xs text-zinc-300 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
            Ozumba Mbadiwe Ave, Victoria Island, Lagos
          </p>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-zinc-300">
              Flight: <strong className="text-white">MTN 5G Broadband Super-Fast Loop</strong>
            </span>
            <span className="text-white font-bold">14:30 WAT Window</span>
          </div>
        </div>

        {/* CAMERA / HUD VIEWFINDER SIMULATOR */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 border-2 border-white/20 my-4 group select-none">
          <img
            src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
            alt="Camera Viewfinder"
            className={`w-full h-full object-cover transition-all ${
              photoSnapped ? 'brightness-110 contrast-105' : 'brightness-95'
            }`}
          />

          {/* Optical Target Overlay & Crosshairs */}
          <div className="absolute inset-8 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-white text-[#140338] text-[10px] font-black uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AI Target Locked (99.4%)
              </span>
              <span className="text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">
                FRAME RATE 60FPS
              </span>
            </div>

            {/* Center crosshair */}
            <div className="self-center w-8 h-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/70" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/70" />
              <div className="w-8 h-8 rounded-full border border-white/70" />
            </div>

            <div className="flex justify-between items-end text-[10px] font-mono text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              <span className="text-white">LAT: 6.4382° N, LON: 3.4721° E</span>
              <span>COMPASS: 142° SE</span>
            </div>
          </div>

          {/* Camera Controls Floating Strip */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={() => setActiveCameraMode('normal')}
              className={`p-2 rounded-xl text-xs font-bold ${
                activeCameraMode === 'normal' ? 'bg-white text-[#140338]' : 'bg-black/60 text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setActiveCameraMode('wide')}
              className={`p-2 rounded-xl text-xs font-bold ${
                activeCameraMode === 'wide' ? 'bg-white text-[#140338]' : 'bg-black/60 text-white'
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => setActiveCameraMode('lux')}
              className={`p-2 rounded-xl text-xs font-bold ${
                activeCameraMode === 'lux' ? 'bg-white text-[#140338]' : 'bg-black/60 text-white'
              }`}
            >
              LUX
            </button>
          </div>

          {/* Shutter feedback flash */}
          {photoSnapped && (
            <div className="absolute inset-0 bg-white/40 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Shutter Bar */}
        <div className="flex items-center justify-center gap-6 py-2">
          <button
            onClick={() => setPhotoSnapped(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
            title="Reset snap"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Big Shutter Trigger Button */}
          <button
            onClick={() => {
              setPhotoSnapped(true);
              alert('Audit Photo Captured with GPS & Telemetry Signature!');
            }}
            className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg">
              <Camera className="w-7 h-7 text-[#140338]" />
            </div>
          </button>

          <button
            onClick={() => alert('Switching to wide angle lens...')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* Field Verification Checklist */}
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
            Automated Field Verification Checklist
          </span>

          <div className="flex items-center justify-between text-zinc-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              GPS Geofence: Within 12m of target asset
            </span>
            <span className="text-emerald-400 font-bold font-mono">PASSED</span>
          </div>

          <div className="flex items-center justify-between text-zinc-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Line of Sight: 100% Unobstructed
            </span>
            <span className="text-emerald-400 font-bold font-mono">PASSED</span>
          </div>

          <div className="flex items-center justify-between text-zinc-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Screen Matrix Health: 0 Dead Pixels
            </span>
            <span className="text-emerald-400 font-bold font-mono">PASSED</span>
          </div>

          <div className="flex items-center justify-between text-zinc-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Illumination: 88,400 Lux (Bright Sunlight)
            </span>
            <span className="text-white font-bold font-mono">OPTIMAL</span>
          </div>
        </div>

        {/* Main Action Submit Button */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              setSubmitted(true);
              alert('Proof-of-Play Uploaded & Validated by Computer Vision! Pushed to Agency Command.');
            }}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              submitted
                ? 'bg-emerald-500 text-white'
                : 'bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{submitted ? 'Audit Proof Submitted Successfully ✓' : 'Submit Verified Proof-of-Play'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => alert('Opening Hazard Incident Reporting form...')}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300"
            >
              Report Hazard
            </button>
            <button
              onClick={() => onNavigate('screen-02')}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1"
            >
              <span>Next: Lekki Toll Gate (1.4km)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Auditor Daily Route Log */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Today's Audit Shift Log</span>
            <span className="text-zinc-400 font-mono">3 Completed • 4 Remaining</span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-300">
            <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
              <span>12:40 WAT • Lekki Phase 1 Bridge Static Gantry</span>
              <span className="text-emerald-400 font-bold">Approved ✓</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
              <span>13:15 WAT • Admiralty Way Monolith</span>
              <span className="text-emerald-400 font-bold">Approved ✓</span>
            </div>
            <div className="p-2 rounded-xl bg-white/10 border border-white/30 flex items-center justify-between text-white">
              <span className="font-bold">14:10 WAT • Victoria Island DOOH Unipole</span>
              <span className="text-white font-bold">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
