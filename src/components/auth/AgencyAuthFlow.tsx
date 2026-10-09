import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AgencyAuthFlowProps {
  initialMode?: 'signin' | 'register' | 'forgot-password' | 'verify-email';
  onSuccessRedirect: (targetDashboardUrl: string) => void;
  onNavigatePublicMarketplace: () => void;
  onNavigateTo: (path: string) => void;
}

export const AgencyAuthFlow: React.FC<AgencyAuthFlowProps> = ({
  initialMode = 'signin',
  onSuccessRedirect,
  onNavigatePublicMarketplace,
  onNavigateTo,
}) => {
  const { login, signupAgency, requestPasswordReset } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot-password' | 'verify-email'>(
    initialMode
  );

  // Sign In states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration states (Section 3)
  const [agencyName, setAgencyName] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [city, setCity] = useState('Lagos');
  const [notes, setNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Application Pending Submission State (Section 3)
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sign in submit (Section 5)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your agency work email and password.');
      return;
    }

    setLoading(true);
    setStatusMessage('Authenticating marketing agency credentials...');

    try {
      const result = await login(email.trim(), password, 'agency');

      if (result.success && result.user) {
        setStatusMessage('Loading agency workspace...');
        setTimeout(() => {
          setLoading(false);
          onSuccessRedirect(result.redirectTo || '/admin/agency');
        }, 500);
      } else {
        setLoading(false);
        setError(result.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error. Please retry.');
    }
  };

  // Register submit (Section 3: creates PENDING agency & owner, NO immediate session)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agencyName.trim() || !ownerFullName.trim() || !regEmail.trim()) {
      setError('Agency name, owner full name, and corporate email are required.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreedTerms) {
      setError('Please agree to the ADGRID Marketing Agency terms of service.');
      return;
    }

    setLoading(true);
    setStatusMessage('Submitting marketing agency application...');

    try {
      const result = await signupAgency({
        agencyName: agencyName.trim(),
        ownerFullName: ownerFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || undefined,
        password: regPassword,
        country,
        city,
        notes: notes.trim() || undefined,
      });

      setLoading(false);

      if (result.success && result.pendingApproval) {
        // Section 3: Do NOT redirect to dashboard! Show pending approval screen
        setIsApplicationSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit agency application. Please check inputs.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred during agency application submission.');
    }
  };

  // Forgot password submit
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered agency email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(forgotEmail.trim());
      setLoading(false);
      setForgotSent(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not send reset link. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] flex flex-col justify-between selection:bg-orange-100 selection:text-[#ef5a24]">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          type="button"
          onClick={onNavigatePublicMarketplace}
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ef5a24] text-white flex items-center justify-center font-black text-lg shadow-md">
            AO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-[#181716] tracking-tight block">
                ADGRID
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ef5a24]/10 text-[#ef5a24] font-black uppercase">
                Agency Portal
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              Pan-African OOH Agency Workspace
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTo('/media')}
            className="text-xs font-bold text-zinc-600 hover:text-[#181716] px-3 py-1.5 transition"
          >
            Media Owner Portal →
          </button>
          <button
            type="button"
            onClick={onNavigatePublicMarketplace}
            className="text-xs font-bold text-zinc-600 hover:text-[#181716] px-3 py-1.5 transition"
          >
            Marketplace
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-[#ece8e1] shadow-xl p-6 sm:p-9 space-y-6">
          {/* Section 3: Pending Approval Success Banner */}
          {isApplicationSubmitted ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                <Clock size={32} />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ef5a24] block">
                  Application Submitted
                </span>
                <h2 className="text-2xl font-black text-[#181716] tracking-tight mt-1">
                  Your agency is awaiting approval.
                </h2>
                <p className="mt-3 text-xs text-zinc-600 leading-relaxed max-w-md mx-auto">
                  Your registration for <strong>{agencyName}</strong> has been received and is queued for verification by the Media Owner concessionaire network.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-[#eae7e1] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Agency Organization:</span>
                  <strong className="text-[#181716]">{agencyName}</strong>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Managing Director:</span>
                  <strong className="text-[#181716]">{ownerFullName}</strong>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Registered Work Email:</span>
                  <strong className="text-[#181716]">{regEmail}</strong>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Review Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-[10px]">
                    <Clock size={11} /> PENDING REVIEW
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Once a Media Owner approves your application, your status will become ACTIVE and you will be able to sign in to configure your agency workspace.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsApplicationSubmitted(false);
                    setMode('signin');
                    onNavigateTo('/agency/login');
                  }}
                  className="px-6 py-2.5 bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-extrabold rounded-xl transition shadow-md cursor-pointer"
                >
                  Return to Agency Sign In
                </button>
                <button
                  type="button"
                  onClick={onNavigatePublicMarketplace}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Explore Public Marketplace
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toggle Switch between Sign In and Register */}
              <div className="flex p-1 bg-zinc-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    onNavigateTo('/agency/login');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-[#ef5a24] shadow-sm'
                      : 'text-zinc-600 hover:text-[#181716]'
                  }`}
                >
                  Agency Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    onNavigateTo('/agency/register');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#ef5a24] shadow-sm'
                      : 'text-zinc-600 hover:text-[#181716]'
                  }`}
                >
                  Register Marketing Agency
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-[#181716] tracking-tight">
                      Sign In to Marketing Agency Workspace
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Enter your authorized agency credentials.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Agency Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="partner@afrireach.africa"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-password');
                          setError(null);
                          onNavigateTo('/agency/forgot-password');
                        }}
                        className="text-[11px] font-bold text-[#ef5a24] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your agency password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-zinc-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#eae7e1] text-[#ef5a24] focus:ring-[#ef5a24]"
                      />
                      <span>Remember agency session</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{statusMessage || 'Signing in...'}</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Agency Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-[11px] text-zinc-500">
                    <span>New Marketing Agency? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        onNavigateTo('/agency/register');
                      }}
                      className="font-bold text-[#ef5a24] hover:underline cursor-pointer"
                    >
                      Register your Marketing Agency
                    </button>
                  </div>
                </form>
              )}

              {/* 2. REGISTRATION FORM (Section 3) */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-[#181716] tracking-tight">
                      Register your Marketing Agency
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Submit your agency application for Media Owner concessionaire approval.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Agency Name *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={agencyName}
                          onChange={(e) => setAgencyName(e.target.value)}
                          placeholder="e.g. AfriReach Media Group"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Agency Owner Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={ownerFullName}
                          onChange={(e) => setOwnerFullName(e.target.value)}
                          placeholder="e.g. Kofi Mensah"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="kofi@afrireach.africa"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Country *</label>
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
                      <label className="block text-xs font-bold text-zinc-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lagos, Nairobi, Johannesburg..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Password (min 6 chars) *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Business Information / Specialization (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. FMCG campaigns, telecommunications, retail brand activations across corridors..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                  </div>

                  <div className="p-3 bg-[#fffaf8] rounded-xl border border-orange-100 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="agreedTerms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#eae7e1] text-[#ef5a24] focus:ring-[#ef5a24]"
                    />
                    <label htmlFor="agreedTerms" className="text-[11px] text-zinc-600 leading-relaxed cursor-pointer">
                      I understand that submitting this form registers a PENDING Marketing Agency application, which requires approval from the Media Owner network before workspace access is granted.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Agency Application for Approval</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 3. FORGOT PASSWORD */}
              {mode === 'forgot-password' && (
                <div className="space-y-4">
                  {forgotSent ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#ef5a24] mx-auto" />
                      <h3 className="text-sm font-bold text-zinc-900">Reset instructions dispatched</h3>
                      <p className="text-xs text-zinc-600">
                        If an agency account exists for <strong>{forgotEmail}</strong>, an encrypted
                        reset link has been sent.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setForgotSent(false);
                          onNavigateTo('/agency/login');
                        }}
                        className="mt-3 px-4 py-2 rounded-xl bg-[#ef5a24] text-white text-xs font-bold cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <h2 className="text-xl font-black text-[#181716] tracking-tight">
                          Reset Agency Password
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Enter your registered agency email address to receive password reset instructions.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Agency Registered Work Email
                        </label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="owner@youragency.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Password Reset Link</span>}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('signin');
                            onNavigateTo('/agency/login');
                          }}
                          className="text-xs font-bold text-zinc-500 hover:text-[#ef5a24] cursor-pointer"
                        >
                          ← Return to Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-zinc-400 border-t border-[#eae7e1]">
        <span>© {new Date().getFullYear()} ADGRID Pan-African Network. Marketing Agency Operating System.</span>
      </footer>
    </div>
  );
};
