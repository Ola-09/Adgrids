import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AgencyRecord {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  licenseNumber?: string | null;
}

export const MediaOwnerAgencies: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [pendingAgencies, setPendingAgencies] = useState<AgencyRecord[]>([]);
  const [approvedAgencies, setApprovedAgencies] = useState<AgencyRecord[]>([]);
  const [rejectedAgencies, setRejectedAgencies] = useState<AgencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media-owner/agencies', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingAgencies(data.pendingAgencies || []);
          setApprovedAgencies(data.approvedAgencies || []);
          setRejectedAgencies(data.rejectedAgencies || []);
        }
      }
    } catch (err) {
      console.error('Failed to load agency applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, [token]);

  const handleAction = async (agencyId: string, action: 'approve' | 'reject') => {
    setActionInProgress(agencyId);
    setFeedback(null);
    try {
      const response = await fetch(`/api/media-owner/agencies/${agencyId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFeedback({
          message: data.message || `Agency ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
          type: 'success',
        });
        await fetchAgencies();
      } else {
        setFeedback({
          message: data.error || `Failed to ${action} agency application.`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Network error while updating agency status.',
        type: 'error',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const getFilteredList = () => {
    let list: AgencyRecord[] = [];
    if (activeTab === 'pending') list = pendingAgencies;
    else if (activeTab === 'approved') list = approvedAgencies;
    else list = [...pendingAgencies, ...approvedAgencies, ...rejectedAgencies];

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
    );
  };

  const displayList = getFilteredList();

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece8e1]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight flex items-center gap-2">
            <Building2 className="text-[#ef5a24]" size={24} />
            Connected Marketing Agencies
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Review agency applications, authorize campaign execution against your inventory, and govern concession relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAgencies}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 bg-white border border-[#dedbd5] rounded-lg hover:border-zinc-400 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'pending'
              ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
              : 'bg-white border-[#ece8e1] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
              Pending Applications
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <strong className="block text-2xl font-black text-[#181716] mt-2">
            {pendingAgencies.length}
          </strong>
          <small className="block text-[11px] text-zinc-500 mt-0.5">
            Awaiting Media Owner approval
          </small>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'approved'
              ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
              : 'bg-white border-[#ece8e1] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              Approved Agencies
            </span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <strong className="block text-2xl font-black text-[#181716] mt-2">
            {approvedAgencies.length}
          </strong>
          <small className="block text-[11px] text-zinc-500 mt-0.5">
            Authorized to book inventory
          </small>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'all'
              ? 'bg-zinc-100 border-zinc-400 ring-1 ring-zinc-400'
              : 'bg-white border-[#ece8e1] hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
              Total Recorded
            </span>
            <Users size={14} className="text-zinc-500" />
          </div>
          <strong className="block text-2xl font-black text-[#181716] mt-2">
            {pendingAgencies.length + approvedAgencies.length + rejectedAgencies.length}
          </strong>
          <small className="block text-[11px] text-zinc-500 mt-0.5">
            Full agency network register
          </small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#ece8e1]">
        <div className="inline-flex rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-white text-[#181716] shadow-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Pending ({pendingAgencies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-white text-[#181716] shadow-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Approved ({approvedAgencies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white text-[#181716] shadow-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            All Agencies
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by agency name, owner, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#dedbd5] bg-zinc-50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="min-h-[220px] flex items-center justify-center p-8 bg-white rounded-xl border border-[#ece8e1]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
            <span className="text-xs font-bold text-zinc-500">Loading agency applications...</span>
          </div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-[#dedbd5]">
          <Building2 size={36} className="mx-auto text-zinc-300 mb-2" />
          <h3 className="text-sm font-bold text-[#181716]">No Agency Applications Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'There are currently no marketing agencies awaiting approval.'
              : 'No matching marketing agencies found in this view.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayList.map((agency) => {
            const isPending = agency.status === 'PENDING';
            const isApproved = agency.status === 'ACTIVE';
            const isRejected = agency.status === 'REJECTED';
            const isProcessing = actionInProgress === agency.id;

            return (
              <div
                key={agency.id}
                className="bg-white border border-[#ece8e1] rounded-xl p-5 shadow-sm hover:border-[#df4d19]/30 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Agency Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#181716] tracking-tight">
                        {agency.name}
                      </h3>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                          <Clock size={11} /> Pending Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase">
                          <CheckCircle2 size={11} /> Active & Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-[10px] font-extrabold uppercase">
                          <XCircle size={11} /> Rejected
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-1.5 text-xs text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-zinc-400 shrink-0" />
                        <span className="font-semibold text-[#181716]">{agency.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-zinc-400 shrink-0" />
                        <span className="truncate">{agency.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-zinc-400 shrink-0" />
                        <span>{agency.phone || 'Phone not provided'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-zinc-400 shrink-0" />
                        <span>{agency.city}, {agency.country}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-400 flex items-center gap-3 pt-1">
                      <span>Submitted: {new Date(agency.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      {agency.licenseNumber && (
                        <span>Notes/License: {agency.licenseNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Section 4) */}
                  <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 pt-2 md:pt-0">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(agency.id, 'approve')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-extrabold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(agency.id, 'reject')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-[#dedbd5] text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          Connected & Authorized
                        </span>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(agency.id, 'reject')}
                          className="text-xs font-bold text-zinc-500 hover:text-red-600 px-2 py-1 transition"
                          title="Revoke agency connection"
                        >
                          Revoke
                        </button>
                      </div>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(agency.id, 'approve')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition"
                      >
                        Re-evaluate & Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
