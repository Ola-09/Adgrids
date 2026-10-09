import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Clock, Filter, MapPin, RefreshCw, Search, Wrench, X } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const VendorJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [statusInput, setStatusInput] = useState<string>('In Progress');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('ALL');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendor/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setJobs(json.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching vendor jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenJob = (job: any) => {
    setSelectedJob(job);
    setStatusInput(job.status);
    setEvidenceUrlInput(job.evidenceUrl || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendor/jobs/${selectedJob.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          status: statusInput,
          evidenceUrl: evidenceUrlInput || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage(json.message);
        setTimeout(() => setToastMessage(null), 3000);
        setSelectedJob(null);
        fetchJobs();
      } else {
        alert(json.error || 'Failed to update job');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = jobs.filter((j) => {
    if (filterType === 'ALL') return true;
    return j.serviceType === filterType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-2" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Assigned Contractor Work Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {jobs.length} Tasks
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Execute site surveys, vinyl printing, crane rigging, electrical maintenance, and optical proof capture.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-zinc-500">Service Category:</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-white text-xs font-semibold text-zinc-800"
        >
          <option value="ALL">All Categories</option>
          <option value="Printing">Printing</option>
          <option value="Installation">Installation</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Logistics">Logistics</option>
          <option value="Photography">Photography</option>
          <option value="Field verification">Field verification</option>
        </select>
      </div>

      {/* Work Orders Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No work orders match the selected category.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Work Order Title</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Site Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Contract Fee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#181716]">{j.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{j.id}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">{j.serviceType}</td>
                    <td className="py-3.5 px-3 text-zinc-600">{j.siteName}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 font-medium">
                      {new Date(j.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-black text-[#181716]">
                      ${j.payoutUSD.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenJob(j)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Details & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail & Status Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eae7e1] space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  {selectedJob.id}
                </span>
                <h3 className="text-base font-black text-[#181716] mt-0.5">{selectedJob.title}</h3>
                <p className="text-xs text-zinc-500">{selectedJob.siteName} ({selectedJob.location})</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Job Details Card */}
            <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#eae7e1] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Service Type:</span>
                <strong className="text-zinc-800">{selectedJob.serviceType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Contract Payout:</span>
                <span className="font-black text-[#181716]">${selectedJob.payoutUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Deadline:</span>
                <span className="font-semibold text-zinc-700">{new Date(selectedJob.deadline).toLocaleDateString()}</span>
              </div>
              {selectedJob.materials && (
                <div className="pt-1 border-t border-[#eae7e1]">
                  <span className="text-zinc-500 font-medium block">Materials & Specs:</span>
                  <span className="font-semibold text-zinc-800">{selectedJob.materials}</span>
                </div>
              )}
              {selectedJob.instructions && (
                <div className="pt-1 border-t border-[#eae7e1]">
                  <span className="text-zinc-500 font-medium block">Instructions:</span>
                  <p className="text-zinc-700 italic">{selectedJob.instructions}</p>
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Update Work Order Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold text-zinc-800"
                >
                  <option value="Assigned">Assigned (Crew Queued)</option>
                  <option value="In Progress">In Progress (Active On-Site)</option>
                  <option value="Evidence Submitted">Evidence Submitted (Pending PoP Audit)</option>
                  <option value="Completed">Completed (Rigging Finished)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Completion Photo / Proof URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or upload URL"
                  value={evidenceUrlInput}
                  onChange={(e) => setEvidenceUrlInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium text-zinc-800"
                />
                <span className="text-[10px] text-zinc-400 block mt-1">
                  Submitting proof unlocks automatic escrow milestone disbursement.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Save & Submit Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
