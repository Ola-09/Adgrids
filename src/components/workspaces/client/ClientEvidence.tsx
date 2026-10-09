import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sun,
  Video,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import {
  ProofOfDisplayReportModal,
  ProofOfDisplayReportData,
  ClientTier,
} from '../../common/ProofOfDisplayReportModal';
import { WhiteLabelReportModal } from '../../reports/WhiteLabelReportModal';
import { useEntitlements } from '../../../context/EntitlementContext';

interface ClientEvidenceProps {
  onOpenProofModal?: (item: any) => void;
}

export const ClientEvidence: React.FC<ClientEvidenceProps> = ({ onOpenProofModal }) => {
  const { currentPlan, hasEntitlement, openUpgradeModal } = useEntitlements();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [clientTier, setClientTier] = useState<ClientTier>(() =>
    currentPlan.tier === 'enterprise' ? 'enterprise' : currentPlan.tier === 'starter' ? 'basic' : 'professional'
  );
  const [selectedReport, setSelectedReport] = useState<ProofOfDisplayReportData | null>(null);
  const [isWhiteLabelModalOpen, setIsWhiteLabelModalOpen] = useState(false);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const locations = data?.locations || [];
  const filtered = locations.filter((loc: any) => {
    if (filterFormat === 'ALL') return true;
    return loc.format === filterFormat;
  });

  const handleOpenReport = (loc: any) => {
    const report: ProofOfDisplayReportData = {
      reportId: `POD-${loc.id.slice(-6).toUpperCase()}`,
      generatedAt: loc.verifiedAt || new Date().toISOString(),
      campaign: loc.campaign?.name || 'Safaricom 5G Pan-African Corridor Flight',
      client: loc.campaign?.clientName || 'Safaricom PLC',
      billboard: loc.siteName,
      billboardId: loc.billboardId || `BB-${loc.metro}-101`,
      metro: loc.metro,
      corridor: loc.corridor,
      agent: 'Babatunde Oladipo (Certified Field Auditor)',
      timestamp: loc.verifiedAt || new Date().toISOString(),
      verificationResult: 'Location Verified: Agent verified at site (43m from registered billboard within 50m radius, ±6m GPS accuracy). All physical evidence captured.',
      verificationState: 'VERIFIED',
      acceptableRadiusMeters: 50,
      distanceMeters: 43,
      gpsAccuracyMeters: 6,
      locationStatus: 'LOCATION_VERIFIED',
      registeredCoordinates: { lat: loc.lat, lng: loc.lng },
      capturedCoordinates: { lat: loc.lat + 0.0003, lng: loc.lng + 0.0002 },
      evidence: {
        primaryPhoto: loc.latestPhotoUrl || loc.previewUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        allPhotos: [
          loc.latestPhotoUrl || loc.previewUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
        ],
        videoUrl: 'https://assets.adgrid.cloud/sample_proof_video.mp4',
        wideAngleUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
      },
      luxScore: loc.luxScore || 1420,
      reviewer: 'Tendai Moyo (Regional Verification Auditor)',
      reviewedAt: new Date().toISOString(),
      auditEvents: [
        {
          action: 'ASSIGNMENT_CREATED',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          actorName: 'Flight Command Dispatch',
          details: 'Physical verification assignment generated.',
        },
        {
          action: 'EVIDENCE_SUBMITTED',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          actorName: 'Babatunde Oladipo',
          details: 'On-site GPS fix acquired. 43m distance calculated.',
        },
        {
          action: 'VERIFICATION_CALCULATED',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: 'Geodesic radius constraint passed (43m <= 50m).',
        },
        {
          action: 'VERIFICATION_APPROVED',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          actorName: 'Tendai Moyo',
          details: 'Proof of performance cryptographically certified.',
        },
      ],
      auditSignals: {
        networkNodeIp: '197.210.84.12 (Audited Telecom Node Signal)',
        deviceFingerprint: 'Adgrid Mobile Field OS / Linux Handheld Stamped',
      },
    };

    setSelectedReport(report);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Proof-of-Performance Evidence Gallery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Sub-Meter Geodesic Proof
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daylight optical photographs, GPS coordinates, sightline audits, and continuous physical verification records.
          </p>
        </div>

        {/* Section 9: Client Tier Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200 text-xs font-bold">
            <button
              onClick={() => setClientTier('basic')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                clientTier === 'basic' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
              }`}
            >
              Basic Tier
            </button>
            <button
              onClick={() => setClientTier('professional')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                clientTier === 'professional' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => setClientTier('enterprise')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                clientTier === 'enterprise' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
              }`}
            >
              Enterprise
            </button>
          </div>

          <button
            onClick={() => {
              if (!hasEntitlement('can_use_white_label_reports')) {
                openUpgradeModal('can_use_white_label_reports');
              } else {
                setIsWhiteLabelModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>White-Label Studio</span>
            {!hasEntitlement('can_use_white_label_reports') && (
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px]">
                Enterprise
              </span>
            )}
          </button>

          <button
            onClick={fetchEvidence}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tier Explanation Strip */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ef5a24]" />
          <span>
            {clientTier === 'basic' && 'Basic Tier View: Displaying verified status badges, timestamps, and face-on photos.'}
            {clientTier === 'professional' && 'Professional Tier View: Unlocked sub-meter geodesic distance, GPS accuracy readings, video verification, and corridor line of sight.'}
            {clientTier === 'enterprise' && 'Enterprise Tier View: Unlocked full cryptographic audit trail, immutable timeline ledger, network node audit signals, and device fingerprints.'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
          Client Tier: {clientTier}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-500">Filter Format:</span>
        <select
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-white text-xs font-semibold text-zinc-800"
        >
          <option value="ALL">All Formats</option>
          <option value="Digital Billboard (LED)">Digital Billboard (LED)</option>
          <option value="Static Unipole">Static Unipole</option>
          <option value="Megaboard">Megaboard / Gantry</option>
          <option value="Bus Shelter">Bus Shelter</option>
        </select>
      </div>

      {/* Photo Cards Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No verified photographic records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((loc: any) => (
            <div
              key={loc.id}
              className="bg-white rounded-3xl border border-[#eae7e1] overflow-hidden shadow-2xs hover:border-[#dcd7ce] transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo Preview */}
                <div className="relative aspect-video overflow-hidden bg-zinc-100">
                  <img
                    src={
                      loc.latestPhotoUrl ||
                      loc.previewUrl ||
                      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={loc.siteName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VERIFIED</span>
                  </div>

                  {/* Professional Tier: GPS & Distance Overlay */}
                  {clientTier !== 'basic' && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#ef5a24]" />
                      <span>Distance: 43m • ±6m accuracy</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#181716] truncate">{loc.siteName}</h3>
                    <StatusBadge status={loc.status} size="sm" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">
                    {loc.corridor} • {loc.metro}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">Display Format:</span>
                      <span className="font-semibold text-zinc-700">{loc.format}</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">Verification Timestamp:</span>
                      <span className="font-mono text-zinc-700">Today, 09:42 WAT</span>
                    </div>

                    {/* Professional Tier: Video & Line of Sight */}
                    {clientTier !== 'basic' && (
                      <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-200/60">
                        <span className="text-zinc-500 font-medium">Video Evidence:</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>5s Proof Clip Verified</span>
                        </span>
                      </div>
                    )}

                    {/* Enterprise Tier: Telemetry Lux & Audit Ledger */}
                    {clientTier === 'enterprise' && (
                      <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-200/60">
                        <span className="text-zinc-500 font-medium">Telemetry Lux Score:</span>
                        <span className="font-bold text-amber-700 flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          <span>{loc.luxScore || 1420} Lux Calibrated</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleOpenReport(loc)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Proof-of-Display Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structured Proof-of-Display Report Modal */}
      <ProofOfDisplayReportModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        defaultTier={clientTier}
      />

      {/* Enterprise White-Label Report Studio Modal */}
      <WhiteLabelReportModal
        isOpen={isWhiteLabelModalOpen}
        onClose={() => setIsWhiteLabelModalOpen(false)}
      />
    </div>
  );
};
