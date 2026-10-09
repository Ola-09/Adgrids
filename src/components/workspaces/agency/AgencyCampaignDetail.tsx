import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { KPICard } from '../../shared/KPICard';

interface AgencyCampaignDetailProps {
  campaignId: string;
  onBack: () => void;
  onOpenMap: () => void;
}

export const AgencyCampaignDetail: React.FC<AgencyCampaignDetailProps> = ({
  campaignId,
  onBack,
  onOpenMap,
}) => {
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Renewal Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewBudget, setRenewBudget] = useState(50000);
  const [renewing, setRenewing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agency/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load campaign');
      }
      setCampaign(json.campaign);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewing(true);
    try {
      const res = await fetch(`/api/agency/campaigns/${campaignId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          extensionMonths: renewMonths,
          additionalBudgetUSD: renewBudget,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCampaign(json.campaign);
        setIsRenewModalOpen(false);
        setToastMessage(json.message);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(json.error || 'Failed to renew campaign');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRenewing(false);
    }
  };

  if (loading && !campaign) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="font-bold text-base text-[#181716]">{error || 'Campaign not found'}</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold rounded-xl"
        >
          ← Back to Campaigns
        </button>
      </div>
    );
  }

  const locations = campaign.locations || [];
  const issues = campaign.issues || [];
  const jobs = campaign.jobs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button & Campaign Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-[#eae7e1]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#181716] font-semibold w-fit transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
                {campaign.name}
              </h1>
              <StatusBadge status={campaign.status} />
              <StatusBadge status={campaign.health} />
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              Client: <strong className="text-zinc-800">{campaign.clientName}</strong> • Brand:{' '}
              <strong className="text-zinc-800">{campaign.brand}</strong> • Flight Code:{' '}
              <span className="font-mono">{campaign.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenMap}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-bold text-zinc-700 shadow-2xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ef5a24]" />
              <span>Interactive Flight Map</span>
            </button>

            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Renew Flight Contract</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Contract Budget & Spend"
          value={`$${campaign.spendUSD.toLocaleString()}`}
          subValue={`Budget: $${campaign.budgetUSD.toLocaleString()}`}
          icon={DollarSign}
        />
        <KPICard
          label="Pacing Delivery Rate"
          value={`${campaign.deliveryRate}%`}
          subValue={`${campaign.targetImpressions?.toLocaleString() || 0} Target Impressions`}
          icon={Layers}
        />
        <KPICard
          label="Proof-of-Play Verification"
          value={`${campaign.verificationRate}%`}
          subValue={`${locations.length} contract locations live`}
          icon={ShieldCheck}
        />
        <KPICard
          label="Flight Duration"
          value={`${new Date(campaign.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
          subValue={`Started ${new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
          icon={Clock}
        />
      </div>

      {/* Campaign Locations Fleet */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#181716]">Assigned Contract Billboard Locations</h3>
            <p className="text-xs text-zinc-500">
              Active physical and digital assets under this flight agreement.
            </p>
          </div>
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#ef5a24] hover:underline"
          >
            <span>View all on live map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {locations.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4">No locations assigned to this campaign.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eae7e1] text-zinc-400 font-bold">
                  <th className="pb-3 pl-2">Asset Name</th>
                  <th className="pb-3">Metro & Corridor</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">GPS Coords</th>
                  <th className="pb-3">Illumination</th>
                  <th className="pb-3 pr-2 text-right">Delivered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {locations.map((loc: any) => (
                  <tr key={loc.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3 pl-2 font-bold text-[#181716] flex items-center gap-2.5">
                      {loc.previewUrl && (
                        <img
                          src={loc.previewUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-[#eae7e1] shrink-0"
                        />
                      )}
                      <div>
                        <div>{loc.siteName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{loc.billboardId || loc.id}</div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-600">
                      <div>{loc.metro}</div>
                      <div className="text-[10px] text-zinc-400">{loc.corridor}</div>
                    </td>
                    <td className="py-3 text-zinc-700 font-medium">{loc.format}</td>
                    <td className="py-3">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="py-3 font-mono text-[11px] text-zinc-500">
                      {loc.gpsCoords || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
                    </td>
                    <td className="py-3 font-semibold text-zinc-700">
                      {loc.luxScore ? `${loc.luxScore} Lux` : 'N/A'}
                    </td>
                    <td className="py-3 pr-2 text-right font-bold text-[#181716]">
                      {loc.impressionsDelivered?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operational Issues and Field Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues List */}
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Reported Sightline & Technical Issues</span>
            </h3>
            <span className="text-xs text-zinc-400">{issues.length} records</span>
          </div>

          {issues.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-3">No active issues flagged on this flight.</p>
          ) : (
            <div className="space-y-2.5">
              {issues.map((iss: any) => (
                <div key={iss.id} className="p-3.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#181716]">{iss.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        iss.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {iss.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600">{iss.description}</p>
                  <div className="text-[10px] text-zinc-400 pt-1">Site: {iss.siteName} • Status: {iss.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contractor & Vendor Work Orders */}
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#181716] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-zinc-600" />
              <span>Contractor & Production Jobs</span>
            </h3>
            <span className="text-xs text-zinc-400">{jobs.length} work orders</span>
          </div>

          {jobs.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-3">No vendor jobs linked to this campaign.</p>
          ) : (
            <div className="space-y-2.5">
              {jobs.map((job: any) => (
                <div key={job.id} className="p-3.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#181716]">{job.title}</span>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-zinc-600">{job.instructions}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span>Service: {job.serviceType} • Assignee: {job.assigneeName || 'Unassigned'}</span>
                    <span className="font-bold text-zinc-700">${job.payoutUSD.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Renew Modal */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eae7e1] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#181716]">Renew Flight Contract</h3>
                <p className="text-xs text-zinc-500">Extend campaign duration and allocate budget</p>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenew} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Duration Extension (Months)
                </label>
                <select
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold"
                >
                  <option value={1}>1 Month Extension</option>
                  <option value={2}>2 Months Extension</option>
                  <option value={3}>3 Months Extension (Quarterly)</option>
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>12 Months Extension (Annual Lock)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Additional Contract Budget ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={renewBudget}
                  onChange={(e) => setRenewBudget(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs">
                Renewal will extend the campaign timeline and immediately dispatch renewal notices to concessionaires and client executives.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewing}
                  className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold disabled:opacity-50"
                >
                  {renewing ? 'Renewing Flight...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
