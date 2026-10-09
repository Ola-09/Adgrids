import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface AgencyWorkspaceSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWorkspace: any) => void;
  initialData?: {
    name?: string;
    logoUrl?: string;
    address?: string;
    country?: string;
    city?: string;
    phone?: string;
    website?: string;
    currency?: string;
    timezone?: string;
    licenseNumber?: string;
  };
}

export const AgencyWorkspaceSetupModal: React.FC<AgencyWorkspaceSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [logoUrl, setLogoUrl] = useState(
    initialData?.logoUrl ||
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80'
  );
  const [address, setAddress] = useState(initialData?.address || '');
  const [country, setCountry] = useState(initialData?.country || 'Nigeria');
  const [city, setCity] = useState(initialData?.city || 'Lagos');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'WAT (UTC+1)');
  const [taxNumber, setTaxNumber] = useState(initialData?.licenseNumber || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agency name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/agency/workspace/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl.trim(),
          address: address.trim(),
          country,
          city: city.trim(),
          phone: phone.trim(),
          website: website.trim(),
          currency,
          timezone,
          licenseNumber: taxNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.workspace);
        onClose();
      } else {
        setError(data.error || 'Failed to update agency workspace profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error updating workspace.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#eae7e1] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#eae7e1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff5f2] border border-[#ef5a24]/20 flex items-center justify-center text-[#ef5a24]">
              <Building2 className="w-5 h-5 text-[#ef5a24]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#181716] tracking-tight">
                Create Your Agency Workspace
              </h2>
              <p className="text-xs text-zinc-500">
                Configure your agency operating profile, currency, regional timezones, and tax parameters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Agency Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SOAIR Media Agency"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Agency Logo URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Business Headquarters Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 14, Commercial Avenue, Victoria Island"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Ghana">Ghana</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">City / Metro</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lagos, Nairobi, Johannesburg..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Corporate Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 1 234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Agency Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://agency.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="KES">KES (KSh)</option>
                <option value="ZAR">ZAR (R)</option>
                <option value="GHS">GHS (GH₵)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              >
                <option value="WAT (UTC+1)">West Africa (WAT / UTC+1)</option>
                <option value="EAT (UTC+3)">East Africa (EAT / UTC+3)</option>
                <option value="CAT (UTC+2)">Central/Southern Africa (CAT / UTC+2)</option>
                <option value="GMT (UTC+0)">GMT / UTC+0</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Tax / RC Business ID
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. RC-148920-NG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#faf9f6] border border-[#eae7e1] rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#ef5a24] shrink-0" />
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Once created, this workspace isolates your team's campaigns, client billings,
              contracted media inventory, and proof-of-play audits under full cryptographic tenant isolation.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#eae7e1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#eae7e1] text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-extrabold shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Workspace...</span>
                </>
              ) : (
                <>
                  <span>Save & Initialize Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
