import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  Car,
  Layers,
  Sparkles,
  Save,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../../../types';
import { calculateProfileCompleteness } from '../../../../utils/inventoryValidator';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  billboard: MarketplaceBillboard | null;
  onSave: (id: string, updates: Partial<MarketplaceBillboard>) => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  billboard,
  onSave,
}) => {
  if (!isOpen || !billboard) return null;

  const [lat, setLat] = useState(billboard.lat ? String(billboard.lat) : '');
  const [lng, setLng] = useState(billboard.lng ? String(billboard.lng) : '');
  const [previewUrl, setPreviewUrl] = useState(billboard.previewUrl || '');
  const [dimensions, setDimensions] = useState(billboard.dimensions || '24m x 8m (192 sq.m)');
  const [resolution, setResolution] = useState(billboard.resolution || '1920 x 1080 Full HD');
  const [lightingType, setLightingType] = useState(billboard.lightingType || 'Active LED Display');
  const [dailyTrafficVehicles, setDailyTrafficVehicles] = useState(
    billboard.dailyTrafficVehicles ? String(billboard.dailyTrafficVehicles) : '250000'
  );
  const [dailyReach, setDailyReach] = useState(billboard.dailyReach || '375,000 Impressions');
  const [description, setDescription] = useState(billboard.description || '');

  // Calculate live completeness
  const currentPreviewData: Partial<MarketplaceBillboard> = {
    ...billboard,
    lat: lat ? parseFloat(lat) : undefined,
    lng: lng ? parseFloat(lng) : undefined,
    previewUrl,
    dimensions,
    dailyTrafficVehicles: dailyTrafficVehicles ? parseInt(dailyTrafficVehicles, 10) : undefined,
    dailyReach,
  };

  const { score: liveScore, missing: liveMissing } =
    calculateProfileCompleteness(currentPreviewData);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<MarketplaceBillboard> = {
      lat: lat ? parseFloat(lat) : billboard.lat,
      lng: lng ? parseFloat(lng) : billboard.lng,
      previewUrl: previewUrl.trim() || billboard.previewUrl,
      dimensions: dimensions.trim() || billboard.dimensions,
      resolution: resolution.trim() || billboard.resolution,
      lightingType: lightingType.trim() || billboard.lightingType,
      dailyTrafficVehicles: dailyTrafficVehicles
        ? parseInt(dailyTrafficVehicles, 10)
        : billboard.dailyTrafficVehicles,
      dailyReach: dailyReach.trim() || billboard.dailyReach,
      description: description.trim() || billboard.description,
      profileCompleteness: liveScore,
      missingFields: liveMissing,
    };

    onSave(billboard.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#eae7e1] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eae7e1] flex items-center justify-between bg-[#faf9f6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ef5a24] text-[10px] font-black uppercase tracking-wider">
                Progressive Profile Completion
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {billboard.id}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#181716] tracking-tight mt-1">
              {billboard.name}
            </h2>
            <p className="text-xs text-zinc-500">{billboard.location} • {billboard.corridor}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Completeness Bar */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#181716]">Profile Completeness</span>
              <span
                className={`font-black ${
                  liveScore >= 80
                    ? 'text-emerald-600'
                    : liveScore >= 50
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {liveScore}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  liveScore >= 80
                    ? 'bg-emerald-500'
                    : liveScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${liveScore}%` }}
              />
            </div>
            {liveMissing.length > 0 ? (
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Missing: {liveMissing.join(', ')}</span>
              </p>
            ) : (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% complete! Ready for premium advertiser bookings.</span>
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#181716] uppercase tracking-wider">
              Asset Attributes & Telemetry
            </h3>

            {/* GPS Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ef5a24]" />
                  <span>Latitude</span>
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 6.4378"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ef5a24]" />
                  <span>Longitude</span>
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. 3.4492"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                <Camera className="w-3 h-3 text-[#ef5a24]" />
                <span>Asset Photo / Preview URL</span>
              </label>
              <input
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              />
              {previewUrl && (
                <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Traffic & Reach */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Car className="w-3 h-3 text-[#ef5a24]" />
                  <span>Daily Vehicular Traffic</span>
                </label>
                <input
                  type="number"
                  value={dailyTrafficVehicles}
                  onChange={(e) => setDailyTrafficVehicles(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Daily Audience Reach / Impressions
                </label>
                <input
                  type="text"
                  value={dailyReach}
                  onChange={(e) => setDailyReach(e.target.value)}
                  placeholder="e.g. 400,000 Impressions"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
            </div>

            {/* Dimensions & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#ef5a24]" />
                  <span>Dimensions</span>
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 24m x 8m"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Resolution / Illumination
                </label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. 1920 x 1080 Full HD"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Commercial Description & Visibility Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="High impact display with unobstructed sightlines..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#eae7e1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
