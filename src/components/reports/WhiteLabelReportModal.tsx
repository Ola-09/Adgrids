import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Printer,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Activity,
} from 'lucide-react';
import { useEntitlements } from '../../context/EntitlementContext';
import { useAuth } from '../../context/AuthContext';

interface WhiteLabelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignData?: {
    id: string;
    name: string;
    clientName: string;
    budgetUSD: number;
    spendUSD: number;
    deliveryRate: number;
    verificationRate: number;
    startDate: string;
    endDate: string;
    locations?: any[];
  };
}

export const WhiteLabelReportModal: React.FC<WhiteLabelReportModalProps> = ({
  isOpen,
  onClose,
  campaignData,
}) => {
  const { hasEntitlement, openUpgradeModal, subscriptionState, saveWhiteLabelConfig } =
    useEntitlements();
  const { currentUser } = useAuth();

  const canWhiteLabel = hasEntitlement('can_use_white_label_reports');

  // Configurable fields
  const [agencyLogoUrl, setAgencyLogoUrl] = useState(
    subscriptionState.whiteLabelConfig?.agencyLogoUrl ||
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80'
  );
  const [clientLogoUrl, setClientLogoUrl] = useState(
    subscriptionState.whiteLabelConfig?.clientLogoUrl || ''
  );
  const [reportTitle, setReportTitle] = useState(
    'Executive Proof-of-Display & Campaign Recapitulation'
  );
  const [campaignName, setCampaignName] = useState(
    campaignData?.name || 'Safaricom 5G Pan-African Corridor Flight'
  );
  const [primaryBrandColor, setPrimaryBrandColor] = useState(
    subscriptionState.whiteLabelConfig?.primaryBrandColor || '#181716'
  );
  const [customReportFooter, setCustomReportFooter] = useState(
    subscriptionState.whiteLabelConfig?.customReportFooter ||
      'Confidential & Proprietary Deliverable • Prepared Exclusively for Client Review'
  );
  const [dateRange, setDateRange] = useState('October 1, 2026 – October 31, 2026');
  const [hideAdgridWatermark, setHideAdgridWatermark] = useState(
    subscriptionState.whiteLabelConfig?.hideAdgridWatermark ?? true
  );

  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  if (!canWhiteLabel) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 border border-[#eae7e1] shadow-2xl space-y-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ef5a24]">
              Enterprise Feature
            </span>
            <h2 className="text-xl font-black text-[#181716] tracking-tight mt-0.5">
              White-Label Client Reporting Studio
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Generate fully customized client deliverables with your agency's logo, brand colors, and zero Adgrid watermarks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fffaf8] border border-[#ef5a24]/20 space-y-2 text-xs">
            <p className="font-bold text-[#181716]">
              White-label reporting is an Enterprise tier capability.
            </p>
            <p className="text-zinc-600">
              Deliver institutional board-ready PDFs to global advertisers with bespoke agency branding, custom legal footers, and scrubbed administrative infrastructure metadata.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                openUpgradeModal('can_use_white_label_reports');
              }}
              className="px-5 py-2 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Enterprise</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveDefaults = async () => {
    setSavingConfig(true);
    try {
      await saveWhiteLabelConfig({
        agencyLogoUrl,
        clientLogoUrl,
        primaryBrandColor,
        customReportFooter,
        hideAdgridWatermark,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-zinc-100 rounded-3xl border border-[#eae7e1] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-[#eae7e1] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181716] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#181716] tracking-tight">
                  White-Label Deliverable Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Enterprise Tier Active
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Configure branding parameters and preview the unbranded client deliverable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDefaults}
              disabled={savingConfig}
              className="px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Brand Defaults</span>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace: Configuration Sidebar + Live Document Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 p-5 bg-white border-r border-[#eae7e1] overflow-y-auto space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              White-Label Branding Controls
            </h3>

            {/* Agency Logo */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Agency Logo URL
              </label>
              <input
                type="text"
                value={agencyLogoUrl}
                onChange={(e) => setAgencyLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Client Logo */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Client Brand Logo URL (Optional)
              </label>
              <input
                type="text"
                value={clientLogoUrl}
                onChange={(e) => setClientLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Report Title */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Campaign Name */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Brand Color Theme */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryBrandColor}
                  onChange={(e) => setPrimaryBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={primaryBrandColor}
                  onChange={(e) => setPrimaryBrandColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-mono"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Flight Date Range
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Footer Text */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Custom Legal / Agency Footer
              </label>
              <textarea
                rows={2}
                value={customReportFooter}
                onChange={(e) => setCustomReportFooter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181716]"
              />
            </div>

            {/* Watermark toggle */}
            <div className="pt-2 border-t border-[#eae7e1]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
                <input
                  type="checkbox"
                  checked={hideAdgridWatermark}
                  onChange={(e) => setHideAdgridWatermark(e.target.checked)}
                  className="rounded text-[#181716] focus:ring-0"
                />
                <span>Remove Adgrid Watermark completely</span>
              </label>
              <p className="text-[11px] text-zinc-400 mt-0.5 ml-5">
                Excludes all Adgrid platform identifiers, server endpoints, and internal logs.
              </p>
            </div>
          </div>

          {/* Live Document Canvas (8 Cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto flex justify-center bg-zinc-200/70">
            <div
              id="white-label-report-document"
              className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-zinc-200 p-8 sm:p-10 space-y-6 text-zinc-900"
            >
              {/* Document Header */}
              <div
                className="pb-6 border-b-2 flex items-start justify-between gap-6"
                style={{ borderColor: primaryBrandColor }}
              >
                <div>
                  <h1
                    className="text-xl sm:text-2xl font-black tracking-tight"
                    style={{ color: primaryBrandColor }}
                  >
                    {reportTitle}
                  </h1>
                  <div className="text-sm font-bold text-zinc-700 mt-1">
                    Campaign: {campaignName}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Flight Period: {dateRange} • Client: {campaignData?.clientName || 'Safaricom PLC'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {clientLogoUrl && (
                    <img
                      src={clientLogoUrl}
                      alt="Client Brand"
                      className="h-10 object-contain max-w-[120px]"
                    />
                  )}
                  {agencyLogoUrl && (
                    <img
                      src={agencyLogoUrl}
                      alt="Agency Logo"
                      className="h-10 object-contain max-w-[140px] rounded"
                    />
                  )}
                </div>
              </div>

              {/* Section 7 Grounded KPI Metrics Grid (All estimates clearly labeled!) */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                  Flight Performance & Verification Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                      Contracted Budget
                    </span>
                    <span className="text-lg font-black text-zinc-900">
                      ${(campaignData?.budgetUSD || 45000).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">USD Escrow Settled</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                      Physical Verification
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {campaignData?.verificationRate || 100}%
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">GPS PoP Audited</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                      Est. Total Reach
                    </span>
                    <span className="text-lg font-black text-zinc-900">
                      1.84M <span className="text-[10px] text-amber-700 font-extrabold">[Estimated]</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Corridor Traffic Model</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                      Flight Delivery Pacing
                    </span>
                    <span className="text-lg font-black text-blue-700">
                      {campaignData?.deliveryRate || 100}%
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Flight Schedule On-Track</span>
                  </div>
                </div>
              </div>

              {/* Billboard Asset Audit Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                  Verified Concession Asset Roster
                </h3>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Site ID & Name</th>
                        <th className="py-2.5 px-3">Transit Corridor</th>
                        <th className="py-2.5 px-3">Format</th>
                        <th className="py-2.5 px-3">Est. Daily Traffic</th>
                        <th className="py-2.5 px-3">PoP Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-zinc-900">
                          LOS-DOOH-101 • Lekki Toll Plaza Digital
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600">Lekki–Epe Expressway Corridor</td>
                        <td className="py-2.5 px-3 text-zinc-700">Digital LED (12m x 4m)</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">
                          115,000 <span className="text-[9px] text-amber-700 font-bold">[Estimated]</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-zinc-900">
                          ABJ-UNI-204 • Shehu Shagari Gantry
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600">Central Business District Outer</td>
                        <td className="py-2.5 px-3 text-zinc-700">Static Unipole (18m x 6m)</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">
                          78,000 <span className="text-[9px] text-amber-700 font-bold">[Estimated]</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-zinc-900">
                          NBO-DOOH-082 • Uhuru Highway Monolith
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600">Westlands Commercial Flyover</td>
                        <td className="py-2.5 px-3 text-zinc-700">Iconic 3D LED (15m x 5m)</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">
                          142,000 <span className="text-[9px] text-amber-700 font-bold">[Estimated]</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">Verified</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Footer */}
              <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-2">
                <div>{customReportFooter}</div>
                <div>Generated on {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
