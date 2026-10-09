import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Inbox, RefreshCw, XCircle } from 'lucide-react';
import { StatusBadge } from '../../shared/StatusBadge';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const MediaOwnerBookings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media-owner/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/media-owner/bookings/${bookingId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage(json.message);
        setTimeout(() => setToastMessage(null), 3000);
        fetchBookings();
      } else {
        alert(json.error || 'Action failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const bookings = data?.bookings || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Flight Booking Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {bookings.length} Concession RFQs
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Review inbound advertiser proposals, approve corridor locks, and track verified flight activations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No booking requests currently pending.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Concession Asset</th>
                  <th className="py-3 px-3">Agency & Brand</th>
                  <th className="py-3 px-3">Flight Campaign</th>
                  <th className="py-3 px-3">Flight Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Gross Contract</th>
                  <th className="py-3 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {bookings.map((bkg: any) => (
                  <tr key={bkg.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#181716]">{bkg.billboardName}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-800">{bkg.brand}</div>
                      <div className="text-[10px] text-zinc-400">{bkg.agencyName}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-zinc-700">{bkg.campaignName}</td>
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {new Date(bkg.startDate).toLocaleDateString()} – {new Date(bkg.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={bkg.status} />
                    </td>
                    <td className="py-3.5 px-3 font-black text-[#181716]">
                      ${bkg.totalAmountUSD.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {bkg.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBookingAction(bkg.id, 'reject')}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleBookingAction(bkg.id, 'approve')}
                            className="px-3 py-1 rounded-lg bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-medium text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
