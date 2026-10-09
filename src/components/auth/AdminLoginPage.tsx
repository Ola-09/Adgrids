import React, { useState } from 'react';
import {
  Lock,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  HelpCircle,
  Check,
  Info,
  UserPlus,
  Building2,
  FileCheck,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AdminLoginPageProps {
  onSuccessRedirect: (targetDashboardUrl: string) => void;
  onNavigatePublicMarketplace: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccessRedirect,
  onNavigatePublicMarketplace,
}) => {
  const { login, signup, verifyMFA, requestPasswordReset } = useAuth();

  // Mode: 'signin', 'signup', or 'mfa'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'mfa'>('signin');
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Customer / Client Company');
  const [signupOrganization, setSignupOrganization] = useState('');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupCity, setSignupCity] = useState('Lagos');
  const [signupLicense, setSignupLicense] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Shared Status States
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }

    setIsAuthenticating(true);
    setAuthStatusMessage('Authenticating credentials...');

    setTimeout(() => {
      setAuthStatusMessage('Retrieving organization & active tenant...');
    }, 350);

    setTimeout(() => {
      setAuthStatusMessage('Determining cryptographic role & permissions...');
    }, 700);

    const result = await login(email.trim(), password);

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthStatusMessage(null);

      if (result.status === 'MFA_REQUIRED' && result.mfaToken) {
        setMfaChallengeToken(result.mfaToken);
        setAuthMode('mfa');
        setError(null);
        return;
      }

      if (result.success && result.user) {
        const dest = result.redirectTo || result.user.authorizedDashboard || '/admin/media-owner';
        onSuccessRedirect(dest);
      } else {
        setError(result.error || 'Authentication failed. Please verify your email and credentials.');
      }
    }, 950);
  };

  // Handle MFA Challenge Submit
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallengeToken || !mfaCode.trim()) {
      setError('Please enter your 6-digit authenticator or backup code.');
      return;
    }

    setIsAuthenticating(true);
    setAuthStatusMessage('Verifying two-factor credentials...');

    const result = await verifyMFA(mfaChallengeToken, mfaCode.trim());

    setIsAuthenticating(false);
    setAuthStatusMessage(null);

    if (result.success && result.user) {
      const dest = result.redirectTo || result.user.authorizedDashboard || '/admin/media-owner';
      onSuccessRedirect(dest);
    } else {
      setError(result.error || 'Invalid authenticator code. Please check your app.');
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupOrganization.trim()) {
      setError('Please fill in your name, corporate email, and organization name.');
      return;
    }

    if (signupPassword && signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword && signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (signupRole === 'Media Owner') {
      setError('Media Owner concessionaires must register exclusively at /media/register.');
      return;
    }

    if (signupRole === 'Agency Admin') {
      setError('Marketing Agencies must submit their application exclusively at /agency/register.');
      return;
    }

    if (!agreedTerms) {
      setError('Please accept the OOH Concessionaire and Regulatory Compliance terms to proceed.');
      return;
    }

    setIsAuthenticating(true);
    setAuthStatusMessage('Registering enterprise tenant account...');

    setTimeout(() => {
      setAuthStatusMessage('Assigning regulatory roles & permissions...');
    }, 400);

    setTimeout(() => {
      setAuthStatusMessage('Provisioning secure inventory & analytics console...');
    }, 800);

    const result = await signup({
      name: signupName.trim(),
      email: signupEmail.trim(),
      organization: signupOrganization.trim(),
      role: signupRole,
      title: signupTitle.trim() || 'Enterprise Administrator',
      licenseNumber: signupLicense.trim() || 'LASAA/OOH/VOL.4/2024-REG',
      city: signupCity,
      password: signupPassword,
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthStatusMessage(null);

      if (result.success && result.user) {
        const dest = result.redirectTo || result.user.authorizedDashboard || '/admin/media-owner';
        onSuccessRedirect(dest);
      } else {
        setError(result.error || 'Sign up failed. Please check your inputs and try again.');
      }
    }, 1100);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsAuthenticating(true);
    await requestPasswordReset(forgotEmail.trim());
    setIsAuthenticating(false);
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between selection:bg-white selection:text-[#ef5a24]">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ef5a24] flex items-center justify-center text-white font-black text-xl shadow-md">
            AO
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#181716] tracking-tight block">
              ADGRID
            </span>
            <span className="text-[11px] text-zinc-500 font-semibold">
              Pan-African Advertising Infrastructure & Operations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/agency"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fff5f2] border border-[#ef5a24]/30 text-xs font-bold text-[#ef5a24] hover:bg-[#ffece5] transition-colors shadow-2xs"
          >
            <span>Agency Portal</span>
          </a>
          <button
            onClick={onNavigatePublicMarketplace}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#eae7e1] text-xs font-bold text-[#181716] hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#ef5a24]" />
            <span>Public Marketplace</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="flex-1 flex items-center justify-center p-4 my-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#eae7e1] shadow-xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#181716] text-white mx-auto flex items-center justify-center text-2xl font-black shadow-md">
              {authMode === 'signin' ? (
                <Lock className="w-6 h-6 text-white" />
              ) : (
                <UserPlus className="w-6 h-6 text-[#ef5a24]" />
              )}
            </div>
            <h1 className="text-2xl font-normal text-[#181716] tracking-tight font-serif italic">
              {authMode === 'mfa'
                ? 'Two-Factor Authentication'
                : authMode === 'signin'
                ? 'Central Authentication Gateway'
                : 'Register Enterprise Account'}
            </h1>
            <p className="text-xs text-zinc-500">
              {authMode === 'mfa'
                ? 'Enter the 6-digit code from your authenticator app or an emergency backup code.'
                : authMode === 'signin'
                ? 'Enter your corporate credentials to access your organization workspace.'
                : 'Register your organization to join the Pan-African advertising network.'}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex rounded-2xl bg-[#faf9f6] p-1 border border-[#eae7e1]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#181716] shadow-xs'
                  : 'text-zinc-500 hover:text-[#181716]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#181716] shadow-xs'
                  : 'text-zinc-500 hover:text-[#181716]'
              }`}
            >
              Sign Up / Register
            </button>
          </div>

          {/* Authentication Status Overlay */}
          {isAuthenticating && (
            <div className="p-3.5 rounded-2xl bg-[#181716] text-white text-xs flex items-center gap-3 shadow-md animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#ef5a24]" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block truncate">{authStatusMessage}</span>
                <span className="text-[10px] text-zinc-300 block">Loading role-specific workspace...</span>
              </div>
            </div>
          )}

          {error && !isAuthenticating && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {/* MODE 0: MFA CHALLENGE FORM */}
          {authMode === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 block">
                  Authenticator Code / Backup Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="e.g. 123456 or ABC123"
                  disabled={isAuthenticating}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-center text-lg tracking-widest text-[#181716] font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setMfaChallengeToken(null);
                    setMfaCode('');
                  }}
                  className="text-xs font-bold text-zinc-600 hover:text-[#181716] transition-colors"
                >
                  ← Back to standard sign in
                </button>
              </div>
            </form>
          )}

          {/* MODE 1: SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 block">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.africa"
                  disabled={isAuthenticating}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24] disabled:opacity-60 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-bold text-zinc-500 hover:text-[#ef5a24] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-sm text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24] disabled:opacity-60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#eae7e1] text-[#ef5a24] focus:ring-[#ef5a24]"
                  />
                  <span>Remember me on this workstation</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all group disabled:opacity-75 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#eae7e1] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Concessionaire fleet owner?</span>
                  <a href="/media/login" className="font-bold text-[#ef5a24] hover:underline">
                    Media Owner Portal (/media) →
                  </a>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Marketing agency team?</span>
                  <a href="/agency/login" className="font-bold text-[#ef5a24] hover:underline">
                    Agency Portal (/agency) →
                  </a>
                </div>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs font-bold text-zinc-600 hover:text-[#ef5a24] transition-colors"
                >
                  Need a new advertiser or vendor account?{' '}
                  <span className="underline text-[#ef5a24]">Sign Up here</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Babatunde Balogun"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@concession.ng"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              {/* Dedicated portals notice */}
              <div className="space-y-2 pt-1 pb-1">
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] flex items-center justify-between gap-2">
                  <div className="text-amber-900 leading-tight">
                    <strong>Media Owner Concessionaires:</strong> Register inventory at the dedicated portal.
                  </div>
                  <a
                    href="/media/register"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors"
                  >
                    /media →
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-[11px] flex items-center justify-between gap-2">
                  <div className="text-orange-900 leading-tight">
                    <strong>Marketing Agencies:</strong> Submit agency application for review and approval.
                  </div>
                  <a
                    href="/agency/register"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-[#ef5a24] text-white font-bold hover:bg-[#df4d19] transition-colors"
                  >
                    /agency →
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Account Role *
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    disabled={isAuthenticating}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  >
                    <option value="Customer / Client Company">Advertiser / Brand Client</option>
                    <option value="Vendor">Contractor / Rigging Vendor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Organization / Concession *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupOrganization}
                    onChange={(e) => setSignupOrganization(e.target.value)}
                    placeholder="e.g. Continental Outdoor Nigeria"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Operating Metro / Hub
                  </label>
                  <select
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  >
                    <option value="Lagos">Lagos, Nigeria</option>
                    <option value="Abuja">Abuja (FCT), Nigeria</option>
                    <option value="Port Harcourt">Port Harcourt, Nigeria</option>
                    <option value="Ibadan">Ibadan, Nigeria</option>
                    <option value="Kano">Kano, Nigeria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Regulatory License (LASAA/DOAS)
                  </label>
                  <input
                    type="text"
                    value={signupLicense}
                    onChange={(e) => setSignupLicense(e.target.value)}
                    placeholder="e.g. LASAA/OOH/2024-REG"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isAuthenticating}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Confirm Password *
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isAuthenticating}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              <div className="text-xs pt-1">
                <label className="flex items-start gap-2 cursor-pointer font-medium text-zinc-600 select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded border-[#eae7e1] text-[#ef5a24] focus:ring-[#ef5a24] mt-0.5"
                  />
                  <span className="text-[11px] leading-snug">
                    I confirm compliance with Nigerian OOH advertising regulations (LASAA / DOAS / OAAN standards) and agree to ADGRID Verified Concessionaire Terms.
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all group disabled:opacity-75 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Enterprise Tenant...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Enter Console</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-bold text-zinc-600 hover:text-[#ef5a24] transition-colors"
                >
                  Already registered? <span className="underline text-[#ef5a24]">Sign In to your account</span>
                </button>
              </div>
            </form>
          )}

          {/* Test Accounts Reference Accordion */}
          <div className="border border-[#eae7e1] rounded-2xl p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#181716] uppercase tracking-wider">
                Phase 1 Development Test Accounts (Password: AdGrid2026!)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { email: 'admin@adgrid.test', role: 'Platform Admin' },
                { email: 'agency@adgrid.test', role: 'Agency Admin' },
                { email: 'campaigns@adgrid.test', role: 'Campaign Manager' },
                { email: 'operations@adgrid.test', role: 'Operations Manager' },
                { email: 'client@adgrid.test', role: 'Brand Client' },
                { email: 'mediaowner@adgrid.test', role: 'Media Owner' },
                { email: 'vendor@adgrid.test', role: 'Vendor' },
                { email: 'fieldagent@adgrid.test', role: 'Field Agent' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('AdGrid2026!');
                    setAuthMode('signin');
                  }}
                  className="text-left px-2 py-1 rounded bg-white border border-[#eae7e1] hover:border-[#ef5a24] text-[10px] text-zinc-700 hover:text-[#ef5a24] transition-colors flex justify-between items-center"
                >
                  <span className="font-semibold truncate">{acc.role}</span>
                  <span className="text-[9px] text-zinc-400">Select</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3 rounded-2xl bg-[#faf9f6] border border-[#eae7e1] flex items-start gap-2.5 text-xs text-zinc-600">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Enterprise Zero-Trust:</strong> Concession inventory, bookings, and financial escrow clearing are encrypted with automated bank-grade verification.
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#eae7e1] shadow-2xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-normal text-[#181716] font-serif italic">
                Reset Enterprise Password
              </h2>
              <p className="text-xs text-zinc-500">
                Enter your registered corporate domain email to receive a zero-trust reset token.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Password reset token dispatched to domain security officer.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@organization.africa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#df4d19] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-zinc-400 border-t border-[#eae7e1]">
        © {new Date().getFullYear()} ADGRID. ISO 20560 Audited • Nigerian OOH Concession Infrastructure.
      </footer>
    </div>
  );
};
