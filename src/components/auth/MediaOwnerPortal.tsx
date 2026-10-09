import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Eye,
  EyeOff,
  MapPin,
  Lock,
  Mail,
  User,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  CalendarCheck,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MediaOwnerPortalProps {
  initialMode?: 'overview' | 'login' | 'register';
  onSuccessRedirect: (targetDashboardUrl: string) => void;
  onNavigatePublicMarketplace: () => void;
  onNavigateTo: (path: string) => void;
}

export const MediaOwnerPortal: React.FC<MediaOwnerPortalProps> = ({
  initialMode = 'overview',
  onSuccessRedirect,
  onNavigatePublicMarketplace,
  onNavigateTo,
}) => {
  const { login, signupMediaOwner } = useAuth();

  const [mode, setMode] = useState<'overview' | 'login' | 'register'>(initialMode);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [ownerName, setOwnerName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [city, setCity] = useState('Lagos');
  const [country, setCountry] = useState('Nigeria');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [title, setTitle] = useState('Managing Director & Concessionaire');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please provide your concessionaire email and password.');
      return;
    }

    setLoading(true);
    setStatusMessage('Authenticating Media Owner credentials...');

    try {
      const result = await login(loginEmail.trim(), loginPassword, 'media');

      if (result.success && result.user) {
        setStatusMessage('Opening concessionaire yield dashboard...');
        setTimeout(() => {
          setLoading(false);
          onSuccessRedirect(result.redirectTo || '/admin/media-owner');
        }, 500);
      } else {
        setLoading(false);
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication service error. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ownerName.trim() || !orgName.trim() || !regEmail.trim()) {
      setError('Please provide your full name, concessionaire company name, and corporate email.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreedTerms) {
      setError('Please agree to the OOH Concessionaire terms of service.');
      return;
    }

    setLoading(true);
    setStatusMessage('Provisioning Media Owner concessionaire organization...');

    try {
      const result = await signupMediaOwner({
        name: ownerName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        organization: orgName.trim(),
        city,
        country,
        licenseNumber: licenseNumber.trim() || 'LASAA/OOH/VOL.4/2024-REG',
        title: title.trim() || 'Managing Director & Concessionaire',
      });

      if (result.success && result.user) {
        setStatusMessage('Concessionaire workspace active. Entering dashboard...');
        setTimeout(() => {
          setLoading(false);
          onSuccessRedirect('/admin/media-owner');
        }, 600);
      } else {
        setLoading(false);
        setError(result.error || 'Concessionaire registration failed.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration service error.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#171717] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ece8e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigatePublicMarketplace}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ef5a24] text-white flex items-center justify-center font-black text-sm shadow-sm">
              AO
            </div>
            <div>
              <strong className="block text-sm font-extrabold tracking-tight text-[#181716]">
                ADGRID
              </strong>
              <small className="block text-[8px] font-extrabold uppercase tracking-widest text-[#ef5a24]">
                Media Owner Portal
              </small>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigatePublicMarketplace}
              className="text-xs font-bold text-[#67635e] hover:text-[#171717] px-3 py-2 transition"
            >
              Public Marketplace
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                onNavigateTo('/media/login');
              }}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition ${
                mode === 'login'
                  ? 'bg-zinc-100 text-[#171717]'
                  : 'text-[#67635e] hover:text-[#171717]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                onNavigateTo('/media/register');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-extrabold rounded-lg shadow-sm transition"
            >
              List Concession Inventory
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {mode === 'overview' && (
          <div className="space-y-12">
            {/* Hero Banner */}
            <div className="bg-[#181716] text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#ef5a24]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ef5a24] text-[10px] font-extrabold uppercase tracking-wider mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#ef5a24]" />
                  Concessionaire & Asset Command
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  The Top-Level Media Owner Portal.
                </h1>
                <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  Publish premium billboard assets, approve marketing agency booking requests, monitor flight revenues, and manage multi-metro concessions in one high-precision operating system.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      onNavigateTo('/media/register');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-extrabold rounded-xl shadow-md transition"
                  >
                    Register Your Media Company
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      onNavigateTo('/media/login');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold rounded-xl transition border border-white/15"
                  >
                    Concessionaire Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Key Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#ece8e1] rounded-xl p-6 shadow-sm hover:border-[#df4d19]/40 transition">
                <div className="w-10 h-10 rounded-lg bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-[#181716]">Fleet Inventory Control</h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  Register digital LEDs, iconic 3D unipoles, and gantry monoliths. Maintain occupancy rates and live sensor telemetry.
                </p>
              </div>

              <div className="bg-white border border-[#ece8e1] rounded-xl p-6 shadow-sm hover:border-[#df4d19]/40 transition">
                <div className="w-10 h-10 rounded-lg bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center mb-4">
                  <Building2 size={20} />
                </div>
                <h3 className="text-base font-bold text-[#181716]">Agency Relationship Authority</h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  Review and approve Marketing Agency registrations. Connected agencies can plan campaigns and book your verified inventory.
                </p>
              </div>

              <div className="bg-white border border-[#ece8e1] rounded-xl p-6 shadow-sm hover:border-[#df4d19]/40 transition">
                <div className="w-10 h-10 rounded-lg bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center mb-4">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-base font-bold text-[#181716]">Revenue & Cross-Border Escrow</h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  Track monthly bookings, yield optimization, automated invoicing, and milestone payouts across West, East, and South African nodes.
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-[#ece8e1] rounded-2xl p-7 sm:p-9 shadow-md">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center mx-auto mb-3">
                  <Building2 size={24} />
                </div>
                <h2 className="text-2xl font-black text-[#181716] tracking-tight">
                  Media Owner Sign In
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Access your concessionaire inventory, bookings, and agency approvals.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {statusMessage && (
                <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
                  {statusMessage}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Concessionaire Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. fadeleke@continentaloutdoor.ng"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Media Owner Workspace'}
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#ece8e1] text-center">
                <p className="text-xs text-zinc-500">
                  Don't have a Media Owner account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      onNavigateTo('/media/register');
                    }}
                    className="font-bold text-[#ef5a24] hover:underline"
                  >
                    Register your concession
                  </button>
                </p>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Marketing Agency?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigateTo('/agency/login')}
                    className="font-bold text-zinc-700 hover:underline"
                  >
                    Sign in via Agency Portal
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-[#ece8e1] rounded-2xl p-7 sm:p-9 shadow-md">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center mx-auto mb-3">
                  <Store size={24} />
                </div>
                <h2 className="text-2xl font-black text-[#181716] tracking-tight">
                  Register Media Concessionaire
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Establish your top-level Media Owner organization on the ADGRID network.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {statusMessage && (
                <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
                  {statusMessage}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Concessionaire Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Continental Outdoor Media Ltd"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Executive Concessionaire Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Folashade Adeleke"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="corporate@continentaloutdoor.ng"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Executive Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Managing Director & Concessionaire"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      City & Metro
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lagos"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      OOH Regulatory License No.
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="LASAA/OOH/VOL.4/2024-REG"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 px-3.5 pr-10 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#ef5a24]"
                  />
                  <span>
                    I confirm this concessionaire holds verified physical and digital OOH advertising inventory and agree to ADGRID terms of service.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Complete Media Owner Registration'}
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#ece8e1] text-center">
                <p className="text-xs text-zinc-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      onNavigateTo('/media/login');
                    }}
                    className="font-bold text-[#ef5a24] hover:underline"
                  >
                    Sign in to concessionaire portal
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
