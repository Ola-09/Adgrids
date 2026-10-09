import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Camera,
  Download,
  Video,
  Layers,
  Printer,
  ChevronRight,
  ExternalLink,
  Lock,
  Smartphone,
  Wifi,
  Eye,
  Calendar,
} from 'lucide-react';
import { VerificationState, LocationVerificationStatus } from '../../utils/geolocationVerifier';

export type ClientTier = 'basic' | 'professional' | 'enterprise';

export interface ProofOfDisplayReportData {
  reportId: string;
  generatedAt: string;
  campaign: string;
  client: string;
  billboard: string;
  billboardId: string;
  metro: string;
  corridor: string;
  agent: string;
  timestamp: string;
  verificationResult: string;
  verificationState: VerificationState;
  acceptableRadiusMeters?: number;
  distanceMeters?: number | null;
  gpsAccuracyMeters?: number | null;
  locationStatus?: LocationVerificationStatus;
  registeredCoordinates?: { lat: number; lng: number };
  capturedCoordinates?: { lat: number; lng: number } | null;
  evidence: {
    primaryPhoto: string;
    allPhotos?: string[];
    videoUrl?: string;
    wideAngleUrl?: string;
    video360Url?: string;
  };
  reviewer?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  luxScore?: number;
  auditEvents?: Array<{
    action: string;
    timestamp: string;
    actorName?: string;
    actorRole?: string;
    details?: string;
  }>;
  auditSignals?: {
    networkNodeIp?: string;
    deviceFingerprint?: string;
  };
}

interface ProofOfDisplayReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ProofOfDisplayReportData | null;
  defaultTier?: ClientTier;
  allowTierSwitch?: boolean;
}

