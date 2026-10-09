import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
  Zap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useEntitlements } from '../../context/EntitlementContext';
import { ENTITLEMENT_CATALOG, getTierName } from '../../utils/entitlementCatalog';
import { BillingInterval, PlanTier } from '../../types/entitlements';

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    activeUpgradeKey,
    closeUpgradeModal,
    plans,
    currentPlan,
    changePlan,
  } = useEntitlements();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  if (!isUpgradeModalOpen) return null;

  const targetFeature = activeUpgradeKey ? ENTITLEMENT_CATALOG[activeUpgradeKey] : null;

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      await changePlan(planId, billingInterval);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#eae7e1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#eae7e1] flex items-center justify-between bg-linear-to-b from-[#fff9f6] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#181716] tracking-tight">
                Upgrade Workspace Intelligence
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Choose the right subscription tier for your OOH media operations and client reporting.
              </p>
            </div>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Spotlight Callout if opened from a specific locked feature */}
        {targetFeature && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Feature Spotlight: {targetFeature.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/70 text-amber-900">
                  Required: {getTierName(targetFeature.requiredTier)}
                </span>
              </div>
              <p className="text-xs text-amber-950 mt-1 font-medium">
                {targetFeature.description}
              </p>
              <p className="text-[11px] text-amber-800/90 mt-0.5 italic">
                “{targetFeature.whyUseful}”
              </p>
            </div>
          </div>
        )}

        {/* Billing interval toggle */}
        <div className="flex justify-center mt-5 mb-2">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs font-bold">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-white text-[#181716] shadow-2xs font-black'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-white text-[#181716] shadow-2xs font-black'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan.id;
            const price =
              billingInterval === 'annual'
                ? Math.round(plan.priceAnnualUSD / 12)
                : plan.priceMonthlyUSD;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#ef5a24] bg-[#fffaf8] shadow-sm ring-1 ring-[#ef5a24]/20'
                    : plan.isPopular
                    ? 'border-zinc-300 bg-white shadow-md'
                    : 'border-[#eae7e1] bg-white hover:border-zinc-300'
                }`}
              >
                {plan.isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#181716] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ef5a24] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    Current Plan
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-[#181716]">{plan.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      {plan.tier}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mt-1 min-h-[36px]">
                    {plan.tagline}
                  </p>

                  <div className="mt-4 pb-4 border-b border-[#eae7e1]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#181716]">${price}</span>
                      <span className="text-xs text-zinc-500 font-semibold">/ month</span>
                    </div>
                    {billingInterval === 'annual' && plan.priceAnnualUSD > 0 && (
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Billed annually (${plan.priceAnnualUSD}/yr)
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 space-y-2.5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                      Key Capabilities:
                    </div>

                    <ul className="space-y-2 text-xs">
                      {plan.tier === 'starter' && (
                        <>
                          <li className="flex items-start gap-2 text-zinc-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Inventory discovery & booking</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Basic specs & photo proof</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>1 Active campaign</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-400">
                            <X className="w-3.5 h-3.5 text-zinc-300 mt-0.5 shrink-0" />
                            <span>No 360° or traffic telemetry</span>
                          </li>
                        </>
                      )}

                      {plan.tier === 'professional' && (
                        <>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>360° billboard views</strong> & video proof</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>Traffic telemetry</strong> (Vehicular + Foot)</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>Multi-billboard comparison</strong></span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Live GPS distance PoP audits</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Up to 15 campaigns & 10 clients</span>
                          </li>
                        </>
                      )}

                      {plan.tier === 'enterprise' && (
                        <>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>White-label client reporting</strong></span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>REST APIs & Webhooks</strong></span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Recurring automated PoP audits</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>Custom BI reporting & analytics</span>
                          </li>
                          <li className="flex items-start gap-2 text-zinc-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span><strong>Unlimited</strong> campaigns & seats</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#eae7e1]">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-500 font-bold text-xs cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active Subscription</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loadingPlanId === plan.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        plan.tier === 'enterprise'
                          ? 'bg-[#181716] hover:bg-black text-white'
                          : 'bg-[#ef5a24] hover:bg-[#d94e1d] text-white'
                      }`}
                    >
                      {loadingPlanId === plan.id ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          <span>
                            {plan.priceMonthlyUSD > currentPlan.priceMonthlyUSD
                              ? `Upgrade to ${plan.name}`
                              : `Switch to ${plan.name}`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#eae7e1] bg-[#faf9f6] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All tiers maintain strict separation between Subscription Entitlements, User Roles, and Resource Permissions.
            </span>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="text-xs font-bold text-zinc-700 hover:text-zinc-900 cursor-pointer self-end sm:self-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
