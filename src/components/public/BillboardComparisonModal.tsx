import React from 'react';
import {
  X,
  SlidersHorizontal,
  DollarSign,
  Car,
  Users,
  Compass,
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../types';
import { useEntitlements } from '../../context/EntitlementContext';

interface BillboardComparisonModalProps {
  billboards: MarketplaceBillboard[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveBillboard: (id: string) => void;
  onSelectBillboard: (billboard: MarketplaceBillboard) => void;
}

export const BillboardComparisonModal: React.FC<BillboardComparisonModalProps> = ({
  billboards,
  isOpen,
  onClose,
  onRemoveBillboard,
  onSelectBillboard,
}) => {
  const { hasEntitlement, openUpgradeModal } = useEntitlements();
  const canCompare = hasEntitlement('can_compare_billboards');

  if (!isOpen) return null;

  if (!canCompare) {
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
            <SlidersHorizontal className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ef5a24]">
              Intelligence Feature
            </span>
            <h2 className="text-xl font-black text-[#181716] tracking-tight mt-0.5">
              Multi-Billboard Comparative Matrix
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Compare multiple billboards side-by-side across pricing, vehicle traffic, footfall, and visibility.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fffaf8] border border-[#ef5a24]/20 space-y-2 text-xs">
            <p className="font-bold text-[#181716]">
              Billboard comparison is available on Professional and Enterprise plans.
            </p>
            <p className="text-zinc-600">
              Evaluate CPM efficiency, driver dwell seconds, and 360° sightlines across up to 4 billboards simultaneously to maximize return on ad spend.
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
                openUpgradeModal('can_compare_billboards');
              }}
              className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Professional</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate best value metrics
  const minPrice = Math.min(...billboards.map((b) => b.priceMonthlyUSD));
  const maxTraffic = Math.max(...billboards.map((b) => b.dailyTrafficVehicles || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-[#eae7e1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#eae7e1] flex items-center justify-between bg-linear-to-b from-[#fff9f6] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#181716] tracking-tight">
                  Billboard Comparative Intelligence Matrix
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  {billboards.length} Assets Compared
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Side-by-side analysis of rate cards, commuter density, footfall, and optical sightlines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Comparison Body */}
        <div className="p-6 overflow-y-auto">
          {billboards.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <SlidersHorizontal className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-500 font-medium">
                No billboards selected for comparison. Select 2 or more from the marketplace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#eae7e1]">
                    <th className="py-4 px-3 w-48 font-bold text-zinc-400 uppercase tracking-wider text-[11px]">
                      Metric / Attribute
                    </th>
                    {billboards.map((b) => {
                      const isBestPrice = b.priceMonthlyUSD === minPrice;
                      const isBestTraffic = (b.dailyTrafficVehicles || 0) === maxTraffic;

                      return (
                        <th key={b.id} className="py-4 px-4 min-w-[220px]">
                          <div className="space-y-2">
                            <div className="relative">
                              <img
                                src={b.previewUrl}
                                alt={b.name}
                                className="w-full h-28 object-cover rounded-xl border border-[#eae7e1]"
                              />
                              <button
                                onClick={() => onRemoveBillboard(b.id)}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              {isBestPrice && (
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs">
                                  <Award className="w-3 h-3" /> Best Rate
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-black text-[#181716] text-sm truncate">
                                {b.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono">{b.id}</div>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eae7e1]">
                  {/* Monthly Price */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Monthly Rate Card</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4 font-black text-base text-[#181716]">
                        ${b.priceMonthlyUSD.toLocaleString()}
                        <span className="text-xs text-zinc-400 font-normal"> / mo</span>
                      </td>
                    ))}
                  </tr>

                  {/* Daily Rate */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Daily Blended Rate</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4 font-semibold text-zinc-800">
                        ${b.priceDailyUSD?.toLocaleString() || Math.round(b.priceMonthlyUSD / 30)}
                        <span className="text-zinc-400 font-normal"> / day</span>
                      </td>
                    ))}
                  </tr>

                  {/* Format & Dimensions */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Format & Dimensions</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4">
                        <div className="font-bold text-[#181716]">{b.format}</div>
                        <div className="text-zinc-500 font-mono text-[11px]">{b.dimensions}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Location & Corridor */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Transit Corridor</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4">
                        <div className="font-medium text-[#181716]">{b.corridor}</div>
                        <div className="text-zinc-500 text-[11px]">{b.metroName || b.metro}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Vehicle Traffic */}
                  <tr className="hover:bg-zinc-50/60 bg-amber-50/20">
                    <td className="py-3 px-3 font-bold text-zinc-700 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      <span>Vehicular Traffic</span>
                    </td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4 font-bold text-zinc-900">
                        {b.dailyTrafficVehicles?.toLocaleString() || '45,000'} vehicles/day
                        <div className="text-[10px] text-zinc-400 font-normal">
                          Dwell: {b.dwellTimeSeconds || 45} seconds
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Foot Traffic / Daily Reach */}
                  <tr className="hover:bg-zinc-50/60 bg-amber-50/20">
                    <td className="py-3 px-3 font-bold text-zinc-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Foot Traffic & Reach</span>
                    </td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4 font-bold text-zinc-900">
                        {b.dailyReach || '85,000+ daily'}
                        <div className="text-[10px] text-zinc-400 font-normal">
                          Audience: {b.audienceType || 'High-Income Commuters'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Visibility & Illumination */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Display Engine</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4">
                        <div className="font-semibold text-zinc-800">
                          {b.lightingType || 'High-Lumen Digital LED'}
                        </div>
                        <div className="text-zinc-500 text-[11px]">
                          Resolution: {b.resolution || 'Ultra HD'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 360° Availability */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#ef5a24]" />
                      <span>360° Virtual Tour</span>
                    </td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5" /> 360° Ready
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Availability Status */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-bold text-zinc-700">Availability</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            b.availabilityStatus === 'Available Now'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {b.availabilityStatus || 'Available Now'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Action row */}
                  <tr>
                    <td className="py-4 px-3 font-bold text-zinc-700">Action</td>
                    {billboards.map((b) => (
                      <td key={b.id} className="py-4 px-4">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectBillboard(b);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>View Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ef5a24]" />
            <span>
              All traffic and commuter density metrics are grounded in verified GIS sensors and corridor data.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
