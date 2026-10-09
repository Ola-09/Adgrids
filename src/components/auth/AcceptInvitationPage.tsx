import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  Building2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AcceptInvitationPageProps {
  onSuccessRedirect: (targetDashboardUrl: string) => void;
  onNavigateTo: (path: string) => void;
}

export const AcceptInvitationPage: React.FC<AcceptInvitationPageProps> = ({
  onSuccessRedirect,
  onNavigateTo,
}) => {
  const { getInvitationInfo, acceptInvitation } = useAuth();

  const [tokenString, setTokenString] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || params.get('invitation') || '';
  });

  const [loadingInfo, setLoadingInfo] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    email?: string;
    role?: string;
    tenantName?: string;
    error?: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      if (!tokenString) {
        setInviteData({ valid: false, error: 'No invitation token was provided.' });
        setLoadingInfo(false);
        return;
      }

      setLoadingInfo(true);
      const res = await getInvitationInfo(tokenString);
      if (isMounted) {
        setInviteData(res);
        if (res.role === 'Field Agent') {
          setTitle('Senior Field Operative');
        } else if (res.role === 'Customer / Client Company') {
          setTitle('Brand Operations Executive');
        }
        setLoadingInfo(false);
      }
    };

    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [tokenString]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await acceptInvitation({
        token: tokenString,
        name: name.trim(),
        password,
        phone: phone.trim() || undefined,
        title: title.trim() || undefined,
      });

      if (result.success && result.user) {
        const targetUrl = result.redirectTo || (
          result.user.role === 'Field Agent'
            ? '/admin/field-agent'
            : result.user.role === 'Customer / Client Company'
            ? '/admin/client'
            : '/admin/agency'
        );
        onSuccessRedirect(targetUrl);
      } else {
        setSubmitError(result.error || 'Failed to activate account.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#171717] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#ef5a24] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
            AO
          </div>
          <h1 className="mt-3 text-2xl font-black text-[#181716] tracking-tight">
            ADGRID Cloud
          </h1>
          <p className="text-xs text-zinc-500">
            Enterprise Organization Invitation
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#ece8e1] rounded-2xl p-7 sm:p-9 shadow-md">
          {loadingInfo ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
              <span className="text-xs font-bold text-zinc-500">
                Verifying cryptographic invitation token...
              </span>
            </div>
          ) : !inviteData?.valid ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#181716]">
                  Invitation Link Invalid or Expired
                </h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  {inviteData?.error || 'This invitation link has expired or has already been used to create an account.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTo('/agency/login')}
                  className="w-full h-10 bg-[#181716] text-white text-xs font-extrabold rounded-xl hover:bg-zinc-800 transition cursor-pointer"
                >
                  Go to Agency Login
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Invitation Context Banner */}
              <div className="mb-6 p-4 rounded-xl bg-orange-50/60 border border-orange-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ef5a24] text-white flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ef5a24] block">
                      Authorized Invitation
                    </span>
                    <strong className="block text-sm font-extrabold text-[#181716]">
                      {inviteData.tenantName}
                    </strong>
                    <span className="inline-block mt-1 text-xs text-zinc-600 font-semibold">
                      Role assigned:{' '}
                      <span className="font-extrabold text-[#181716]">
                        {inviteData.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Invited Email (Read Only)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={inviteData.email || ''}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#dedbd5] bg-zinc-100 text-zinc-600 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tendai Moyo"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 802..."
                        className="w-full h-10 pl-9 pr-2 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181716] mb-1">
                      Title / Designation
                    </label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Operations Lead"
                        className="w-full h-10 pl-9 pr-2 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Create Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-10 pr-10 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181716] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#dedbd5] bg-zinc-50/50 text-xs font-semibold focus:bg-white focus:border-[#ef5a24] outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-[#ef5a24] hover:bg-[#df4d19] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {submitting ? 'Activating Account...' : 'Activate Account & Enter Workspace'}
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
