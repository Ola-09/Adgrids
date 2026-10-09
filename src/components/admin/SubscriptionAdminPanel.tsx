import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  RefreshCw,
  Clock,
  DollarSign,
  Lock,
  Unlock,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useEntitlements } from '../../context/EntitlementContext';
import { ENTITLEMENT_CATALOG, getTierName } from '../../utils/entitlementCatalog';
import { EntitlementKey, SubscriptionPlan } from '../../types/entitlements';

export const SubscriptionAdminPanel: React.FC = () => {
  const { plans, updatePlanConfig, refetchSubscription } = useEntitlements();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[1]?.id || 'plan_professional');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleEntitlement = async (key: EntitlementKey) => {
    if (!activePlan) return;
    const currentVal = Boolean(activePlan.entitlements[key]);
    const nextVal = !currentVal;

    const updatedEntitlements = {
      ...activePlan.entitlements,
      [key]: nextVal,
    };

    setSaving(true);
    try {
      await updatePlanConfig(activePlan.id, {
        entitlements: updatedEntitlements,
      });
      showToast(`Entitlement '${ENTITLEMENT_CATALOG[key]?.name || key}' set to ${nextVal ? 'ENABLED' : 'DISABLED'} for ${activePlan.name}.`);
    } finally {
      setSaving(false);
    }
  };

  const handlePriceChange = async (type: 'monthly' | 'annual', val: number) => {
    if (!activePlan) return;
    await updatePlanConfig(activePlan.id, {
      [type === 'monthly' ? 'priceMonthlyUSD' : 'priceAnnualUSD']: val,
    });
    showToast(`Updated ${type} price for ${activePlan.name}.`);
  };

  const handleLimitChange = async (limitKey: string, val: number) => {
    if (!activePlan) return;
    const updatedLimits = {
      ...activePlan.limits,
      [limitKey]: val,
    };
    await updatePlanConfig(activePlan.id, { limits: updatedLimits });
    showToast(`Updated limits for ${activePlan.name}.`);
  };

  const handleToggleActive = async () => {
    if (!activePlan) return;
    const nextState = !activePlan.isActive;
    await updatePlanConfig(activePlan.id, { isActive: nextState });
    showToast(`Plan availability set to ${nextState ? 'ACTIVE' : 'INACTIVE'}.`);
  };

  // Group catalog items by category
  const categories: Record<string, EntitlementKey[]> = {};
  (Object.keys(ENTITLEMENT_CATALOG) as EntitlementKey[]).forEach((key) => {
    const item = ENTITLEMENT_CATALOG[key];
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(key);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181716] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Subscription & Feature-Entitlement Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Database Configured
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
            Centrally manage tiers, rate cards, limits, and granular OOH intelligence feature flags without requiring code redeployments.
          </p>
        </div>

        <button
          onClick={refetchSubscription}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-bold text-zinc-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* Plan Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#181716] text-white border-[#181716] shadow-sm'
                  : 'bg-white text-zinc-700 border-[#eae7e1] hover:border-zinc-300'
              }`}
            >
              <span>{p.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                ${p.priceMonthlyUSD}/mo
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Plan Details & Limits Card */}
      <div className="bg-white rounded-3xl border border-[#eae7e1] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#eae7e1]">
          <div>
            <h2 className="text-lg font-black text-[#181716] flex items-center gap-2">
              <span>{activePlan.name} Settings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activePlan.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {activePlan.isActive ? 'Active Plan' : 'Disabled'}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">{activePlan.tagline}</p>
          </div>

          <button
            onClick={handleToggleActive}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activePlan.isActive
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {activePlan.isActive ? 'Disable Plan Availability' : 'Activate Plan Availability'}
          </button>
        </div>

        {/* Pricing & Trial Config */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <label className="text-[10px] font-extrabold uppercase text-zinc-400 block mb-1">
              Monthly Rate (USD)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-zinc-400">$</span>
              <input
                type="number"
                value={activePlan.priceMonthlyUSD}
                onChange={(e) => handlePriceChange('monthly', Number(e.target.value))}
                className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-[#eae7e1] text-xs font-black text-[#181716]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <label className="text-[10px] font-extrabold uppercase text-zinc-400 block mb-1">
              Annual Rate (USD)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-zinc-400">$</span>
              <input
                type="number"
                value={activePlan.priceAnnualUSD}
                onChange={(e) => handlePriceChange('annual', Number(e.target.value))}
                className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-[#eae7e1] text-xs font-black text-[#181716]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <label className="text-[10px] font-extrabold uppercase text-zinc-400 block mb-1">
              Max Active Campaigns
            </label>
            <input
              type="number"
              value={activePlan.limits.maxActiveCampaigns}
              onChange={(e) => handleLimitChange('maxActiveCampaigns', Number(e.target.value))}
              placeholder="-1 for unlimited"
              className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-[#eae7e1] text-xs font-black text-[#181716]"
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">-1 = Unlimited</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eae7e1]">
            <label className="text-[10px] font-extrabold uppercase text-zinc-400 block mb-1">
              Team Seats Limit
            </label>
            <input
              type="number"
              value={activePlan.limits.maxTeamSeats}
              onChange={(e) => handleLimitChange('maxTeamSeats', Number(e.target.value))}
              placeholder="-1 for unlimited"
              className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-[#eae7e1] text-xs font-black text-[#181716]"
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">-1 = Unlimited</span>
          </div>
        </div>

        {/* Feature Entitlements Matrix */}
        <div className="space-y-6 pt-4 border-t border-[#eae7e1]">
          <div>
            <h3 className="text-sm font-black text-[#181716]">
              Feature Entitlements Matrix ({activePlan.name})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Toggle specific features on or off. Changes take effect across client workspaces instantly.
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(categories).map(([category, keys]) => (
              <div key={category} className="space-y-2.5">
                <div className="text-xs font-extrabold text-[#ef5a24] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{category}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {keys.map((key) => {
                    const def = ENTITLEMENT_CATALOG[key];
                    const isEnabled = Boolean(activePlan.entitlements[key]);

                    return (
                      <div
                        key={key}
                        onClick={() => handleToggleEntitlement(key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isEnabled
                            ? 'bg-[#fffaf8] border-[#ef5a24]/30 hover:border-[#ef5a24]'
                            : 'bg-[#faf9f6] border-zinc-200 hover:border-zinc-300 opacity-70'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#181716]">
                              {def?.name || key}
                            </span>
                            {def?.isFutureFeature && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[9px] font-extrabold">
                                Future Ready
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-snug">
                            {def?.description}
                          </p>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            key: {key}
                          </div>
                        </div>

                        <div className="pt-0.5">
                          <div
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                              isEnabled ? 'bg-[#ef5a24]' : 'bg-zinc-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                isEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
