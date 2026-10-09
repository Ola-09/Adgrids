import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  DollarSign,
  ExternalLink,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface AgencyClientsProps {
  onOpenClientPortal?: () => void;
  onOpenCampaignDetail?: (id: string) => void;
}

export const AgencyClients: React.FC<AgencyClientsProps> = ({
  onOpenClientPortal,
  onOpenCampaignDetail,
}) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add & Invite Client Modal state (Section 7)
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteBrand, setInviteBrand] = useState('');
  const [inviteTitle, setInviteTitle] = useState('Brand Operations Director');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    inviteUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || localStorage.getItem('adgrid_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setClients(json.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSendClientInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

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
          email: inviteEmail.trim(),
          name: inviteName.trim() || undefined,
          role: 'Customer / Client Company',
          title: inviteTitle.trim() || 'Brand Client Administrator',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInviteResult({
          success: true,
          inviteUrl: window.location.origin + (data.inviteUrl || `/accept-invitation?token=${data.inviteToken}`),
          message: data.message || `Invitation created for ${inviteEmail}.`,
        });
        // Optimistically add to list if not present
        if (inviteName || inviteBrand) {
          setClients((prev) => [
            {
              id: 'client-' + Date.now(),
              name: inviteName || inviteEmail.split('@')[0],
              brand: inviteBrand || 'New Enterprise Client',
              activeCampaigns: 0,
              totalSpendUSD: 0,
              outstandingInvoicesUSD: 0,
              health: 'PENDING_ONBOARDING',
              campaigns: [],
            },
            ...prev,
          ]);
        }
      } else {
        setInviteResult({
          success: false,
          error: data.error || 'Failed to issue client invitation.',
        });
      }
    } catch (err: any) {
      setInviteResult({
        success: false,
        error: err.message || 'Network error sending client invitation.',
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

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Enterprise Client Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {clients.length} Advertisers
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Client-specific active campaign portfolios, cumulative billing, outstanding invoices, and dedicated portal access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsInviteOpen(true);
              setInviteResult(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add & Invite Client</span>
          </button>
          <button
            onClick={fetchClients}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          {onOpenClientPortal && (
            <button
              onClick={onOpenClientPortal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <span>Switch to Client Portal View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enterprise client or brand name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Client Organization</th>
                  <th className="py-3 px-3">Brand Portfolio</th>
                  <th className="py-3 px-3">Active Flights</th>
                  <th className="py-3 px-3">Portfolio Spend</th>
                  <th className="py-3 px-3">Pending Invoices</th>
                  <th className="py-3 px-3">Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {filtered.map((client) => (
                  <tr key={client.name} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-[#181716] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-400" />
                        <span>{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{client.brand}</td>
                    <td className="py-3.5 px-3 font-bold text-zinc-800">{client.activeCampaigns} active</td>
                    <td className="py-3.5 px-3 font-black text-[#181716]">${client.totalSpendUSD.toLocaleString()}</td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">
                      {client.outstandingInvoicesUSD > 0 ? (
                        <span className="text-amber-800 font-bold">${client.outstandingInvoicesUSD.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700">Cleared ✓</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={client.health} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {client.campaigns[0] && onOpenCampaignDetail && (
                        <button
                          onClick={() => onOpenCampaignDetail(client.campaigns[0].id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-xs transition-colors cursor-pointer"
                        >
                          View Flight →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Add & Invite Client Modal (Section 7) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#ece8e1] shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ef5a24] flex items-center justify-center font-black">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#181716]">Add Enterprise Client</h3>
                  <p className="text-[11px] text-zinc-500">
                    Invite client to access dedicated dashboard attached to your agency tenant.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsInviteOpen(false);
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
                  The client account is attached directly to your agency workspace. Share this activation link or let them click the invitation email:
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
                      setIsInviteOpen(false);
                      setInviteResult(null);
                      setInviteEmail('');
                      setInviteName('');
                      setInviteBrand('');
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendClientInvite} className="space-y-4">
                {inviteResult?.error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {inviteResult.error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Client Organization / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Zenith Bank Plc, MTN Nigeria, Flutterwave"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block">
                      Brand / Campaign Portfolio
                    </label>
                    <input
                      type="text"
                      value={inviteBrand}
                      onChange={(e) => setInviteBrand(e.target.value)}
                      placeholder="e.g. Retail Banking, MoMo Africa"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block">
                      Contact Title
                    </label>
                    <input
                      type="text"
                      value={inviteTitle}
                      onChange={(e) => setInviteTitle(e.target.value)}
                      placeholder="e.g. Head of Brand Marketing"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Client Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="brand.lead@advertiser.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    The invitation will be bound to your agency tenant ID and allow access to /admin/client upon activation.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
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
                        <span>Generating Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Client Invitation</span>
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
