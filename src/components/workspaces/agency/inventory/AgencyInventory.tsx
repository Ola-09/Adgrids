import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  RefreshCw,
  Lock,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useBillboards } from '../../../../context/BillboardContext';
import { useAuth } from '../../../../context/AuthContext';
import { MarketplaceBillboard, MetroCode } from '../../../../types';
import { ImportInventoryWizard } from './ImportInventoryWizard';
import { CompleteProfileModal } from './CompleteProfileModal';
import { AddBillboardModal } from '../../../modals/AddBillboardModal';
import { BulkImageUploadModal } from './BulkImageUploadModal';
import { downloadAdgridTemplate } from '../../../../utils/templateGenerator';

export const AgencyInventory: React.FC = () => {
  const { billboards, updateBillboard, deleteBillboard, exportBillboardsCSV } = useBillboards();
  const { currentUser } = useAuth();

  // Modals state
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
  const [selectedBillboardForCompletion, setSelectedBillboardForCompletion] =
    useState<MarketplaceBillboard | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [metroFilter, setMetroFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [completenessFilter, setCompletenessFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter items
  const filteredBillboards = billboards.filter((b) => {
    if (metroFilter !== 'ALL' && b.metro !== metroFilter) return false;
    if (formatFilter !== 'ALL' && !b.format.toLowerCase().includes(formatFilter.toLowerCase())) {
      return false;
    }
    const completeness = b.profileCompleteness ?? 85;
    if (completenessFilter === 'incomplete' && completeness >= 80) return false;
    if (completenessFilter === 'complete' && completeness < 80) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const idMatch = b.id.toLowerCase().includes(q);
      const nameMatch = b.name.toLowerCase().includes(q);
      const locMatch = b.location.toLowerCase().includes(q);
      const corridorMatch = b.corridor.toLowerCase().includes(q);
      return idMatch || nameMatch || locMatch || corridorMatch;
    }

    return true;
  });

  // Calculate fleet completeness stats
  const totalAssets = billboards.length;
  const avgCompleteness =
    totalAssets > 0
      ? Math.round(
          billboards.reduce((acc, b) => acc + (b.profileCompleteness ?? 85), 0) / totalAssets
        )
      : 100;
  const incompleteCount = billboards.filter(
    (b) => (b.profileCompleteness ?? 85) < 80
  ).length;

  const handleToggleAvailability = (id: string, currentStatus?: string) => {
    const next =
      currentStatus === 'Available Now' ? 'Occupied (Flight Active)' : 'Available Now';
    updateBillboard(id, { availabilityStatus: next });
    showToast(`Billboard ${id} status updated to: ${next}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} (${id}) from your inventory?`)) {
      deleteBillboard(id);
      showToast(`Billboard ${id} deleted.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with 3 Entry Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Agency Inventory Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {totalAssets} Billboard Assets
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            Maintain your concession fleet, ingest inventory from spreadsheets, complete missing telemetry progressively, and manage rate cards.
          </p>
        </div>

        {/* Section A: The 3 Entry Points */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Action 1: Upload Excel/CSV (Prominent) */}
          <button
            onClick={() => setIsImportWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Inventory (Excel / CSV)</span>
          </button>

          {/* Action 2: Download Adgrid Template */}
          <div className="relative group">
            <button
              onClick={() => downloadAdgridTemplate('xlsx')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Action 3: Manual Add Billboard */}
          <button
            onClick={() => setIsManualAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Add</span>
          </button>

          {/* Export Fleet CSV */}
          <button
            onClick={() => exportBillboardsCSV()}
            className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            title="Export Fleet to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onboarding Callout Banner (Guiding Principle) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-[#fff9f6] via-white to-[#faf9f6] border border-[#ef5a24]/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#ef5a24]">
              Zero-Friction Agency Onboarding
            </h2>
            <p className="text-sm font-black text-[#181716] mt-0.5">
              Bring your existing inventory into Adgrid instead of rebuilding it manually.
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Upload your Excel or CSV spreadsheet. Adgrid maps your columns automatically, preserves stable Billboard IDs, flags confirmed bookings safely, and allows you to complete GPS & photos progressively.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsImportWizardOpen(true)}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
        >
          Launch Spreadsheet Importer →
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#eae7e1] shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
            Total Inventory
          </span>
          <span className="text-2xl font-black text-[#181716] mt-1 block">
            {totalAssets}
          </span>
          <span className="text-[11px] text-zinc-500">Live Concession Boards</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eae7e1] shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
            Avg Profile Completeness
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-[#181716]">{avgCompleteness}%</span>
            <div className="w-14 h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${avgCompleteness}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">Fleet data readiness</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eae7e1] shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
            Incomplete Profiles
          </span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">
            {incompleteCount}
          </span>
          <span className="text-[11px] text-zinc-500">Missing GPS or Photos</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eae7e1] shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">
            DOOH Digital Share
          </span>
          <span className="text-2xl font-black text-purple-950 mt-1 block">
            {Math.round(
              (billboards.filter((b) => b.format.includes('Digital') || b.format.includes('LED'))
                .length /
                (totalAssets || 1)) *
                100
            )}
            %
          </span>
          <span className="text-[11px] text-zinc-500">Active LED screens</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Billboard ID, site name, arterial corridor, or address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Metro */}
            <select
              value={metroFilter}
              onChange={(e) => setMetroFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-bold text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Metros</option>
              <option value="LOS">Lagos (LOS)</option>
              <option value="ABJ">Abuja (ABJ)</option>
              <option value="PHC">Port Harcourt (PHC)</option>
              <option value="IBD">Ibadan (IBD)</option>
              <option value="KAN">Kano (KAN)</option>
              <option value="ACC">Accra (ACC)</option>
            </select>

            {/* Format */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-bold text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Formats</option>
              <option value="Digital">Digital Billboard (LED)</option>
              <option value="Unipole">Static Unipole</option>
              <option value="Megaboard">Megaboard / Gantry</option>
              <option value="Shelter">Bus Shelter</option>
              <option value="Wrap">Transit Wrap</option>
            </select>

            {/* Profile Completeness */}
            <select
              value={completenessFilter}
              onChange={(e) => setCompletenessFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-bold text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Profiles</option>
              <option value="incomplete">Needs Completion (&lt; 80%)</option>
              <option value="complete">Complete Profiles (80%+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                <th className="py-3 px-4">Billboard Asset</th>
                <th className="py-3 px-3">Metro & Corridor</th>
                <th className="py-3 px-3">Format & Size</th>
                <th className="py-3 px-3">Monthly Rate</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-3">Profile Completeness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae7e1]">
              {filteredBillboards.map((b) => {
                const completeness = b.profileCompleteness ?? 85;
                const isBooked =
                  b.availabilityStatus?.includes('Occupied') ||
                  b.availabilityStatus?.includes('Booked') ||
                  (b.brand && b.brand !== 'Open for Booking');

                return (
                  <tr key={b.id} className="hover:bg-[#faf9f6] transition-colors">
                    {/* Billboard Asset */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-[#eae7e1] bg-zinc-100 shrink-0">
                          {b.previewUrl ? (
                            <img
                              src={b.previewUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <Camera className="w-4 h-4" />
                            </div>
                          )}
                          {isBooked && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700">
                              {b.id}
                            </span>
                            {isBooked && (
                              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                Active Flight
                              </span>
                            )}
                          </div>
                          <p className="font-extrabold text-[#181716] truncate mt-0.5" title={b.name}>
                            {b.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {b.mediaOwnerCompany}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Metro & Corridor */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-zinc-800 block truncate">
                        {b.metroName || b.metro}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate" title={b.corridor}>
                        {b.corridor}
                      </span>
                    </td>

                    {/* Format & Dimensions */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-zinc-800 block truncate">{b.format}</span>
                      <span className="text-[10px] text-zinc-400 block">{b.dimensions}</span>
                    </td>

                    {/* Monthly Rate */}
                    <td className="py-3.5 px-3 font-mono">
                      <span className="font-extrabold text-[#181716] block">
                        ${b.priceMonthlyUSD?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        ${b.priceDailyUSD || Math.round(b.priceMonthlyUSD / 30)}/day
                      </span>
                    </td>

                    {/* Availability */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleAvailability(b.id, b.availabilityStatus)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight transition-colors cursor-pointer ${
                          b.availabilityStatus === 'Available Now'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        {b.availabilityStatus || 'Available Now'}
                      </button>
                    </td>

                    {/* Profile Completeness */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              completeness >= 80
                                ? 'bg-emerald-500'
                                : completeness >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                        <span className="font-black text-[11px] text-zinc-700">
                          {completeness}%
                        </span>
                      </div>

                      {completeness < 80 ? (
                        <button
                          onClick={() => setSelectedBillboardForCompletion(b)}
                          className="mt-1 text-[10px] font-extrabold text-[#ef5a24] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Complete Profile</span>
                        </button>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                          Verified Profile ✓
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBillboardForCompletion(b)}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Edit & Complete Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from fleet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Spreadsheet Import Wizard Modal */}
      <ImportInventoryWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onOpenManualAdd={() => setIsManualAddOpen(true)}
        defaultCompany={currentUser?.organization || 'AfriReach Pan-African Media Group'}
        onImportComplete={() => {
          showToast('Inventory successfully updated from spreadsheet.');
        }}
      />

      {/* Manual Add Billboard Modal */}
      <AddBillboardModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        defaultCompany={currentUser?.organization || 'AfriReach Pan-African Media Group'}
        onSuccess={(id) => {
          showToast(`Billboard ${id} successfully added.`);
          setIsManualAddOpen(false);
        }}
      />

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={!!selectedBillboardForCompletion}
        onClose={() => setSelectedBillboardForCompletion(null)}
        billboard={selectedBillboardForCompletion}
        onSave={(id, updates) => {
          updateBillboard(id, updates);
          showToast(`Billboard ${id} profile successfully updated.`);
        }}
      />

      {/* Bulk Image Matcher Modal */}
      <BulkImageUploadModal
        isOpen={isBulkImageModalOpen}
        onClose={() => setIsBulkImageModalOpen(false)}
        billboardCandidates={billboards.map((b) => ({ id: b.id, name: b.name }))}
        onApplyImages={(matches) => {
          Object.entries(matches).forEach(([id, previewUrl]) => {
            updateBillboard(id, { previewUrl });
          });
          showToast(`Updated ${Object.keys(matches).length} billboard photos.`);
        }}
      />
    </div>
  );
};
