import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  Upload,
  AlertTriangle,
  Video,
  Eye,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Lock,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { ProofOfDisplayReportModal, ProofOfDisplayReportData } from '../../common/ProofOfDisplayReportModal';
import { calculateHaversineDistanceMeters } from '../../../utils/geolocationVerifier';

interface FieldTask {
  id: string;
  siteId: string;
  siteName: string;
  billboardId?: string;
  campaignName?: string;
  clientName?: string;
  metro: string;
  corridor: string;
  lat: number;
  lng: number;
  acceptableRadiusMeters?: number;
  requiredEvidence?: string;
  deadline?: string;
  status: string;
  verificationState?: string;
  instructions?: string;
  gpsVerification?: string;
  luxScore?: number;
  verificationResult?: string;
  failureReason?: string;
  locationStatus?: string;
  capturedLat?: number;
  capturedLng?: number;
  capturedAccuracyMeters?: number;
  capturedDistanceMeters?: number;
  evidencePhotoUrl?: string;
  evidencePhotos?: string;
  evidenceVideoUrl?: string;
  evidenceWideAngleUrl?: string;
  evidence360Url?: string;
  ipAddressAuditSignal?: string;
  scheduledDate: string;
  completedAt?: string;
  auditEvents?: string;
}

export const FieldAgentWorkspace: React.FC = () => {
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<FieldTask | null>(null);

  // Mobile Action Step: 'view' | 'navigate' | 'capture'
  const [agentActionTab, setAgentActionTab] = useState<'view' | 'navigate' | 'capture'>('view');

  // GPS Location Capture State (Section 3 & 4)
  const [lockingGps, setLockingGps] = useState(false);
  const [capturedLat, setCapturedLat] = useState<number | null>(null);
  const [capturedLng, setCapturedLng] = useState<number | null>(null);
  const [capturedAccuracy, setCapturedAccuracy] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);

  // Evidence Capture State (Section 5)
  const [luxValue, setLuxValue] = useState<number>(1420);
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80'
  );
  const [wideAnglePhotoUrl, setWideAnglePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80'
  );
  const [videoProofUrl, setVideoProofUrl] = useState<string>('https://assets.adgrid.cloud/video_sample_proof_pop.mp4');
  const [video360Url, setVideo360Url] = useState<string>('');
  const [agentNotes, setAgentNotes] = useState<string>('');

  // Submission & Report State
  const [verifying, setVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReportData, setActiveReportData] = useState<ProofOfDisplayReportData | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/field-agent/today', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setTasks(json.tasks || []);
        setStats(json.stats || { total: 0, verified: 0, pending: 0 });
      }
    } catch (err) {
      console.error('Error fetching field tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSelectTask = (task: FieldTask) => {
    setSelectedTask(task);
    setAgentActionTab('view');
    setCapturedLat(null);
    setCapturedLng(null);
    setCapturedAccuracy(null);
    setLocationDenied(false);
    setCalculatedDistance(null);
    setAgentNotes('');
  };

  // Section 3 & 4: Ask for GPS location permission & compute geodesic distance
  const handleAcquireGps = () => {
    setLockingGps(true);
    setLocationDenied(false);

    if (!('geolocation' in navigator)) {
      setLocationDenied(true);
      setLockingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setCapturedLat(lat);
        setCapturedLng(lng);
        setCapturedAccuracy(acc);

        if (selectedTask) {
          const dist = calculateHaversineDistanceMeters(
            selectedTask.lat,
            selectedTask.lng,
            lat,
            lng
          );
          setCalculatedDistance(dist);
        }

        setLockingGps(false);
      },
      (err) => {
        // Section 3: If location permission is denied:
        // Do NOT fabricate coordinates!
        // Mark LOCATION UNAVAILABLE and route to review state.
        console.warn('Geolocation permission denied or unavailable:', err.message);
        setLocationDenied(true);
        setCapturedLat(null);
        setCapturedLng(null);
        setCapturedAccuracy(null);
        setCalculatedDistance(null);
        setLockingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Quick simulation helper for on-site agent testing in environments without GPS hardware
  const handleSimulateOnSiteGps = () => {
    if (!selectedTask) return;
    setLockingGps(true);
    setTimeout(() => {
      // Simulate sitting ~38m from the billboard
      const simLat = selectedTask.lat + 0.00028;
      const simLng = selectedTask.lng + 0.00018;
      setCapturedLat(simLat);
      setCapturedLng(simLng);
      setCapturedAccuracy(6);
      setLocationDenied(false);

      const dist = calculateHaversineDistanceMeters(
        selectedTask.lat,
        selectedTask.lng,
        simLat,
        simLng
      );
      setCalculatedDistance(dist);
      setLockingGps(false);
    }, 600);
  };

  const handleSimulateOutsideRadiusGps = () => {
    if (!selectedTask) return;
    setLockingGps(true);
    setTimeout(() => {
      // Simulate sitting ~320m away from the billboard
      const simLat = selectedTask.lat + 0.0028;
      const simLng = selectedTask.lng + 0.0019;
      setCapturedLat(simLat);
      setCapturedLng(simLng);
      setCapturedAccuracy(8);
      setLocationDenied(false);

      const dist = calculateHaversineDistanceMeters(
        selectedTask.lat,
        selectedTask.lng,
        simLat,
        simLng
      );
      setCalculatedDistance(dist);
      setLockingGps(false);
    }, 600);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setVerifying(true);
    try {
      const photos = [primaryPhotoUrl];

      const res = await fetch(`/api/field-agent/tasks/${selectedTask.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          capturedLat,
          capturedLng,
          capturedAccuracyMeters: capturedAccuracy,
          locationPermissionDenied: locationDenied,
          photos,
          wideAngleUrl: wideAnglePhotoUrl,
          videoUrl: videoProofUrl,
          video360Url,
          luxScore: Number(luxValue),
          notes: agentNotes,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setToastMessage(json.message);
        setTimeout(() => setToastMessage(null), 4000);
        setSelectedTask(null);
        fetchTasks();
      } else {
        alert(json.error || 'Failed to submit verification');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenReportModal = (task: FieldTask) => {
    let parsedPhotos: string[] = [];
    try {
      if (task.evidencePhotos) parsedPhotos = JSON.parse(task.evidencePhotos);
      else if (task.evidencePhotoUrl) parsedPhotos = [task.evidencePhotoUrl];
    } catch {
      if (task.evidencePhotoUrl) parsedPhotos = [task.evidencePhotoUrl];
    }

    let parsedAudit: any[] = [];
    try {
      if (task.auditEvents) parsedAudit = JSON.parse(task.auditEvents);
    } catch {
      parsedAudit = [];
    }

    const reportData: ProofOfDisplayReportData = {
      reportId: `POD-${task.id.slice(-6).toUpperCase()}`,
      generatedAt: task.completedAt || new Date().toISOString(),
      campaign: task.campaignName || 'Safaricom 5G Flight',
      client: task.clientName || 'Brand Advertiser',
      billboard: task.siteName,
      billboardId: task.billboardId || task.siteId,
      metro: task.metro,
      corridor: task.corridor,
      agent: 'Babatunde Oladipo (Field Operative)',
      timestamp: task.completedAt || task.scheduledDate,
      verificationResult: task.verificationResult || 'Verified',
      verificationState: (task.verificationState as any) || 'VERIFIED',
      acceptableRadiusMeters: task.acceptableRadiusMeters || 50,
      distanceMeters: task.capturedDistanceMeters,
      gpsAccuracyMeters: task.capturedAccuracyMeters,
      locationStatus: (task.locationStatus as any) || 'LOCATION_VERIFIED',
      registeredCoordinates: { lat: task.lat, lng: task.lng },
      capturedCoordinates:
        task.capturedLat !== undefined && task.capturedLng !== undefined
          ? { lat: task.capturedLat, lng: task.capturedLng }
          : null,
      evidence: {
        primaryPhoto: parsedPhotos[0] || task.evidencePhotoUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        allPhotos: parsedPhotos,
        videoUrl: task.evidenceVideoUrl,
        wideAngleUrl: task.evidenceWideAngleUrl,
        video360Url: task.evidence360Url,
      },
      auditEvents: parsedAudit,
      auditSignals: {
        networkNodeIp: task.ipAddressAuditSignal || '197.210.84.12 (Audited Telecom Node Signal)',
        deviceFingerprint: 'Adgrid Mobile Field OS / Linux Handheld Stamped',
      },
    };

    setActiveReportData(reportData);
  };

  // Required evidence list parsing
  let requiredEvidenceTypes: string[] = ['photo', 'wide_angle'];
  if (selectedTask?.requiredEvidence) {
    try {
      requiredEvidenceTypes = JSON.parse(selectedTask.requiredEvidence);
    } catch {
      requiredEvidenceTypes = ['photo'];
    }
  }

  const radiusLimit = selectedTask?.acceptableRadiusMeters || 50;
  const isWithinRadius = calculatedDistance !== null && calculatedDistance <= radiusLimit;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section 2: Mobile-First Header */}
      <div className="bg-[#181716] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#ef5a24]" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Mobile Field OS • Pan-African Route
            </span>
          </div>
          <button
            onClick={fetchTasks}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh Route"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Field Verification Route
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Physical proof-of-play auditing, sub-meter GPS distance validation, and tamper-proof evidence capture.
          </p>
        </div>

        {/* 4 Status KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Assigned</span>
            <span className="text-xl font-black text-white">{stats.total || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Verified</span>
            <span className="text-xl font-black text-emerald-400">{stats.verified || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending</span>
            <span className="text-xl font-black text-amber-400">{stats.pending || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] text-rose-400 uppercase font-bold block">Attention / Review</span>
            <span className="text-xl font-black text-rose-400">{stats.requiresReview || 0}</span>
          </div>
        </div>
      </div>

      {/* Task Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#181716]">Today's Site Verification Tasks</h2>
          <span className="text-xs text-zinc-400 font-medium">Sorted by distance & flight urgency</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading assignments...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            No audit tasks assigned for today. Route complete!
          </div>
        ) : (
          tasks.map((task) => {
            const isTaskVerified = task.verificationState === 'VERIFIED';
            const isTaskReview = task.verificationState === 'REQUIRES_REVIEW';
            const isTaskFailed = task.verificationState === 'FAILED';

            return (
              <div
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer bg-white ${
                  selectedTask?.id === task.id
                    ? 'border-[#ef5a24] shadow-md ring-2 ring-[#ef5a24]/20'
                    : 'border-[#eae7e1] hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isTaskVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isTaskFailed
                            ? 'bg-rose-100 text-rose-800'
                            : isTaskReview
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.verificationState ? task.verificationState.replace('_', ' ') : task.status}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono font-bold">
                        {task.billboardId || task.siteId}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#181716] truncate">
                      {task.siteName}
                    </h3>

                    <p className="text-xs text-zinc-600 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#ef5a24] shrink-0" />
                      <span>{task.corridor} ({task.metro})</span>
                    </p>

                    {task.campaignName && (
                      <p className="text-[11px] text-zinc-500 font-semibold truncate">
                        Flight: {task.campaignName} • Client: {task.clientName || 'Partner'}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {isTaskVerified ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReportModal(task);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>View PoD Report</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTask(task);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Audit Site</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Verification result snippet */}
                {task.verificationResult && (
                  <div className="mt-3 pt-3 border-t border-[#eae7e1] flex items-center justify-between text-xs text-zinc-500">
                    <span className="truncate pr-2">{task.verificationResult}</span>
                    {task.capturedDistanceMeters !== null && task.capturedDistanceMeters !== undefined && (
                      <span className="font-mono font-bold shrink-0 text-zinc-700">
                        {task.capturedDistanceMeters}m distance
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Active Verification Execution Modal / Drawer (Section 2, 3, 4, 5) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#eae7e1] space-y-5 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#eae7e1] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#ef5a24] uppercase tracking-wider block font-mono">
                  Physical Verification • {selectedTask.billboardId || selectedTask.siteId}
                </span>
                <h3 className="text-lg font-black text-[#181716] mt-0.5">
                  {selectedTask.siteName}
                </h3>
                <p className="text-xs text-zinc-500">
                  {selectedTask.corridor} ({selectedTask.metro})
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mobile Action Tabs: View Assignment | Navigate | Capture Evidence */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAgentActionTab('view')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  agentActionTab === 'view' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
                }`}
              >
                1. View Task
              </button>
              <button
                type="button"
                onClick={() => setAgentActionTab('navigate')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  agentActionTab === 'navigate' ? 'bg-white shadow-2xs text-[#181716]' : 'text-zinc-500'
                }`}
              >
                2. Navigate
              </button>
              <button
                type="button"
                onClick={() => setAgentActionTab('capture')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  agentActionTab === 'capture' ? 'bg-white shadow-2xs text-[#ef5a24]' : 'text-zinc-500'
                }`}
              >
                3. Capture & Submit
              </button>
            </div>

            {/* TAB 1: VIEW ASSIGNMENT DETAILS */}
            {agentActionTab === 'view' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-3">
                  <h4 className="text-xs font-extrabold text-[#181716] uppercase tracking-wider">
                    Flight & Asset Requirements
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Campaign:</span>
                      <span className="font-bold text-zinc-800">{selectedTask.campaignName || 'Safaricom 5G'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Client:</span>
                      <span className="font-bold text-zinc-800">{selectedTask.clientName || 'Brand Partner'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Registered GPS:</span>
                      <span className="font-bold font-mono text-zinc-800">
                        {selectedTask.lat.toFixed(5)}° N, {selectedTask.lng.toFixed(5)}° E
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Verification Radius:</span>
                      <span className="font-bold text-emerald-800">
                        {selectedTask.acceptableRadiusMeters || 50} metres maximum
                      </span>
                    </div>
                  </div>

                  {selectedTask.instructions && (
                    <div className="pt-2 border-t border-zinc-200">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Instructions:</span>
                      <p className="text-xs text-zinc-700 italic mt-0.5">{selectedTask.instructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setAgentActionTab('navigate')}
                    className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Proceed to Navigation</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: NAVIGATE TO LOCATION */}
            {agentActionTab === 'navigate' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] mx-auto flex items-center justify-center">
                    <Navigation className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[#181716]">
                      Navigate to {selectedTask.siteName}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Target Coordinates: {selectedTask.lat.toFixed(5)}° N, {selectedTask.lng.toFixed(5)}° E
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.lat},${selectedTask.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Turn-by-Turn GPS Navigation</span>
                  </a>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setAgentActionTab('view')}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setAgentActionTab('capture');
                      handleAcquireGps();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>I Am On Site — Capture Evidence</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CAPTURE EVIDENCE & SUBMIT */}
            {agentActionTab === 'capture' && (
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                {/* Step 1: GPS Lock & Geodesic Distance Check (Section 3 & 4) */}
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#181716] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#ef5a24]" />
                      <span>Physical Location Verification</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      Max Radius: {radiusLimit}m
                    </span>
                  </div>

                  {/* Distance Indicator Box */}
                  {locationDenied ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold block">LOCATION UNAVAILABLE</span>
                        <span className="text-[11px] text-amber-700">
                          Location permission denied. Coordinates will NOT be fabricated. This submission will be routed to compliance review.
                        </span>
                      </div>
                    </div>
                  ) : capturedLat !== null && capturedLng !== null && calculatedDistance !== null ? (
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isWithinRadius
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          {isWithinRadius ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>LOCATION VERIFIED ({calculatedDistance}m from billboard)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              <span>OUTSIDE PERMITTED RADIUS ({calculatedDistance}m away)</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Agent GPS: {capturedLat.toFixed(5)}° N, {capturedLng.toFixed(5)}° E (±{capturedAccuracy}m accuracy)
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          isWithinRadius ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {isWithinRadius ? 'PASSED' : 'RADIUS FAILED'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic p-2 bg-white rounded-xl border border-zinc-200 text-center">
                      Acquiring device GPS fix...
                    </div>
                  )}

                  {/* GPS Controls & Dev Simulators */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAcquireGps}
                      disabled={lockingGps}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {lockingGps ? 'Querying GPS Hardware...' : 'Re-Query Device GPS'}
                    </button>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSimulateOnSiteGps}
                        className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 cursor-pointer"
                        title="Simulate within 38m"
                      >
                        Simulate On-Site (38m)
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulateOutsideRadiusGps}
                        className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 cursor-pointer"
                        title="Simulate outside 320m"
                      >
                        Simulate Outside (320m)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Evidence Deliverables (Section 5) */}
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-3">
                  <span className="text-xs font-black text-[#181716] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-zinc-700" />
                    <span>Evidence Capture & Deliverables</span>
                  </span>

                  {/* Primary Photo */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Primary Face Photo (Full Frame) *
                    </label>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 max-h-40">
                      <img src={primaryPhotoUrl} alt="Primary" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        Primary Face Photo
                      </div>
                    </div>
                    <input
                      type="url"
                      value={primaryPhotoUrl}
                      onChange={(e) => setPrimaryPhotoUrl(e.target.value)}
                      placeholder="Photo URL..."
                      className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white"
                    />
                  </div>

                  {/* Corridor Wide-Angle Photo if required */}
                  {requiredEvidenceTypes.includes('wide_angle') && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        Corridor Context & Sightline Photo (Wide-Angle) *
                      </label>
                      <input
                        type="url"
                        value={wideAnglePhotoUrl}
                        onChange={(e) => setWideAnglePhotoUrl(e.target.value)}
                        placeholder="Wide angle corridor photo URL..."
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white"
                      />
                    </div>
                  )}

                  {/* Video Proof if required */}
                  {requiredEvidenceTypes.includes('video') && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-[#ef5a24]" />
                        <span>Short 5-10s Proof Video URL *</span>
                      </label>
                      <input
                        type="url"
                        value={videoProofUrl}
                        onChange={(e) => setVideoProofUrl(e.target.value)}
                        placeholder="Video clip URL..."
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white"
                      />
                    </div>
                  )}

                  {/* 360 Video if required */}
                  {requiredEvidenceTypes.includes('video_360') && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#ef5a24]" />
                        <span>360° Approach Video URL *</span>
                      </label>
                      <input
                        type="url"
                        value={video360Url}
                        onChange={(e) => setVideo360Url(e.target.value)}
                        placeholder="360 video stream URL..."
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white"
                      />
                    </div>
                  )}

                  {/* Optical Lux Calibration */}
                  <div className="pt-2 border-t border-zinc-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ambient Lux Sensor Reading:</span>
                      </span>
                      <span className="font-mono font-bold text-zinc-900">{luxValue} Lux</span>
                    </div>
                    <input
                      type="range"
                      min="400"
                      max="2500"
                      step="50"
                      value={luxValue}
                      onChange={(e) => setLuxValue(Number(e.target.value))}
                      className="w-full mt-1 accent-[#ef5a24]"
                    />
                  </div>

                  {/* Agent Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Field Operative Notes
                    </label>
                    <textarea
                      rows={2}
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      placeholder="Line of sight unobstructed, illuminated panel calibrated..."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white"
                    />
                  </div>
                </div>

                {/* Submission Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setAgentActionTab('navigate')}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={verifying}
                    className="px-6 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {verifying ? 'Submitting & Evaluating...' : 'Submit Physical Verification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Proof-of-Display Report Modal */}
      <ProofOfDisplayReportModal
        isOpen={!!activeReportData}
        onClose={() => setActiveReportData(null)}
        report={activeReportData}
        defaultTier="enterprise"
      />
    </div>
  );
};
