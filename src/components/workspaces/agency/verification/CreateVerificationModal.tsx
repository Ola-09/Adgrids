import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Camera,
  Video,
  Layers,
  Sparkles,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useBillboards } from '../../../../context/BillboardContext';

interface CreateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultBillboardId?: string;
}

export const CreateVerificationModal: React.FC<CreateVerificationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultBillboardId,
}) => {
  const { billboards } = useBillboards();

  const selectedDefault = billboards.find((b) => b.id === defaultBillboardId) || billboards[0];

  const [selectedBillboardId, setSelectedBillboardId] = useState(selectedDefault?.id || '');
  const [campaignName, setCampaignName] = useState('Safaricom 5G High-Velocity Corridor Flight');
  const [clientName, setClientName] = useState('Safaricom PLC');
  const [acceptableRadiusMeters, setAcceptableRadiusMeters] = useState<number>(50);
  const [deadlineDays, setDeadlineDays] = useState<number>(2);
  const [agentId, setAgentId] = useState('usr-field-agent');
  const [agentName, setAgentName] = useState('Babatunde Oladipo');
  const [instructions, setInstructions] = useState(
    'Verify active physical display mounting, inspect daylight screen lux, capture wide-angle corridor approach sightline, and record 5-sec proof video.'
  );

  // Evidence Checklist
  const [reqPhoto, setReqPhoto] = useState(true);
  const [reqWideAngle, setReqWideAngle] = useState(true);
  const [reqVideo, setReqVideo] = useState(true);
  const [req360Video, setReq360Video] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBoard = billboards.find((b) => b.id === selectedBillboardId) || selectedDefault;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard) return;

    setSaving(true);
    setError(null);

    const requiredEvidenceTypes: string[] = [];
    if (reqPhoto) requiredEvidenceTypes.push('photo');
    if (reqWideAngle) requiredEvidenceTypes.push('wide_angle');
    if (reqVideo) requiredEvidenceTypes.push('video');
    if (req360Video) requiredEvidenceTypes.push('video_360');

    try {
      const res = await fetch('/api/agency/verification/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          billboardId: currentBoard.id,
          siteName: currentBoard.name,
          campaignName,
          clientName,
          metro: currentBoard.metro,
          corridor: currentBoard.corridor,
          lat: currentBoard.lat,
          lng: currentBoard.lng,
          acceptableRadiusMeters,
          requiredEvidence: requiredEvidenceTypes,
          deadline: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString(),
          agentId,
          agentName,
          instructions,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create assignment');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#eae7e1] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7e1] flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ef5a24] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#181716] tracking-tight">
                Create Field Verification Assignment
              </h2>
              <p className="text-xs text-zinc-500">
                Dispatch field operatives to physically visit and verify campaign display presence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Billboard Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Target Billboard Asset
            </label>
            <select
              value={selectedBillboardId}
              onChange={(e) => setSelectedBillboardId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-[#faf9f6] text-xs font-bold text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
            >
              {billboards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.name} ({b.corridor})
                </option>
              ))}
            </select>
            {currentBoard && (
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                Registered GPS: {currentBoard.lat.toFixed(5)}° N, {currentBoard.lng.toFixed(5)}° E • {currentBoard.format}
              </p>
            )}
          </div>

          {/* Campaign & Client */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Campaign Flight Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] font-bold focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Client Brand
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] font-bold focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          {/* Section 4: Configurable Verification Radius */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ef5a24]" />
                <span>Acceptable Verification Radius: {acceptableRadiusMeters} metres</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-bold">Max distance from billboard</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={acceptableRadiusMeters}
              onChange={(e) => setAcceptableRadiusMeters(Number(e.target.value))}
              className="w-full accent-[#ef5a24] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
              <span>20m (Ultra-Strict)</span>
              <span>50m (Standard Default)</span>
              <span>100m (Highway/Flyover)</span>
              <span>200m (Gantry)</span>
            </div>
          </div>

          {/* Section 5: Required Evidence Types */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Required Evidence Deliverables
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqPhoto}
                  onChange={(e) => setReqPhoto(e.target.checked)}
                  className="rounded text-[#ef5a24] focus:ring-0"
                />
                <span className="font-bold text-[#181716]">Primary Billboard Photo</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqWideAngle}
                  onChange={(e) => setReqWideAngle(e.target.checked)}
                  className="rounded text-[#ef5a24] focus:ring-0"
                />
                <span className="font-bold text-[#181716]">Corridor Context Photo</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqVideo}
                  onChange={(e) => setReqVideo(e.target.checked)}
                  className="rounded text-[#ef5a24] focus:ring-0"
                />
                <span className="font-bold text-[#181716]">5-10s Proof Video</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={req360Video}
                  onChange={(e) => setReq360Video(e.target.checked)}
                  className="rounded text-[#ef5a24] focus:ring-0"
                />
                <span className="font-bold text-[#181716]">360° Approach Video</span>
              </label>
            </div>
          </div>

          {/* Field Agent & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Assigned Field Agent
              </label>
              <select
                value={agentId}
                onChange={(e) => {
                  setAgentId(e.target.value);
                  setAgentName(e.target.value === 'usr-field-agent' ? 'Babatunde Oladipo' : 'Field Operative');
                }}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-[#faf9f6] text-xs font-bold text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              >
                <option value="usr-field-agent">Babatunde Oladipo (Lagos Hub)</option>
                <option value="usr-field-mgr">Wanjiku Kamau (Regional Lead)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Audit Deadline
              </label>
              <select
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-[#faf9f6] text-xs font-bold text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              >
                <option value={1}>Within 24 Hours (Urgent)</option>
                <option value={2}>Within 48 Hours</option>
                <option value={5}>Within 5 Days</option>
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Field Operative Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#eae7e1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {saving ? 'Creating Assignment...' : 'Dispatch Verification Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