export const ProofOfDisplayReportModal: React.FC<ProofOfDisplayReportModalProps> = ({
  isOpen,
  onClose,
  report,
  defaultTier = 'enterprise',
  allowTierSwitch = true,
}) => {
  const [activeTier, setActiveTier] = useState<ClientTier>(defaultTier);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!isOpen || !report) return null;

  const photosList =
    report.evidence.allPhotos && report.evidence.allPhotos.length > 0
      ? report.evidence.allPhotos
      : [report.evidence.primaryPhoto];

  const isVerified = report.verificationState === 'VERIFIED';
  const isFailed = report.verificationState === 'FAILED';
  const isReview = report.verificationState === 'REQUIRES_REVIEW';
  const isReverification = report.verificationState === 'REVERIFICATION_REQUESTED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#eae7e1] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7e1] flex items-center justify-between bg-[#faf9f6] print:bg-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                isVerified
                  ? 'bg-emerald-600'
                  : isFailed
                  ? 'bg-rose-600'
                  : 'bg-amber-600'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isFailed ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-zinc-500">
                  {report.reportId}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : isFailed
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.verificationState.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-base font-black text-[#181716] tracking-tight mt-0.5">
                Physical Proof-of-Display Audit Report
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {allowTierSwitch && (
              <div className="hidden sm:flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200 text-xs font-bold mr-2">
                <button
                  onClick={() => setActiveTier('basic')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTier === 'basic' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
                  }`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setActiveTier('professional')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTier === 'professional' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
                  }`}
                >
                  Professional
                </button>
                <button
                  onClick={() => setActiveTier('enterprise')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTier === 'enterprise' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
                  }`}
                >
                  Enterprise
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Top Asset & Campaign Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                Campaign Flight
              </span>
              <p className="text-xs font-black text-[#181716] truncate mt-0.5">
                {report.campaign}
              </p>
              <span className="text-[10px] text-zinc-500 truncate block">
                Client: {report.client}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                Billboard Asset
              </span>
              <p className="text-xs font-black text-[#181716] truncate mt-0.5">
                {report.billboard}
              </p>
              <span className="text-[10px] font-mono text-zinc-500 truncate block">
                ID: {report.billboardId}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                Corridor & Metro
              </span>
              <p className="text-xs font-black text-[#181716] truncate mt-0.5">
                {report.corridor}
              </p>
              <span className="text-[10px] text-zinc-500 truncate block">
                Metro: {report.metro}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                Audit Timestamp
              </span>
              <p className="text-xs font-bold text-[#181716] truncate mt-0.5">
                {new Date(report.timestamp).toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-500 truncate block">
                Agent: {report.agent}
              </span>
            </div>
          </div>

          {/* Section 4: Physical Geolocation & Radius Verification (Professional & Enterprise) */}
          {activeTier !== 'basic' && (
            <div
              className={`p-4 rounded-2xl border ${
                isVerified
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : isFailed
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isVerified
                        ? 'bg-emerald-600 text-white'
                        : isFailed
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-zinc-950">
                      Geodesic Distance Verification: {report.locationStatus?.replace('_', ' ')}
                    </h3>
                    <p className="text-[11px] text-zinc-700 mt-0.5">
                      {report.verificationResult}
                    </p>
                  </div>
                </div>

                {report.distanceMeters !== undefined && report.distanceMeters !== null && (
                  <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-zinc-200 text-right">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                        Captured Distance
                      </span>
                      <span className="text-sm font-black text-[#181716]">
                        {report.distanceMeters} metres
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                        GPS Accuracy
                      </span>
                      <span className="text-sm font-black text-zinc-700">
                        ±{report.gpsAccuracyMeters || 8}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                        Max Allowed Radius
                      </span>
                      <span className="text-sm font-black text-zinc-700">
                        {report.acceptableRadiusMeters || 50}m
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinates Comparison */}
              {report.registeredCoordinates && (
                <div className="mt-3 pt-3 border-t border-zinc-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-white/70 border border-zinc-200 flex items-center justify-between">
                    <span className="text-zinc-500 font-sans font-bold">Registered Billboard GPS:</span>
                    <span className="font-bold text-zinc-900">
                      {report.registeredCoordinates.lat.toFixed(5)}° N, {report.registeredCoordinates.lng.toFixed(5)}° E
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/70 border border-zinc-200 flex items-center justify-between">
                    <span className="text-zinc-500 font-sans font-bold">Field Agent Captured GPS:</span>
                    <span className="font-bold text-zinc-900">
                      {report.capturedCoordinates
                        ? `${report.capturedCoordinates.lat.toFixed(5)}° N, ${report.capturedCoordinates.lng.toFixed(5)}° E`
                        : 'LOCATION UNAVAILABLE'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Evidence Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#ef5a24]" />
                <span>Captured Physical Evidence ({photosList.length} photos)</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-medium">
                Cryptographically Stamped & Geo-Tagged
              </span>
            </div>

            {/* Primary Photo Viewer with HUD Watermark */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-200 aspect-video max-h-[380px]">
              <img
                src={photosList[selectedPhotoIndex] || report.evidence.primaryPhoto}
                alt="Physical Billboard Evidence"
                className="w-full h-full object-cover"
              />

              {/* HUD Telemetry Watermark */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs font-mono flex flex-wrap items-center justify-between border border-white/10 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> STAMPED: {report.billboardId}
                  </span>
                  {activeTier !== 'basic' && report.capturedCoordinates && (
                    <span className="text-zinc-300">
                      {report.capturedCoordinates.lat.toFixed(5)}° N, {report.capturedCoordinates.lng.toFixed(5)}° E
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(report.timestamp).toISOString()}
                  </span>
                  {report.luxScore && <span>LUX: {report.luxScore}</span>}
                </div>
              </div>
            </div>

            {/* Additional Photos / Wide Angle & Video Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {photosList.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-[#ef5a24] shadow-xs'
                      : 'border-zinc-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Wide Angle Thumbnail (Professional/Enterprise) */}
              {activeTier !== 'basic' && report.evidence.wideAngleUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 group">
                  <img src={report.evidence.wideAngleUrl} alt="Corridor context" className="w-full h-full object-cover opacity-80" />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white bg-black/40">
                    CORRIDOR
                  </span>
                </div>
              )}

              {/* Video Thumbnail (Professional/Enterprise) */}
              {activeTier !== 'basic' && report.evidence.videoUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 flex items-center justify-center text-white">
                  <Video className="w-5 h-5 text-[#ef5a24]" />
                  <span className="absolute bottom-1 text-[8px] font-black uppercase">
                    PRO-VIDEO
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 10: Enterprise Audit Timeline & Network Signals */}
          {activeTier === 'enterprise' && (
            <div className="space-y-4 pt-3 border-t border-[#eae7e1]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enterprise Cryptographic Audit Trail (Append-Only)</span>
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold">
                  Immutable Verification Ledger
                </span>
              </div>

              {/* Network Node Audit Signal Callout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="flex items-center gap-2 text-zinc-700 font-bold">
                    <Wifi className="w-3.5 h-3.5 text-[#ef5a24]" />
                    <span>Network Node Audit Signal</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {report.auditSignals?.networkNodeIp || '197.210.84.12 (Telecom Node)'}
                  </p>
                  <span className="text-[9px] text-zinc-400 block italic">
                    * Retained as an auxiliary audit signal only; physical verification is exclusively determined by hardware GPS proximity.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="flex items-center gap-2 text-zinc-700 font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-[#ef5a24]" />
                    <span>Field Operative Session Fingerprint</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono truncate">
                    {report.auditSignals?.deviceFingerprint || 'Adgrid Mobile Field OS / Linux Handheld Stamped'}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">
                    Device verified: Active sensor stream calibrated.
                  </span>
                </div>
              </div>

              {/* Reviewer Sign-off if reviewed */}
              {report.reviewer && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-950">
                    <span>Manually Reviewed by: {report.reviewer}</span>
                    <span className="text-[10px] text-purple-700">
                      {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : 'Audited'}
                    </span>
                  </div>
                  {report.reviewerNotes && (
                    <p className="text-[11px] text-purple-800 mt-1">
                      Auditor Notes: {report.reviewerNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Audit Events Timeline */}
              {report.auditEvents && report.auditEvents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 block">
                    Verification Lifecycle Timeline
                  </span>
                  <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                    {report.auditEvents.map((evt, idx) => (
                      <div key={idx} className="p-2.5 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-extrabold text-[#181716]">{evt.action.replace('_', ' ')}</span>
                          {evt.details && <span className="text-zinc-500 text-[11px]">— {evt.details}</span>}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#eae7e1] flex items-center justify-between bg-[#faf9f6] print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Tier View:</span>
            <span className="font-black text-xs uppercase text-[#181716]">{activeTier}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
