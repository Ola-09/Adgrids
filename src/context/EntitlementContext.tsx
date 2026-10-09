import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  AccessCheckResult,
  BillingInterval,
  EntitlementKey,
  PlanTier,
  SubscriptionPlan,
  TenantSubscriptionState,
} from '../types/entitlements';
import {
  DEFAULT_SUBSCRIPTION_PLANS,
  ENTITLEMENT_CATALOG,
  TIER_RANK,
} from '../utils/entitlementCatalog';

interface EntitlementContextType {
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan;
  subscriptionState: TenantSubscriptionState;
  loading: boolean;
  hasEntitlement: (key: EntitlementKey) => boolean;
  checkAccess: (
    key: EntitlementKey,
    requiredRolePermission?: string
  ) => AccessCheckResult;
  changePlan: (planId: string, interval?: BillingInterval) => Promise<boolean>;
  updatePlanConfig: (
    planId: string,
    updates: Partial<SubscriptionPlan>
  ) => Promise<boolean>;
  saveWhiteLabelConfig: (config: {
    agencyLogoUrl?: string;
    clientLogoUrl?: string;
    primaryBrandColor?: string;
    accentBrandColor?: string;
    customReportFooter?: string;
    hideAdgridWatermark: boolean;
  }) => Promise<boolean>;
  isUpgradeModalOpen: boolean;
  activeUpgradeKey: EntitlementKey | null;
  openUpgradeModal: (featureKey?: EntitlementKey) => void;
  closeUpgradeModal: () => void;
  refetchSubscription: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_SUB_KEY = 'adgrid_tenant_subscription_v1';
const LOCAL_STORAGE_PLANS_KEY = 'adgrid_subscription_plans_v1';

export const EntitlementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SUBSCRIPTION_PLANS;
  });

  const [subscriptionState, setSubscriptionState] =
    useState<TenantSubscriptionState>(() => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_SUB_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
      return {
        tenantId: 'tenant-default',
        tenantName: 'Optimum Exposures Ltd',
        planId: 'plan_professional',
        planTier: 'professional',
        status: 'active',
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        whiteLabelConfig: {
          agencyLogoUrl:
            'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80',
          clientLogoUrl: '',
          primaryBrandColor: '#ef5a24',
          accentBrandColor: '#181716',
          customReportFooter:
            'Confidential Pan-African Billboard Flight Recapitulation',
          hideAdgridWatermark: false,
        },
      };
    });

  const [loading, setLoading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeUpgradeKey, setActiveUpgradeKey] =
    useState<EntitlementKey | null>(null);

  // Sync with backend API
  const refetchSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('adgrid_access_token');
      if (!token) return;

      const [resPlans, resCurrent] = await Promise.all([
        fetch('/api/subscriptions/plans', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscriptions/current', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resPlans.ok) {
        const plansData = await resPlans.json();
        if (plansData.success && Array.isArray(plansData.plans)) {
          setPlans(plansData.plans);
          localStorage.setItem(
            LOCAL_STORAGE_PLANS_KEY,
            JSON.stringify(plansData.plans)
          );
        }
      }

      if (resCurrent.ok) {
        const curData = await resCurrent.json();
        if (curData.success && curData.subscription) {
          setSubscriptionState(curData.subscription);
          localStorage.setItem(
            LOCAL_STORAGE_SUB_KEY,
            JSON.stringify(curData.subscription)
          );
        }
      }
    } catch {
      // Fallback on local cache
    }
  }, []);

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription, currentUser?.id]);

  // Current plan object
  const currentPlan =
    plans.find((p) => p.id === subscriptionState.planId) ||
    plans.find((p) => p.tier === subscriptionState.planTier) ||
    plans[1] ||
    DEFAULT_SUBSCRIPTION_PLANS[1];

  /**
   * Evaluates if current workspace has entitlement key enabled
   */
  const hasEntitlement = useCallback(
    (key: EntitlementKey): boolean => {
      // 1. Check custom tenant overrides first
      if (subscriptionState.customEntitlementOverrides?.[key] !== undefined) {
        return Boolean(subscriptionState.customEntitlementOverrides[key]);
      }

      // 2. Check plan entitlements
      if (currentPlan.entitlements?.[key] !== undefined) {
        return Boolean(currentPlan.entitlements[key]);
      }

      // 3. Fallback to catalog minimum required tier comparison
      const def = ENTITLEMENT_CATALOG[key];
      if (!def) return false;
      const currentRank = TIER_RANK[currentPlan.tier] || 1;
      const requiredRank = TIER_RANK[def.requiredTier] || 1;
      return currentRank >= requiredRank;
    },
    [currentPlan, subscriptionState]
  );

  /**
   * Enforces the golden rule:
   * ACCESS = SUBSCRIPTION ENTITLEMENT + USER ROLE + RESOURCE PERMISSION
   */
  const checkAccess = useCallback(
    (
      key: EntitlementKey,
      requiredRolePermission?: string
    ): AccessCheckResult => {
      const def = ENTITLEMENT_CATALOG[key];

      // Step 1: Check Subscription Entitlement
      const hasPlanEntitlement = hasEntitlement(key);
      if (!hasPlanEntitlement) {
        return {
          allowed: false,
          missingEntitlement: key,
          upgradeRequiredPlan: def?.requiredTier || 'professional',
          reason: `Requires ${def?.name || 'feature'} unlocked on ${
            def?.requiredTier === 'enterprise' ? 'Enterprise' : 'Professional'
          } plan.`,
        };
      }

      // Step 2: Check User Role / Resource Permission if specified
      if (requiredRolePermission && currentUser) {
        const hasPermission =
          currentUser.permissions?.includes(requiredRolePermission) ||
          currentUser.permissions?.includes('ALL') ||
          currentUser.role === 'Platform Admin';

        if (!hasPermission) {
          return {
            allowed: false,
            missingRolePermission: requiredRolePermission,
            reason: `Your user role (${currentUser.role}) does not have permission '${requiredRolePermission}'.`,
          };
        }
      }

      return { allowed: true };
    },
    [currentUser, hasEntitlement]
  );

  // Upgrade or switch plan
  const changePlan = async (
    planId: string,
    interval: BillingInterval = 'monthly'
  ): Promise<boolean> => {
    try {
      const targetPlan = plans.find((p) => p.id === planId);
      if (!targetPlan) return false;

      const token = localStorage.getItem('adgrid_access_token');
      if (token) {
        const res = await fetch('/api/subscriptions/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId, billingInterval: interval }),
        });
        const data = await res.json();
        if (data.success && data.subscription) {
          setSubscriptionState(data.subscription);
          localStorage.setItem(
            LOCAL_STORAGE_SUB_KEY,
            JSON.stringify(data.subscription)
          );
          setIsUpgradeModalOpen(false);
          return true;
        }
      }

      // Local fallback
      const updatedSub: TenantSubscriptionState = {
        ...subscriptionState,
        planId: targetPlan.id,
        planTier: targetPlan.tier,
        status: 'active',
        currentPeriodEnd: new Date(
          Date.now() + (interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
      setSubscriptionState(updatedSub);
      localStorage.setItem(
        LOCAL_STORAGE_SUB_KEY,
        JSON.stringify(updatedSub)
      );
      setIsUpgradeModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error changing plan:', err);
      return false;
    }
  };

  // Update plan configuration (Admin feature)
  const updatePlanConfig = async (
    planId: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adgrid_access_token');
      if (token) {
        await fetch(`/api/subscriptions/plans/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });
      }

      // Update in state and local storage
      const newPlans = plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              ...updates,
              limits: { ...p.limits, ...(updates.limits || {}) },
              entitlements: {
                ...p.entitlements,
                ...(updates.entitlements || {}),
              },
            }
          : p
      );
      setPlans(newPlans);
      localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(newPlans));
      return true;
    } catch {
      return false;
    }
  };

  // Save White-Label configuration
  const saveWhiteLabelConfig = async (config: {
    agencyLogoUrl?: string;
    clientLogoUrl?: string;
    primaryBrandColor?: string;
    accentBrandColor?: string;
    customReportFooter?: string;
    hideAdgridWatermark: boolean;
  }): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adgrid_access_token');
      if (token) {
        const res = await fetch('/api/subscriptions/whitelabel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(config),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error);
        }
      }

      const updatedSub: TenantSubscriptionState = {
        ...subscriptionState,
        whiteLabelConfig: {
          ...subscriptionState.whiteLabelConfig,
          ...config,
        },
      };
      setSubscriptionState(updatedSub);
      localStorage.setItem(
        LOCAL_STORAGE_SUB_KEY,
        JSON.stringify(updatedSub)
      );
      return true;
    } catch (err) {
      console.error('Error saving white label config:', err);
      return false;
    }
  };

  const openUpgradeModal = (featureKey?: EntitlementKey) => {
    setActiveUpgradeKey(featureKey || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setActiveUpgradeKey(null);
  };

  return (
    <EntitlementContext.Provider
      value={{
        plans,
        currentPlan,
        subscriptionState,
        loading,
        hasEntitlement,
        checkAccess,
        changePlan,
        updatePlanConfig,
        saveWhiteLabelConfig,
        isUpgradeModalOpen,
        activeUpgradeKey,
        openUpgradeModal,
        closeUpgradeModal,
        refetchSubscription,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
};

export const useEntitlements = () => {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error(
      'useEntitlements must be used within an EntitlementProvider'
    );
  }
  return context;
};
