import React, { useState } from 'react';
import { Download, Edit3, Eye, FileSpreadsheet, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useBillboards } from '../../../context/BillboardContext';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge } from '../../shared/StatusBadge';
import { AddBillboardModal } from '../../modals/AddBillboardModal';
import { ImportInventoryWizard } from '../agency/inventory/ImportInventoryWizard';

export const MediaOwnerInventory: React.FC = () => {
  const { billboards, updateBillboard, deleteBillboard, exportBillboardsCSV } = useBillboards();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = billboards.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.corridor.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleAvailability = (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'Available Now' ? 'Occupied (Flight Active)' : 'Available Now';
    updateBillboard(id, { availabilityStatus: nextStatus });
    setToastMessage(`Asset ${id} availability updated to ${nextStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} (${id}) from your concession inventory?`)) {
      deleteBillboard(id);
      setToastMessage(`Asset ${id} removed from listing.`);
      setTimeout(() => setToastMessage(null), 3000);
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Concession Inventory Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {billboards.length} Billboard Assets
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your fleet of physical and digital assets, update monthly card rates, and toggle live marketplace booking status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Excel/CSV</span>
          </button>
          <button
            onClick={() => exportBillboardsCSV()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
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
            placeholder="Search by billboard name, transit corridor, or metro..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          />
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
                <th className="py-3 px-3">Card Rate</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae7e1]">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[#faf9f6] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {b.previewUrl && (
                        <img
                          src={b.previewUrl}
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover border border-[#eae7e1] shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-extrabold text-[#181716]">{b.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-600">
                    <div>{b.metroName || b.metro}</div>
                    <div className="text-[10px] text-zinc-400">{b.corridor}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-zinc-800">{b.format}</div>
                    <div className="text-[10px] text-zinc-400">{b.dimensions}</div>
                  </td>
                  <td className="py-3.5 px-3 font-black text-[#181716]">
                    ${b.priceMonthlyUSD?.toLocaleString() || 0} / mo
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => handleToggleAvailability(b.id, b.availabilityStatus)}
                      className="cursor-pointer"
                      title="Click to toggle availability"
                    >
                      <StatusBadge
                        status={b.availabilityStatus === 'Available Now' ? 'Live' : 'Paused'}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleAvailability(b.id, b.availabilityStatus)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#181716] font-bold text-[11px] cursor-pointer"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddBillboardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCompany={currentUser?.organization}
        onSuccess={(id) => {
          setToastMessage(`Asset ${id} added to inventory!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Spreadsheet Import Wizard Modal */}
      <ImportInventoryWizard
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onOpenManualAdd={() => setIsAddModalOpen(true)}
        defaultCompany={currentUser?.organization}
        onImportComplete={() => {
          setToastMessage('Inventory updated from spreadsheet!');
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />
    </div>
  );
};
