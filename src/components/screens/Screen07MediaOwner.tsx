import React, { useState, useMemo } from 'react';
import {
  Building2,
  DollarSign,
  Inbox,
  Activity,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Download,
  Search,
  Filter,
  MapPin,
  Car,
  Eye,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MEDIA_OWNER_RFQS } from '../../data/mockData';
import { ScreenId, MarketplaceBillboard } from '../../types';
import { useBillboards } from '../../context/BillboardContext';
import { useAuth } from '../../context/AuthContext';
import { AddBillboardModal } from '../modals/AddBillboardModal';

interface Screen07Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen07MediaOwner: React.FC<Screen07Props> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    billboards,
    exportBillboardsCSV,
    deleteBillboard,
    updateBillboard,
  } = useBillboards();

  const [rfqs, setRfqs] = useState(MEDIA_OWNER_RFQS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetro, setSelectedMetro] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [showOnlyMyCompany, setShowOnlyMyCompany] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentCompanyName =
    currentUser?.organization || 'Continental Outdoor Nigeria Ltd';

  // Filter billboards for table
  const filteredBillboards = useMemo(() => {
    return billboards.filter((b) => {
      if (showOnlyMyCompany) {
        const norm = currentCompanyName.toLowerCase();
        const matchCompany =
          b.mediaOwnerCompany.toLowerCase().includes(norm) ||
          b.companyContact?.companyName.toLowerCase().includes(norm);
        if (!matchCompany) return false;
      }

      if (selectedMetro !== 'ALL' && b.metro !== selectedMetro) {
        return false;
      }

      if (selectedFormat !== 'ALL') {
        if (!b.format.toLowerCase().includes(selectedFormat.toLowerCase())) {
          return false;
        }
      }

      if (selectedAvailability !== 'ALL') {
        if (b.availabilityStatus !== selectedAvailability && b.status !== selectedAvailability) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.corridor.toLowerCase().includes(q) ||
          b.mediaOwnerCompany.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    billboards,
    showOnlyMyCompany,
    currentCompanyName,
    selectedMetro,
    selectedFormat,
    selectedAvailability,
    searchQuery,
  ]);

  // Inventory metrics
  const totalSitesCount = billboards.length;
  const doohCount = billboards.filter(
    (b) => b.format.includes('Digital') || b.format.includes('LED') || b.format.includes('DOOH')
  ).length;
  const staticCount = totalSitesCount - doohCount;
  const totalGrossMonthly = billboards.reduce((sum, b) => sum + (b.priceMonthlyUSD || 0), 0);
  const availableCount = billboards.filter(
    (b) => b.availabilityStatus === 'Available Now'
  ).length;
  const occupancyRate = totalSitesCount > 0
    ? (((totalSitesCount - availableCount) / totalSitesCount) * 100).toFixed(1)
    : '94.2';

  const handleAccept = (id: string, brand: string) => {
    setRfqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Accepted' as const } : r))
    );
    showToast(`RFQ Accepted! Escrow agreement for ${brand} generated and awaiting agency fund lock.`);
  };

  const handleDecline = (id: string) => {
    setRfqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Declined' as const } : r))
    );
    showToast('RFQ declined.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = (b: MarketplaceBillboard) => {
    const isNowAvailable = b.availabilityStatus === 'Available Now';
    const nextStatus = isNowAvailable ? 'Booked (Waitlist)' : 'Available Now';
    const nextOperational = isNowAvailable ? 'Active DOOH' : 'Live & Verified';
    updateBillboard(b.id, {
      availabilityStatus: nextStatus,
      status: nextOperational,
    });
    showToast(`Updated "${b.name}" status to ${nextStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove billboard "${name}" from your active inventory?`)) {
      deleteBillboard(id);
      showToast(`Billboard "${name}" removed from inventory.`);
    }
  };

  const handleExportCSV = () => {
    const companyFilter = showOnlyMyCompany ? currentCompanyName : undefined;
    exportBillboardsCSV(companyFilter, selectedMetro !== 'ALL' ? selectedMetro : undefined);
    showToast(`Exported ${filteredBillboards.length} billboard records to CSV!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#181716] tracking-tight">
              Media Owner & Concessionaire Console
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181716] text-white text-xs font-black">
              {currentCompanyName}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Manage your billboard fleet, export asset catalogs (CSV), add new inventory sites, and service inbound advertiser RFQs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Export Action Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-black text-emerald-900 shadow-2xs transition-colors cursor-pointer"
            title="Download full inventory records in CSV format"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Billboard List (CSV)</span>
            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-md text-[10px]">
              {filteredBillboards.length}
            </span>
          </button>

          {/* Add New Billboard Action Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ef5a24] hover:bg-[#d94e1d] rounded-xl text-xs font-black text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Billboard Asset</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Network Inventory */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Network Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#181716]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#181716] tracking-tight tnum block">
              {totalSitesCount} Sites
            </span>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
              <span>
                {doohCount} DOOH • {staticCount} Static
              </span>
              <span className="text-emerald-700 font-bold">{occupancyRate}% Occupancy</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Gross Inventory Value */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Monthly Inventory Value</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#181716]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#181716] tracking-tight tnum block">
              ${totalGrossMonthly.toLocaleString()}
            </span>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-600">Across {billboards.length} Prime Corridors</span>
              <span className="text-emerald-700 font-bold">100% Escrow Protected</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Inbound Agency RFQs */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Inbound Agency RFQs</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#181716]">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#181716] tracking-tight tnum block">
              {rfqs.filter((r) => r.status === 'Pending').length} Pending
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              Total Inbound Value: <strong className="text-[#181716]">$380,000</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Hardware Health */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Hardware Screen Health</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tnum block">
              99.4%
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              2 Scheduled Maintenance • 0 Blackouts
            </div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE SECTION: CURRENT BILLBOARD LIST & CSV EXPORT */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#eae7e1] shadow-xl space-y-5">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#eae7e1]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#181716] tracking-tight">
                Current Billboard Inventory Fleet
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#181716] text-white text-xs font-bold">
                {filteredBillboards.length} Active Sites
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Search, filter, update statuses, or download the full registry as a formatted CSV spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV File</span>
            </button>

            {/* Add Billboard Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#ef5a24] hover:bg-[#d94e1d] text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add Billboard</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Query */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search billboard name, ID, corridor, address..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            />
          </div>

          {/* Metro Filter */}
          <div>
            <select
              value={selectedMetro}
              onChange={(e) => setSelectedMetro(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            >
              <option value="ALL">All Metros (Nigeria)</option>
              <option value="LOS">Lagos, Nigeria</option>
              <option value="ABJ">Abuja (FCT), Nigeria</option>
              <option value="PHC">Port Harcourt, Nigeria</option>
              <option value="IBD">Ibadan, Nigeria</option>
              <option value="KAN">Kano, Nigeria</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            >
              <option value="ALL">All Formats</option>
              <option value="Digital LED">Digital LED</option>
              <option value="3D LED">3D Curved LED</option>
              <option value="Static Unipole">Static Unipole</option>
              <option value="Gantry">Gantry Monolith</option>
              <option value="Wallscape">Mega Wallscape</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            >
              <option value="ALL">All Availability</option>
              <option value="Available Now">Available Now</option>
              <option value="Booked (Waitlist)">Booked</option>
              <option value="Live & Verified">Live & Verified</option>
            </select>
          </div>
        </div>

        {/* Billboard Fleet Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#eae7e1]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f3f0] text-[#181716] font-black border-b border-[#eae7e1]">
                <th className="py-3 px-4">Billboard Asset & ID</th>
                <th className="py-3 px-3">Metro & Corridor</th>
                <th className="py-3 px-3">Format & Specs</th>
                <th className="py-3 px-3">Monthly / Daily Rate</th>
                <th className="py-3 px-3">Daily Reach & Traffic</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-3">Health</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae7e1] bg-white">
              {filteredBillboards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <Layers className="w-8 h-8 text-zinc-300 mx-auto" />
                      <p className="font-bold text-sm text-[#181716]">No billboards match your filters</p>
                      <p className="text-xs text-zinc-500">
                        Try clearing search terms or click "Add Billboard Asset" to list a new site.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedMetro('ALL');
                          setSelectedFormat('ALL');
                          setSelectedAvailability('ALL');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBillboards.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[#faf9f6] transition-colors group"
                  >
                    {/* Billboard Asset & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.previewUrl}
                          alt={b.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#eae7e1] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm text-[#181716] block truncate max-w-[240px]">
                            {b.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                              {b.id}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                              {b.mediaOwnerCompany}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Metro & Corridor */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#181716]">{b.metroName}</div>
                      <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                        {b.corridor}
                      </div>
                    </td>

                    {/* Format & Specs */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#181716]/5 text-[#181716] font-bold text-[11px]">
                        {b.format}
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{b.dimensions}</div>
                    </td>

                    {/* Rates */}
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-sm text-[#181716]">
                        ${b.priceMonthlyUSD?.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        ${b.priceDailyUSD}/day
                      </div>
                    </td>

                    {/* Traffic & Reach */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-800">
                        {b.dailyTrafficVehicles?.toLocaleString()} veh/day
                      </div>
                      <div className="text-[10px] text-zinc-500">{b.dailyReach}</div>
                    </td>

                    {/* Availability */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(b)}
                        title="Click to toggle availability status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          b.availabilityStatus === 'Available Now'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.availabilityStatus === 'Available Now'
                              ? 'bg-emerald-600'
                              : 'bg-amber-600'
                          }`}
                        />
                        <span>{b.availabilityStatus}</span>
                      </button>
                    </td>

                    {/* Health */}
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-bold text-emerald-700">
                        {b.screenHealth || '100% Online'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(b)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                          title="Toggle availability"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Remove billboard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION (RFQs + Yield Diagnostics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inbound RFQs (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Advertiser Booking Inquiries
              </span>
              <h3 className="font-extrabold text-base text-[#181716]">
                Direct Agency Booking Requests & Programmatic RFQs
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#181716] text-white text-xs font-black">
              {rfqs.filter((r) => r.status === 'Pending').length} Active
            </span>
          </div>

          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#181716]">{rfq.brand}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 font-bold text-zinc-700">
                        {rfq.agency}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 font-semibold">{rfq.campaignName}</p>
                    <p className="text-[11px] text-zinc-500">
                      Target: {rfq.siteRequested} • {rfq.dates}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-[#181716] block tnum">
                      {rfq.offerAmount}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{rfq.shareOfVoice}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eae7e1] flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Format: <strong>15s loop / 60s cycle</strong>
                  </span>

                  {rfq.status === 'Accepted' ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                      Accepted ✓
                    </span>
                  ) : rfq.status === 'Declined' ? (
                    <span className="px-3 py-1 rounded-xl bg-red-100 text-red-800 font-bold">
                      Declined ✕
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecline(rfq.id)}
                        className="px-3 py-1 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(rfq.id, rfq.brand)}
                        className="px-3 py-1 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white font-bold transition-colors cursor-pointer"
                      >
                        Accept & Lock Escrow
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Corridor Yield & IoT Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Corridor Yield Management */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Commercial Fleet Yield
                </span>
                <h3 className="font-extrabold text-base text-[#181716]">
                  Corridor Yield Optimization
                </h3>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#181716]">Lagos Lekki Corridor (42 Sites)</span>
                  <span className="font-bold text-[#181716]">98% Booked ($420K)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#181716]">Abuja Shehu Shagari Way (24 Sites)</span>
                  <span className="font-bold text-[#181716]">96% Booked ($290K)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#181716] rounded-full" style={{ width: '96%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#181716]">Port Harcourt Aba Road (18 Sites)</span>
                  <span className="font-bold text-[#181716]">92% Booked ($185K)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#181716] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* IoT Screen Health & Remote Diagnostics */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Hardware Telemetry
                </span>
                <h3 className="font-extrabold text-base text-[#181716]">
                  IoT Remote Diagnostics
                </h3>
              </div>
              <Cpu className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#181716]">LOS-VI-088 (Victoria Island)</h5>
                  <p className="text-[10px] text-zinc-500">Temp: 28°C • Inverter: Online • 100% Brightness</p>
                </div>
                <span className="text-emerald-700 font-bold">Optimal</span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#181716]">ABJ-MT-012 (Maitama 3D DOOH)</h5>
                  <p className="text-[10px] text-zinc-500">Temp: 25°C • Calibrated 3D Depth • 0 Pixel Loss</p>
                </div>
                <span className="text-emerald-700 font-bold">Optimal</span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#181716]">PHC-GR-004 (GRA Junction)</h5>
                  <p className="text-[10px] text-zinc-500">Solar Backlit Array • Battery Health: 99%</p>
                </div>
                <span className="text-emerald-700 font-bold">Nominal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Billboard Modal */}
      <AddBillboardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCompany={currentCompanyName}
        onSuccess={(newId) => {
          showToast(`Billboard asset ${newId} published to live concession inventory!`);
        }}
      />
    </div>
  );
};
