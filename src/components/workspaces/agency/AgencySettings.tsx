import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Copy,
  Edit3,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { AgencyWorkspaceSetupModal } from './AgencyWorkspaceSetupModal';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const AgencySettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Campaign Manager');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const fetchWorkspaceAndTeam = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
      };

      const [wsRes, teamRes] = await Promise.all([
        fetch('/api/agency/workspace', { headers }),
        fetch('/api/agency/team', { headers }),
      ]);

      const wsJson = await wsRes.json();
      const teamJson = await teamRes.json();

      if (wsJson.success) {
        setWorkspace(wsJson.workspace);
      }
      if (teamJson.success) {
        setTeamMembers(teamJson.members || []);
        setInvitations(teamJson.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching workspace settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceAndTeam();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    setInviteSuccessMsg(null);
    setCopiedLink(false);

    try {
      const res = await fetch('/api/agency/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInviteSuccessMsg(`Invitation dispatched to ${inviteEmail}`);
        setLastInviteUrl(window.location.origin + data.inviteUrl);
        setInviteEmail('');
        fetchWorkspaceAndTeam();
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending invite');
    } finally {
      setInviteSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Workspace & Team Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ef5a24] font-black text-xs">
              Tenant Administration
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure agency parameters, manage staff access, invite field agents and client representatives.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWorkspaceAndTeam}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Workspace Profile</span>
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <>
          {/* Workspace Summary Card */}
          <div className="bg-white rounded-3xl border border-[#eae7e1] p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#eae7e1]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#fff5f2] border border-[#ef5a24]/30 flex items-center justify-center overflow-hidden shrink-0">
                  {workspace?.logoUrl ? (
                    <img
                      src={workspace.logoUrl}
                      alt={workspace.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#ef5a24]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-[#181716]">{workspace?.name || 'Marketing Agency'}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-[10px]">
                      {workspace?.type || 'AGENCY'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {workspace?.city || 'Lagos'}, {workspace?.country || 'Nigeria'} • {workspace?.address || 'No headquarters registered'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#181716]">Currency & Regional Time</div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    {workspace?.currency || 'USD'} • {workspace?.timezone || 'WAT (UTC+1)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Active Team Members
                </span>
                <p className="text-xl font-extrabold text-[#181716] mt-1">{teamMembers.length}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Pending Invitations
                </span>
                <p className="text-xl font-extrabold text-[#ef5a24] mt-1">{invitations.length}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Corporate Phone
                </span>
                <p className="text-xs font-bold text-[#181716] mt-2 truncate">
                  {workspace?.phone || 'Not configured'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Official Website
                </span>
                <p className="text-xs font-bold text-[#ef5a24] mt-2 truncate">
                  {workspace?.website || 'Not configured'}
                </p>
              </div>
            </div>
          </div>

          {/* Team Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#181716]">Team Members & Access Control</h2>
                <p className="text-xs text-zinc-500">
                  Authorized personnel operating within this marketing agency workspace.
                </p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Team Member</span>
              </button>
            </div>

            {/* Team Table */}
            <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Title</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eae7e1]">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#faf9f6] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#181716] flex items-center gap-2.5">
                          <img
                            src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={member.name}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-200"
                          />
                          <span>{member.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-zinc-600">{member.email}</td>
                        <td className="py-3.5 px-3 font-bold text-[#ef5a24]">{member.role}</td>
                        <td className="py-3.5 px-3 text-zinc-500">{member.title || 'Staff'}</td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800">
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-zinc-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Invitations list if any */}
            {invitations.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-extrabold text-[#181716]">Pending Organization Invitations</h3>
                <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <div>
                          <div className="font-bold text-xs text-[#181716]">{inv.email}</div>
                          <div className="text-[10px] text-zinc-500">Invited as {inv.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Workspace Setup Modal */}
      <AgencyWorkspaceSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialData={workspace}
        onSuccess={(updated) => setWorkspace(updated)}
      />

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#eae7e1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e1]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#ef5a24]" />
                <h3 className="text-base font-extrabold text-[#181716]">Invite Agency Teammate</h3>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteSuccessMsg(null);
                  setLastInviteUrl(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inviteSuccessMsg && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
                  <CheckCircle2 className="w-4 h-4 text-[#ef5a24]" />
                  <span>{inviteSuccessMsg}</span>
                </div>
                {lastInviteUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={lastInviteUrl}
                      className="flex-1 text-[10px] font-mono bg-white px-2 py-1.5 rounded-lg border border-orange-200 text-zinc-600 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lastInviteUrl)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#ef5a24] text-white text-[10px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Teammate Work Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@youragency.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Assigned Operating Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="Campaign Manager">Campaign Manager (Flights, Inventory & Pacing)</option>
                  <option value="Operations Manager">Operations Manager (Vendors & Dispatches)</option>
                  <option value="Account Manager">Account Manager (Clients & Relationships)</option>
                  <option value="Finance Manager">Finance Manager (Billing & Payouts)</option>
                  <option value="Field Manager">Field Manager (Audits & Field Crews)</option>
                  <option value="Field Agent">Field Agent (Mobile Verification OS)</option>
                  <option value="Agency Staff">Agency Staff (Asset & Traffic Coordinator)</option>
                  <option value="Customer / Client Company">Client Representative (Brand Viewer)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#eae7e1] text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteSending}
                  className="px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {inviteSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Generate Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
