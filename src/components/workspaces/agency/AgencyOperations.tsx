import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Filter,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { KPICard } from '../../shared/KPICard';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface AgencyOperationsProps {
  onOpenCampaignDetail?: (id: string) => void;
  onOpenProofModal?: (item: any) => void;
}

export const AgencyOperations: React.FC<AgencyOperationsProps> = ({
  onOpenCampaignDetail,
  onOpenProofModal,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'locations' | 'issues' | 'jobs' | 'field'>('locations');

  // Field Agent Invitation Modal State (Section 8)
  const [isInviteAgentOpen, setIsInviteAgentOpen] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentTitle, setAgentTitle] = useState('Senior Field Operative & Drone Auditor');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    inviteUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/operations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || localStorage.getItem('adgrid_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.operations);
      }
    } catch (err) {
      console.error('Error fetching operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const handleSendAgentInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentEmail.trim()) return;

    setSubmittingInvite(true);
    setInviteResult(null);

    try {
      const res = await fetch('/api/agency/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || localStorage.getItem('adgrid_token') || ''}`,
        },
        body: JSON.stringify({
          email: agentEmail.trim(),
          name: agentName.trim() || undefined,
          role: 'Field Agent',
          title: agentTitle.trim() || 'Field Verification Operative',
          phone: agentPhone.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setInviteResult({
          success: true,
          inviteUrl: window.location.origin + (json.inviteUrl || `/accept-invitation?token=${json.inviteToken}`),
          message: json.message || `Invitation generated for ${agentEmail}.`,
        });
      } else {
        setInviteResult({
          success: false,
          error: json.error || 'Failed to issue field agent invitation.',
        });
      }
    } catch (err: any) {
      setInviteResult({
        success: false,
        error: err.message || 'Network error sending invitation.',
      });
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const stats = data?.stats || {};
  const locations = data?.locations || [];
  const issues = data?.issues || [];
  const jobs = data?.jobs || [];
  const fieldTasks = data?.fieldTasks || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Operations & Deployment Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Field Telemetry
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time tracking of billboard deployments, field agent verification audits, contractor mounting, and hardware alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsInviteAgentOpen(true);
              setInviteResult(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Field Agent</span>
          </button>
          <button
            onClick={fetchOperations}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Operations Stream</span>
          </button>
        </div>
      </div>

      {/* 4 Operations KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Total Managed Locations"
          value={`${stats.totalLocations || 0}`}
          subValue={`${stats.liveLocations || 0} currently live and serving`}
          icon={MapPin}
        />
        <KPICard
          label="Pending PoP Verification"
          value={`${stats.pendingVerification || 0}`}
          subValue="Daylight optical audit needed"
          icon={ShieldCheck}
          badge={
            stats.pendingVerification > 0 ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Action Needed</span>
            ) : undefined
          }
        />
        <KPICard
          label="Open Field Issues"
          value={`${stats.openIssuesCount || 0}`}
          subValue="Sightline & hardware alerts"
          icon={AlertTriangle}
          badge={
            stats.openIssuesCount > 0 ? (
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">Alert</span>
            ) : undefined
          }
        />
        <KPICard
          label="Active Contractor Jobs"
          value={`${stats.activeJobsCount || 0}`}
          subValue={`${stats.overdueJobsCount || 0} overdue work orders`}
          icon={Wrench}
        />
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#eae7e1] pb-2">
        <button
          onClick={() => setActiveSection('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'locations'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Live Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveSection('issues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'issues'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Flagged Issues ({issues.length})
        </button>
        <button
          onClick={() => setActiveSection('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'jobs'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Contractor Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveSection('field')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'field'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Field Audit Tasks ({fieldTasks.length})
        </button>
      </div>

      {/* Main Section Content */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : activeSection === 'locations' ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Asset & Location</th>
                  <th className="py-3 px-3">Metro Corridor</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">GPS Telemetry</th>
                  <th className="py-3 px-3">Campaign Flight</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {locations.map((loc: any) => (
                  <tr key={loc.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">
                      <div>{loc.siteName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{loc.billboardId || loc.id}</div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600">
                      <div>{loc.metro}</div>
                      <div className="text-[10px] text-zinc-400">{loc.corridor}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{loc.format}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-emerald-800">
                      {loc.gpsCoords || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {loc.campaign?.name || 'Assigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {loc.campaign && onOpenCampaignDetail && (
                        <button
                          onClick={() => onOpenCampaignDetail(loc.campaign.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-[11px]"
                        >
                          Flight
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSection === 'issues' ? (
        <div className="space-y-3">
          {issues.map((iss: any) => (
            <div
              key={iss.id}
              className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      iss.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {iss.severity} Alert
                  </span>
                  <h4 className="font-extrabold text-sm text-[#181716]">{iss.title}</h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{iss.description}</p>
                <div className="text-[11px] text-zinc-400 pt-1">
                  Site: <strong className="text-zinc-700">{iss.siteName}</strong> • Flight:{' '}
                  <span className="font-semibold">{iss.campaign?.name}</span> • Status:{' '}
                  <StatusBadge status={iss.status} size="sm" />
                </div>
              </div>

              {iss.campaign && onOpenCampaignDetail && (
                <button
                  onClick={() => onOpenCampaignDetail(iss.campaign.id)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-[#181716] shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Inspect Flight
                </button>
              )}
            </div>
          ))}
        </div>
      ) : activeSection === 'jobs' ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Work Order Title</th>
                  <th className="py-3 px-3">Service Type</th>
                  <th className="py-3 px-3">Location Site</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-4 text-right">Contract Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">{job.title}</td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{job.serviceType}</td>
                    <td className="py-3.5 px-3 text-zinc-600">{job.siteName}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-zinc-600">{job.assigneeName || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#181716]">
                      ${job.payoutUSD.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fieldTasks.map((t: any) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} size="sm" />
                  <h4 className="font-extrabold text-sm text-[#181716]">{t.siteName}</h4>
                </div>
                <p className="text-xs text-zinc-600">{t.instructions}</p>
                <div className="text-[11px] text-zinc-400">
                  Corridor: {t.corridor} ({t.metro}) • Result: {t.verificationResult || 'Pending inspection'}
                </div>
              </div>

              {t.evidencePhotoUrl && (
                <img
                  src={t.evidencePhotoUrl}
                  alt="Proof"
                  className="w-16 h-12 rounded-xl object-cover border border-[#eae7e1] shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      )}
      {/* Invite Field Agent Modal (Section 8) */}
      {isInviteAgentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#ece8e1] shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ef5a24] flex items-center justify-center font-black">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#181716]">Invite Field Agent</h3>
                  <p className="text-[11px] text-zinc-500">
                    Deploy field agent tied strictly to your marketing agency tenant.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsInviteAgentOpen(false);
                  setInviteResult(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            {inviteResult?.success ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                  <Check size={16} />
                  <span>{inviteResult.message}</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  The Field Agent account is attached to your agency tenant. Share this setup link for the operative to activate their account and launch the Field OS:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-300">
                  <input
                    type="text"
                    readOnly
                    value={inviteResult.inviteUrl}
                    className="flex-1 text-[11px] font-mono text-zinc-700 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(inviteResult.inviteUrl!)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteAgentOpen(false);
                      setInviteResult(null);
                      setAgentEmail('');
                      setAgentName('');
                      setAgentPhone('');
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendAgentInvite} className="space-y-4">
                {inviteResult?.error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {inviteResult.error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Field Agent Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Babatunde Oladipo"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block">
                      Work Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={agentEmail}
                        onChange={(e) => setAgentEmail(e.target.value)}
                        placeholder="agent@agency.africa"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={agentPhone}
                      onChange={(e) => setAgentPhone(e.target.value)}
                      placeholder="+234 802 345 6789"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Deployment Specialization
                  </label>
                  <input
                    type="text"
                    value={agentTitle}
                    onChange={(e) => setAgentTitle(e.target.value)}
                    placeholder="e.g. Senior Drone Auditor & Rapid Optical Inspection"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                  <p className="text-[10px] text-zinc-400">
                    The operative will be provisioned directly under your agency tenant with Mobile Field OS access (/admin/field-agent).
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsInviteAgentOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#eae7e1] text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {submittingInvite ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Agent Invitation</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
