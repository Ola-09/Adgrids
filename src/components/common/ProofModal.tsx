import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, MapPin, Clock, Camera, RefreshCw } from 'lucide-react';
import { VerificationItem } from '../../types';

interface ProofModalProps {
  item: VerificationItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRetake: (id: string) => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({ item, onClose, onApprove, onRetake }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#eae7e1] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae7e1] bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ef5a24] text-white flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#181716]">{item.siteName}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {item.matchPercent}% AI Match
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {item.flightRef} • Captured by {item.agent}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Photo with HUD Overlay */}
          <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-black aspect-video group">
            <img
              src={item.imageUrl}
              alt={item.siteName}
              className="w-full h-full object-cover"
            />
            {/* Optical CV Bounding Box */}
            <div className="absolute inset-x-12 inset-y-8 border-2 border-white rounded-lg pointer-events-none">
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-white text-[#ef5a24] rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Optical CV Passed (99.4%)
              </div>
              <div className="absolute -top-2.5 -right-2.5 w-4 h-4 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-2.5 -left-2.5 w-4 h-4 border-b-2 border-l-2 border-white" />
            </div>

            {/* HUD Telemetry Watermark */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-lg text-white text-xs font-mono flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> LAT: {item.gpsCoords} (GPS Locked)
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {item.timestamp}
                </span>
                <span>ALT: 14.2m</span>
              </div>
            </div>
          </div>

          {/* Compliance Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[#eae7e1] text-center">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Line of Sight</span>
              <span className="text-base font-bold text-emerald-700">{item.lineOfSight}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[#eae7e1] text-center">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Illumination</span>
              <span className="text-base font-bold text-[#181716]">{item.illuminationLux.toLocaleString()} Lux</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[#eae7e1] text-center">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Screen Health</span>
              <span className="text-base font-bold text-emerald-700">{item.deadPixels} Dead Pixels</span>
            </div>
          </div>

          {/* Content Validation Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">Computer Vision Content Validation: Matched • {item.matchPercent}%</p>
              <p className="text-emerald-700 mt-0.5">
                Digital creative file '{item.creativeFilename}' was detected with zero pixel degradation, proper frame rate sync, and full color gamut alignment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onRetake(item.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Request Retake
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApprove(item.id);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#ef5a24] hover:bg-[#df4d19] rounded-xl shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Push to Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
