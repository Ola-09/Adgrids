import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface AgencyRenewalsProps {
  onOpenCampaignDetail?: (id: string) => void;
}

export const AgencyRenewals: React.FC<AgencyRenewalsProps> = ({
  onOpenCampaignDetail,
}) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWindow, setActiveWindow] = useState<'30' | '14' | '7' | 'expired'>('30');

  // Renewal Modal
  const [selectedForRenewal, setSelectedForRenewal] = useState<any | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewBudget, setRenewBudget] = useState(40000);
  const [renewing, setRenewing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agency/campaigns', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching campaigns for renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const now = new Date();

  const getDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const expiring30 = campaigns.filter((c) => {
    const days = getDaysLeft(c.endDate);
    return days > 0 && days <= 30;
  });

  const expiring14 = campaigns.filter((c) => {
    const days = getDaysLeft(c.endDate);
    return days > 0 && days <= 14;
  });

  const expiring7 = campaigns.filter((c) => {
    const days = getDaysLeft(c.endDate);
    return days > 0 && days <= 7;
  });

  const expired = campaigns.filter((c) => {
    const days = getDaysLeft(c.endDate);
    return days <= 0;
  });

  const currentList =
    activeWindow === '30'
      ? expiring30
      : activeWindow === '14'
      ? expiring14
      : activeWindow === '7'
      ? expiring7
      : expired;

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForRenewal) return;
    setRenewing(true);
    try {
      const res = await fetch(`/api/agency/campaigns/${selectedForRenewal.id}/renew`, {
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
        setSelectedForRenewal(null);
        setToastMessage(json.message);
        setTimeout(() => setToastMessage(null), 5000);
        fetchCampaigns();
      } else {
        alert(json.error || 'Failed to renew');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Flight Expiry & Contract Renewal Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {expiring30.length} Expiring Soon
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identify concluding advertiser flights, negotiate concession extensions, and preserve premium corridor placements.
          </p>
        </div>

        <button
          onClick={fetchCampaigns}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Expiry Window Filter Tabs */}
      <div className="flex overflow-x-auto gap-2.5 border-b border-[#eae7e1] pb-2">
        <button
          onClick={() => setActiveWindow('30')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeWindow === '30'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Within 30 Days ({expiring30.length})
        </button>

        <button
          onClick={() => setActiveWindow('14')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeWindow === '14'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Within 14 Days ({expiring14.length})
        </button>

        <button
          onClick={() => setActiveWindow('7')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeWindow === '7'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Urgent 7 Days ({expiring7.length})
        </button>

        <button
          onClick={() => setActiveWindow('expired')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeWindow === 'expired'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#eae7e1]'
          }`}
        >
          Expired Flights ({expired.length})
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No campaigns in this expiration window.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Flight Campaign</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">End Date</th>
                  <th className="py-3 px-3">Days Remaining</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Spend</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {currentList.map((cmp) => {
                  const daysLeft = getDaysLeft(cmp.endDate);
                  return (
                    <tr key={cmp.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#181716]">{cmp.name}</td>
                      <td className="py-3.5 px-3 font-semibold text-zinc-700">{cmp.clientName}</td>
                      <td className="py-3.5 px-3 text-zinc-600 font-medium">
                        {new Date(cmp.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold">
                        {daysLeft > 0 ? (
                          <span className={daysLeft <= 7 ? 'text-rose-600 font-black' : 'text-amber-800'}>
                            {daysLeft} days left
                          </span>
                        ) : (
                          <span className="text-zinc-500">Expired</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={cmp.status} />
                      </td>
                      <td className="py-3.5 px-3 font-black text-[#181716]">${cmp.spendUSD.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onOpenCampaignDetail && (
                            <button
                              onClick={() => onOpenCampaignDetail(cmp.id)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-[11px]"
                            >
                              Detail
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedForRenewal(cmp)}
                            className="px-3 py-1 rounded-lg bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-[11px] cursor-pointer"
                          >
                            Renew Flight
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renewal Dialog Modal */}
      {selectedForRenewal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eae7e1] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#181716]">Renew {selectedForRenewal.name}</h3>
                <p className="text-xs text-zinc-500">Extend campaign duration and allocate budget</p>
              </div>
              <button
                onClick={() => setSelectedForRenewal(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Duration Extension</label>
                <select
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Additional Budget ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={renewBudget}
                  onChange={(e) => setRenewBudget(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForRenewal(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewing}
                  className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold"
                >
                  {renewing ? 'Renewing...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
