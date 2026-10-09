import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  Inbox,
  Plus,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { StatusBadge } from '../../shared/StatusBadge';
import { useBillboards } from '../../../context/BillboardContext';
import { useAuth } from '../../../context/AuthContext';
import { AddBillboardModal } from '../../modals/AddBillboardModal';

interface MediaOwnerOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const MediaOwnerOverview: React.FC<MediaOwnerOverviewProps> = ({ onNavigateTab }) => {
  const { billboards, exportBillboardsCSV } = useBillboards();
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMediaOwnerOverview = async () => {
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
      console.error('Error fetching media owner overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaOwnerOverview();
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
        setTimeout(() => setToastMessage(null), 4000);
        fetchMediaOwnerOverview();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const availableCount = billboards.filter((b) => b.availabilityStatus === 'Available Now').length;
  const occupiedCount = billboards.length - availableCount;
  const occupancyRate = billboards.length > 0 ? Math.round((occupiedCount / billboards.length) * 100) : 85;
  const monthlyGross = billboards.reduce((acc, b) => acc + (b.priceMonthlyUSD || 0), 0);
  const bookings = data?.bookings || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Media Owner & Concessionaire Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {currentUser?.organization || 'Concession Inventory'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Fleet inventory management, booking RFQ approval workflows, corridor yields, and escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportBillboardsCSV()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Inventory (CSV)</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Billboard Asset</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Total Fleet Inventory"
          value={`${billboards.length} Sites`}
          subValue={`${availableCount} Available • ${occupiedCount} Occupied`}
          icon={Building2}
          onClick={() => onNavigateTab('inventory')}
        />
        <KPICard
          label="Monthly Fleet Gross Value"
          value={`$${monthlyGross.toLocaleString()}`}
          subValue="Across prime transit corridors"
          icon={DollarSign}
          onClick={() => onNavigateTab('revenue')}
        />
        <KPICard
          label="Inventory Occupancy Yield"
          value={`${occupancyRate}%`}
          subValue="Fleet utilization efficiency"
          icon={TrendingUp}
          trend={{ value: 'Optimal Yield', isPositive: true }}
        />
        <KPICard
          label="Agency Booking Inquiries"
          value={`${bookings.length}`}
          subValue={`${bookings.filter((b: any) => b.status === 'Pending').length} Pending Approval`}
          icon={Inbox}
          onClick={() => onNavigateTab('bookings')}
        />
      </div>

      {/* Inbound Booking Requests & Approval Workflow */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#181716]">Agency Booking Requests & Concession Contracts</h3>
            <p className="text-xs text-zinc-500">
              Review advertiser offers, approve contracts, and lock escrow milestone settlements.
            </p>
          </div>
          <span className="text-xs text-zinc-400">{bookings.length} requests</span>
        </div>

        {bookings.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4">No active booking requests at this moment.</p>
        ) : (
          <div className="divide-y divide-[#eae7e1] border border-[#eae7e1] rounded-xl overflow-hidden">
            {bookings.map((bkg: any) => (
              <div
                key={bkg.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-extrabold text-sm text-[#181716]">{bkg.billboardName}</h4>
                    <StatusBadge status={bkg.status} />
                  </div>
                  <p className="text-xs text-zinc-600">
                    Advertiser: <strong>{bkg.brand}</strong> • Agency: <span className="font-medium text-zinc-500">{bkg.agencyName}</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Campaign: {bkg.campaignName} • Duration: {new Date(bkg.startDate).toLocaleDateString()} – {new Date(bkg.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-black text-[#181716] text-sm block">${bkg.totalAmountUSD.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">${bkg.rateMonthlyUSD.toLocaleString()} / mo</span>
                  </div>

                  {bkg.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBookingAction(bkg.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleBookingAction(bkg.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold text-xs cursor-pointer"
                      >
                        Approve & Confirm
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Confirmed ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Billboard Asset Modal */}
      <AddBillboardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCompany={currentUser?.organization}
        onSuccess={(newId) => {
          setToastMessage(`Billboard asset ${newId} published to live concession inventory!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
};
