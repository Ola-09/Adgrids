import React from 'react';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { EntitlementKey } from '../../types/entitlements';
import { useEntitlements } from '../../context/EntitlementContext';
import { ENTITLEMENT_CATALOG, getTierName } from '../../utils/entitlementCatalog';

interface FeatureGateProps {
  entitlement: EntitlementKey;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  compact?: boolean;
  inlineBadgeOnly?: boolean;
  children?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  entitlement,
  requiredPermission,
  fallback,
  compact = false,
  inlineBadgeOnly = false,
  children,
}) => {
  const { checkAccess, currentPlan, openUpgradeModal } = useEntitlements();
  const access = checkAccess(entitlement, requiredPermission);

  // If user has both subscription entitlement and role permission:
  if (access.allowed) {
    return <>{children}</>;
  }

  // If custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  const def = ENTITLEMENT_CATALOG[entitlement];
  const requiredPlanName = getTierName(def?.requiredTier || 'professional');
  const currentPlanName = getTierName(currentPlan.tier);

  // If it's a role permission issue rather than subscription entitlement
  if (access.missingRolePermission) {
    return (
      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Role Restricted:</strong> {access.reason}
        </span>
      </div>
    );
  }

  // Inline badge style for table cells or filter pills
  if (inlineBadgeOnly) {
    return (
      <button
        onClick={() => openUpgradeModal(entitlement)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer transition-colors"
        title={`Unlocked on ${requiredPlanName} plan. Click to view upgrade options.`}
      >
        <Lock className="w-3 h-3 text-amber-600" />
        <span>{requiredPlanName} Feature</span>
      </button>
    );
  }

  // Compact inline bar style
  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-[#fffaf8] border border-[#ef5a24]/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-[#181716]">{def?.name}</span>
            <span className="text-zinc-500 text-[11px] ml-1.5 hidden sm:inline">
              — {def?.description}
            </span>
          </div>
        </div>
        <button
          onClick={() => openUpgradeModal(entitlement)}
          className="px-3 py-1.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
        >
          <span>Upgrade to {requiredPlanName}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Standard Full Feature Lock Card conforming to Section 10 Specification
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-b from-[#fffaf8] to-white border border-[#ef5a24]/25 shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ef5a24]">
                Premium Feature
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                Requires {requiredPlanName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#181716] tracking-tight mt-0.5">
              {def?.name || 'Advanced Intelligence Feature'}
            </h3>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">
            Current Tier
          </span>
          <span className="text-xs font-black text-zinc-700">{currentPlanName}</span>
        </div>
      </div>

      {/* What it does & Why it is useful */}
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-2xl bg-white border border-[#eae7e1]">
          <span className="font-bold text-[#181716] block mb-0.5">What it does:</span>
          <p className="text-zinc-600 leading-relaxed">{def?.description}</p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70">
          <span className="font-bold text-amber-950 block mb-0.5">Why it is useful:</span>
          <p className="text-amber-900 leading-relaxed font-medium">
            {def?.whyUseful}
          </p>
        </div>
      </div>

      {/* Plan status & Upgrade CTA */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#eae7e1]">
        <div className="text-xs text-zinc-500">
          Available on <strong className="text-[#181716]">{requiredPlanName}</strong> and higher.
        </div>

        <button
          onClick={() => openUpgradeModal(entitlement)}
          className="px-4 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span>Upgrade to {requiredPlanName}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
