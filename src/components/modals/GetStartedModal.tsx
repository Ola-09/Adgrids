import React from 'react';
import {
  X,
  Layers,
  Building2,
  Briefcase,
  Smartphone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (route: string) => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#ece8e1] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#ece8e1] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ef5a24] block">
              ADGRID Platform Onboarding
            </span>
            <h2 className="text-xl font-black text-[#181716] tracking-tight mt-0.5">
              How do you use ADGRID?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6 space-y-3">
          {/* Option 1: Media Owner */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectOption('/media/register');
            }}
            className="w-full p-4 rounded-xl border border-[#ece8e1] hover:border-[#ef5a24] bg-white hover:bg-orange-50/20 text-left transition group flex items-start gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-extrabold text-[#181716] group-hover:text-[#ef5a24] transition-colors">
                  I'm a Media Owner
                </strong>
                <ArrowRight size={15} className="text-zinc-400 group-hover:text-[#ef5a24] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                I own or manage billboard structures and digital LED inventory. Publish spaces, optimize yield, and approve marketing agency connections.
              </p>
            </div>
          </button>

          {/* Option 2: Marketing Agency */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectOption('/agency/register');
            }}
            className="w-full p-4 rounded-xl border border-[#ece8e1] hover:border-[#ef5a24] bg-white hover:bg-orange-50/20 text-left transition group flex items-start gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-[#181716] flex items-center justify-center shrink-0 group-hover:bg-[#ef5a24]/10 group-hover:text-[#ef5a24] group-hover:scale-105 transition">
              <Building2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-extrabold text-[#181716] group-hover:text-[#ef5a24] transition-colors">
                  I'm a Marketing Agency
                </strong>
                <ArrowRight size={15} className="text-zinc-400 group-hover:text-[#ef5a24] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                I represent brand clients, plan cross-metro OOH campaigns, coordinate field audits, and dispatch mounting contractors.
              </p>
            </div>
          </button>

          {/* Option 3: Client / Brand Company */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectOption('/agency/login');
            }}
            className="w-full p-4 rounded-xl border border-[#ece8e1] hover:border-[#ef5a24] bg-white hover:bg-orange-50/20 text-left transition group flex items-start gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-[#181716] flex items-center justify-center shrink-0 group-hover:bg-[#ef5a24]/10 group-hover:text-[#ef5a24] group-hover:scale-105 transition">
              <Briefcase size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-extrabold text-[#181716] group-hover:text-[#ef5a24] transition-colors">
                  I'm a Client / Brand Advertiser
                </strong>
                <ArrowRight size={15} className="text-zinc-400 group-hover:text-[#ef5a24] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Sign in to your client tracker or accept an agency invitation to monitor live campaign flights and proof-of-play telemetry.
              </p>
            </div>
          </button>

          {/* Option 4: Field Agent */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectOption('/agency/login');
            }}
            className="w-full p-4 rounded-xl border border-[#ece8e1] hover:border-[#ef5a24] bg-white hover:bg-orange-50/20 text-left transition group flex items-start gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-[#181716] flex items-center justify-center shrink-0 group-hover:bg-[#ef5a24]/10 group-hover:text-[#ef5a24] group-hover:scale-105 transition">
              <Smartphone size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-extrabold text-[#181716] group-hover:text-[#ef5a24] transition-colors">
                  I'm a Field Agent / Operative
                </strong>
                <ArrowRight size={15} className="text-zinc-400 group-hover:text-[#ef5a24] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Operate Mobile Field OS for assigned audit routes, GPS photo verification, and illumination sensor testing.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-[#ece8e1] flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium">Already have an account?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectOption('/agency/login');
            }}
            className="font-extrabold text-[#ef5a24] hover:underline cursor-pointer"
          >
            Sign in here →
          </button>
        </div>
      </div>
    </div>
  );
};
