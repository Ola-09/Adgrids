import React, { useState } from 'react';
import {
  X,
  Plus,
  Layers,
  MapPin,
  DollarSign,
  Eye,
  Car,
  Image as ImageIcon,
  CheckCircle2,
  Building2,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useBillboards } from '../../context/BillboardContext';
import { MetroCode } from '../../types';

interface AddBillboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompany?: string;
  onSuccess?: (billboardId: string) => void;
}

const PHOTO_PRESETS = [
  {
    name: 'Digital LED Unipole',
    url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '3D DOOH Curved Monolith',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Urban Gantry Display',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'High-Impact Static Wallscape',
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AddBillboardModal: React.FC<AddBillboardModalProps> = ({
  isOpen,
  onClose,
  defaultCompany,
  onSuccess,
}) => {
  const { addBillboard } = useBillboards();

  const [name, setName] = useState('');
  const [metro, setMetro] = useState<MetroCode>('LOS');
  const [location, setLocation] = useState('');
  const [corridor, setCorridor] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [format, setFormat] = useState('Digital LED');
  const [dimensions, setDimensions] = useState('24m x 8m (192 sq.m)');
  const [resolution, setResolution] = useState('1920 x 1080 Full HD');
  const [priceMonthlyUSD, setPriceMonthlyUSD] = useState<number>(4500);
  const [priceDailyUSD, setPriceDailyUSD] = useState<number>(150);
  const [dailyTrafficVehicles, setDailyTrafficVehicles] = useState<number>(320000);
  const [availabilityStatus, setAvailabilityStatus] = useState('Available Now');
  const [audienceType, setAudienceType] = useState('High-Income Commuters');
  const [lightingType, setLightingType] = useState('Active LED Display');
  const [mediaOwnerCompany, setMediaOwnerCompany] = useState(
    defaultCompany || 'Continental Outdoor Nigeria Ltd'
  );
  const [licenseNumber, setLicenseNumber] = useState('LASAA/OOH/VOL.4/2024-REG');
  const [contactPerson, setContactPerson] = useState('Folashade Adeleke');
  const [contactEmail, setContactEmail] = useState('inventory@continental-outdoor.ng');
  const [contactPhone, setContactPhone] = useState('+234 1 295 8820');
  const [previewUrl, setPreviewUrl] = useState(PHOTO_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !corridor.trim() || !latitude.trim() || !longitude.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addBillboard({
        name: name.trim(),
        metro,
        location: location.trim(),
        corridor: corridor.trim(),
        lat: Number(latitude),
        lng: Number(longitude),
        format,
        dimensions,
        resolution,
        priceMonthlyUSD: Number(priceMonthlyUSD),
        priceDailyUSD: Number(priceDailyUSD),
        dailyTrafficVehicles: Number(dailyTrafficVehicles),
        dailyReach: `${(Number(dailyTrafficVehicles) * 1.7).toLocaleString()} Impressions`,
        availabilityStatus,
        audienceType,
        lightingType,
        mediaOwnerCompany: mediaOwnerCompany.trim(),
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        licenseNumber: licenseNumber.trim(),
        previewUrl,
        description:
          description.trim() ||
          `High-visibility ${format} billboard located on ${corridor.trim()} in ${location.trim()}. Superb reach across executive and commercial traffic corridors.`,
        status: 'Live & Verified',
      });

      setSuccessNotice(`Billboard "${created.name}" registered successfully! ID: ${created.id}`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessNotice(null);
        if (onSuccess) onSuccess(created.id);
        onClose();
      }, 1100);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#eae7e1] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#181716] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#ef5a24]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Add New Billboard Asset
              </h2>
              <p className="text-xs text-zinc-300">
                Register inventory to your concession fleet, live marketplace & CSV export.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Core Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ef5a24]" />
              <span>1. Location & Asset Identity</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Billboard Asset Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Victoria Island Iconic Mega DOOH"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Metro / State *
                </label>
                <select
                  value={metro}
                  onChange={(e) => setMetro(e.target.value as MetroCode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="LOS">Lagos, Nigeria (LOS)</option>
                  <option value="ABJ">Abuja (FCT), Nigeria (ABJ)</option>
                  <option value="PHC">Port Harcourt, Nigeria (PHC)</option>
                  <option value="IBD">Ibadan, Nigeria (IBD)</option>
                  <option value="KAN">Kano, Nigeria (KAN)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Street / Landmark Address *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Plot 14B Ozumba Mbadiwe Ave, VI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Arterial Traffic Corridor *
                </label>
                <input
                  type="text"
                  required
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  placeholder="e.g. Lekki-Epe Coastal Corridor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Exact Latitude *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 6.4281"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Exact Longitude *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 3.4219"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications & Format */}
          <div className="space-y-3 pt-3 border-t border-[#eae7e1]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ef5a24]" />
              <span>2. Format, Dimensions & Hardware</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Display Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="Digital LED">Digital LED Display</option>
                  <option value="Iconic 3D LED">Curved 3D Anamorphic LED</option>
                  <option value="Static Unipole">Static Spectacular Unipole</option>
                  <option value="Gantry Monolith">Overhead Gantry Monolith</option>
                  <option value="Overhead Dual DOOH">Overhead Dual DOOH</option>
                  <option value="Static Wallscape">Mega Static Wallscape</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Physical Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 24m x 8m (192 sq.m)"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Resolution / Illumination
                </label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. 1920 x 1080 Full HD"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Lighting & Sensor Tech
                </label>
                <select
                  value={lightingType}
                  onChange={(e) => setLightingType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="Active LED Display">Active High-Nit LED Display</option>
                  <option value="Solar High-Lumen Backlit">Solar High-Lumen Backlit</option>
                  <option value="Prismatic LED Array">Prismatic LED Array</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Availability Status
                </label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="Available Now">Available Now (Ready to Flight)</option>
                  <option value="Next 14 Days">Available in Next 14 Days</option>
                  <option value="Q4 Booking">Open for Q4 Booking</option>
                  <option value="Booked (Waitlist)">Booked (Waitlist Only)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Audience Profile
                </label>
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                >
                  <option value="High-Income Commuters">High-Income Commuters</option>
                  <option value="Tech & Fintech Pros">Tech & Fintech Professionals</option>
                  <option value="Transit & Airport">Transit & Airport Commuters</option>
                  <option value="FMCG Shoppers">FMCG Retail Shoppers</option>
                  <option value="Youth & University">Youth & University Demographic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Commercial Rates & Traffic */}
          <div className="space-y-3 pt-3 border-t border-[#eae7e1]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Commercial Rates & Vehicle Traffic</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Monthly Rate (USD $) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    required
                    min={100}
                    value={priceMonthlyUSD}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceMonthlyUSD(val);
                      setPriceDailyUSD(Math.round(val / 30));
                    }}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Daily Rate (USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min={10}
                    value={priceDailyUSD}
                    onChange={(e) => setPriceDailyUSD(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Daily Vehicle Traffic
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1000}
                    value={dailyTrafficVehicles}
                    onChange={(e) => setDailyTrafficVehicles(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Photo Selection */}
          <div className="space-y-3 pt-3 border-t border-[#eae7e1]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#ef5a24]" />
              <span>4. Site Photo & Visual Preview</span>
            </h3>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PHOTO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setPreviewUrl(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                    previewUrl === preset.url
                      ? 'border-[#ef5a24] ring-2 ring-[#ef5a24]/20'
                      : 'border-[#eae7e1] hover:border-zinc-400'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-1.5 bg-white text-[10px] font-bold text-zinc-700 truncate">
                    {preset.name}
                  </div>
                  {previewUrl === preset.url && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ef5a24] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                Or enter custom high-resolution image URL
              </label>
              <input
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          {/* Section 5: Media Owner Concession Info */}
          <div className="space-y-3 pt-3 border-t border-[#eae7e1]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#ef5a24]" />
              <span>5. Concessionaire Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Media Owner Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={mediaOwnerCompany}
                  onChange={(e) => setMediaOwnerCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  LASAA / DOAS Regulatory License
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. LASAA/OOH/VOL.4/2024-819A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Contact Person & Role
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Folashade Adeleke"
                  className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Operations Direct Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+234 1 295 8820"
                  className="w-full px-3 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#eae7e1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Asset...' : 'Save & Publish Billboard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
