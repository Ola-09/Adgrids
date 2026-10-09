import { Request, Response, Router } from 'express';
import { prisma } from './db';
import { requireAuth, requireRole } from './middleware';
import { recordAuditLog } from './auth';

export const subscriptionsRouter = Router();

// In-memory or database-backed plan registry for fast dynamic updates without redeployment
let cachedPlans = [
  {
    id: 'plan_starter',
    tier: 'starter',
    name: 'Starter Plan',
    tagline: 'Essential billboard discovery, verified booking, and core campaign execution.',
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    billingInterval: 'monthly',
    trialDays: 0,
    isActive: true,
    limits: {
      maxActiveCampaigns: 1,
      maxTeamSeats: 2,
      maxClientWorkspaces: 1,
      maxMonthlyReportExports: 5,
      apiCallsPerDay: 0,
    },
    entitlements: {
      can_search_inventory: true,
      can_book_inventory: true,
      can_view_basic_billboard_data: true,
      can_view_traffic_data: false,
      can_view_foot_traffic: false,
      can_view_vehicle_traffic: false,
      can_view_location_intelligence: false,
      can_view_360: false,
      can_view_video: false,
      can_compare_billboards: false,
      can_view_campaign_analytics: false,
      can_download_reports: false,
      can_schedule_reports: false,
      can_view_live_verification: false,
      can_access_advanced_verification: false,
      can_create_multiple_campaigns: false,
      can_manage_multiple_clients: false,
      can_use_white_label_reports: false,
      can_access_api: false,
      can_access_advanced_media_planning: false,
      can_access_custom_reporting: false,
      can_view_audience_heatmaps: false,
      can_use_ai_recommendations: false,
      can_predict_traffic: false,
      can_access_competitive_intel: false,
    },
  },
  {
    id: 'plan_professional',
    tier: 'professional',
    name: 'Professional Plan',
    tagline: 'Complete OOH intelligence: 360° views, traffic telemetry, comparisons & live PoP audits.',
    priceMonthlyUSD: 490,
    priceAnnualUSD: 4700,
    billingInterval: 'monthly',
    isPopular: true,
    trialDays: 14,
    isActive: true,
    limits: {
      maxActiveCampaigns: 15,
      maxTeamSeats: 10,
      maxClientWorkspaces: 10,
      maxMonthlyReportExports: 100,
      apiCallsPerDay: 500,
    },
    entitlements: {
      can_search_inventory: true,
      can_book_inventory: true,
      can_view_basic_billboard_data: true,
      can_view_traffic_data: true,
      can_view_foot_traffic: true,
      can_view_vehicle_traffic: true,
      can_view_location_intelligence: true,
      can_view_360: true,
      can_view_video: true,
      can_compare_billboards: true,
      can_view_campaign_analytics: true,
      can_download_reports: true,
      can_schedule_reports: true,
      can_view_live_verification: true,
      can_access_advanced_verification: false,
      can_create_multiple_campaigns: true,
      can_manage_multiple_clients: true,
      can_use_white_label_reports: false,
      can_access_api: false,
      can_access_advanced_media_planning: false,
      can_access_custom_reporting: false,
      can_view_audience_heatmaps: false,
      can_use_ai_recommendations: false,
      can_predict_traffic: false,
      can_access_competitive_intel: false,
    },
  },
  {
    id: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Enterprise Plan',
    tagline: 'Unlimited scale: White-label client reporting, custom APIs, advanced verification & multi-agency command.',
    priceMonthlyUSD: 1490,
    priceAnnualUSD: 14200,
    billingInterval: 'monthly',
    trialDays: 30,
    isActive: true,
    limits: {
      maxActiveCampaigns: -1,
      maxTeamSeats: -1,
      maxClientWorkspaces: -1,
      maxMonthlyReportExports: -1,
      apiCallsPerDay: 50000,
    },
    entitlements: {
      can_search_inventory: true,
      can_book_inventory: true,
      can_view_basic_billboard_data: true,
      can_view_traffic_data: true,
      can_view_foot_traffic: true,
      can_view_vehicle_traffic: true,
      can_view_location_intelligence: true,
      can_view_360: true,
      can_view_video: true,
      can_compare_billboards: true,
      can_view_campaign_analytics: true,
      can_download_reports: true,
      can_schedule_reports: true,
      can_view_live_verification: true,
      can_access_advanced_verification: true,
      can_create_multiple_campaigns: true,
      can_manage_multiple_clients: true,
      can_use_white_label_reports: true,
      can_access_api: true,
      can_access_advanced_media_planning: true,
      can_access_custom_reporting: true,
      can_view_audience_heatmaps: true,
      can_use_ai_recommendations: true,
      can_predict_traffic: true,
      can_access_competitive_intel: true,
    },
  },
];

// In-memory tenant subscription states
const tenantSubscriptions: Record<
  string,
  {
    planId: string;
    planTier: string;
    status: string;
    currentPeriodEnd: string;
    customEntitlementOverrides?: Record<string, boolean>;
    whiteLabelConfig?: {
      agencyLogoUrl?: string;
      clientLogoUrl?: string;
      primaryBrandColor?: string;
      accentBrandColor?: string;
      customReportFooter?: string;
      hideAdgridWatermark: boolean;
    };
  }
> = {};

// Helper to get or create tenant subscription
function getTenantSubscription(tenantId: string) {
  if (!tenantSubscriptions[tenantId]) {
    // Default to professional tier so rich features are visible by default in demo/eval
    tenantSubscriptions[tenantId] = {
      planId: 'plan_professional',
      planTier: 'professional',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      whiteLabelConfig: {
        agencyLogoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80',
        primaryBrandColor: '#ef5a24',
        accentBrandColor: '#181716',
        customReportFooter: 'Confidential & Proprietary Client Flight Recapitulation',
        hideAdgridWatermark: false,
      },
    };
  }
  return tenantSubscriptions[tenantId];
}

// 1. Get all subscription plans
subscriptionsRouter.get('/plans', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    plans: cachedPlans,
  });
});

// 2. Update an existing plan (Admin Configuration)
subscriptionsRouter.put(
  '/plans/:planId',
  requireAuth,
  requireRole(['Platform Admin', 'Agency Admin']),
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const updates = req.body;

      const idx = cachedPlans.findIndex((p) => p.id === planId);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Plan not found.' });
      }

      cachedPlans[idx] = {
        ...cachedPlans[idx],
        ...updates,
        limits: {
          ...cachedPlans[idx].limits,
          ...(updates.limits || {}),
        },
        entitlements: {
          ...cachedPlans[idx].entitlements,
          ...(updates.entitlements || {}),
        },
      };

      await recordAuditLog({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        tenantId: req.user!.tenantId,
        action: 'SUBSCRIPTION_PLAN_UPDATED',
        entity: 'SubscriptionPlan',
        entityId: planId,
        metadata: { updates },
        req,
      });

      return res.json({
        success: true,
        plan: cachedPlans[idx],
        message: `Plan ${cachedPlans[idx].name} configuration updated successfully.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 3. Get current tenant's subscription state & effective entitlements
subscriptionsRouter.get('/current', requireAuth, (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId || 'default-tenant';
    const sub = getTenantSubscription(tenantId);
    const plan = cachedPlans.find((p) => p.id === sub.planId) || cachedPlans[1];

    // Calculate effective entitlements: plan entitlements + custom tenant overrides
    const effectiveEntitlements = {
      ...plan.entitlements,
      ...(sub.customEntitlementOverrides || {}),
    };

    return res.json({
      success: true,
      subscription: {
        tenantId,
        planId: sub.planId,
        planTier: sub.planTier,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        plan,
        effectiveEntitlements,
        whiteLabelConfig: sub.whiteLabelConfig,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Upgrade / switch subscription tier
subscriptionsRouter.post('/upgrade', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId || 'default-tenant';
    const { planId, billingInterval } = req.body;

    const targetPlan = cachedPlans.find((p) => p.id === planId);
    if (!targetPlan) {
      return res.status(400).json({ success: false, error: 'Invalid subscription plan selected.' });
    }

    const currentSub = getTenantSubscription(tenantId);
    const previousPlanId = currentSub.planId;

    currentSub.planId = targetPlan.id;
    currentSub.planTier = targetPlan.tier;
    currentSub.status = 'active';
    currentSub.currentPeriodEnd = new Date(
      Date.now() + (billingInterval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    await recordAuditLog({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      tenantId,
      action: 'TENANT_SUBSCRIPTION_UPGRADED',
      entity: 'TenantSubscription',
      entityId: tenantId,
      metadata: {
        fromPlan: previousPlanId,
        toPlan: targetPlan.id,
        tier: targetPlan.tier,
      },
      req,
    });

    const effectiveEntitlements = {
      ...targetPlan.entitlements,
      ...(currentSub.customEntitlementOverrides || {}),
    };

    return res.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan.name}!`,
      subscription: {
        tenantId,
        planId: targetPlan.id,
        planTier: targetPlan.tier,
        status: currentSub.status,
        currentPeriodEnd: currentSub.currentPeriodEnd,
        plan: targetPlan,
        effectiveEntitlements,
        whiteLabelConfig: currentSub.whiteLabelConfig,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update White-Label Config (Enterprise Only)
subscriptionsRouter.post('/whitelabel', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId || 'default-tenant';
    const sub = getTenantSubscription(tenantId);
    const plan = cachedPlans.find((p) => p.id === sub.planId);

    // Enforce Guiding Rule: ACCESS = SUBSCRIPTION ENTITLEMENT + USER ROLE
    const hasEntitlement =
      Boolean(plan?.entitlements.can_use_white_label_reports) ||
      Boolean(sub.customEntitlementOverrides?.can_use_white_label_reports);

    if (!hasEntitlement) {
      return res.status(403).json({
        success: false,
        error: 'White-label reporting is an Enterprise tier feature. Please upgrade your subscription to enable.',
        requiredTier: 'enterprise',
      });
    }

    const {
      agencyLogoUrl,
      clientLogoUrl,
      primaryBrandColor,
      accentBrandColor,
      customReportFooter,
      hideAdgridWatermark,
    } = req.body;

    sub.whiteLabelConfig = {
      agencyLogoUrl: agencyLogoUrl || sub.whiteLabelConfig?.agencyLogoUrl,
      clientLogoUrl: clientLogoUrl || sub.whiteLabelConfig?.clientLogoUrl,
      primaryBrandColor: primaryBrandColor || sub.whiteLabelConfig?.primaryBrandColor || '#ef5a24',
      accentBrandColor: accentBrandColor || sub.whiteLabelConfig?.accentBrandColor || '#181716',
      customReportFooter: customReportFooter || sub.whiteLabelConfig?.customReportFooter,
      hideAdgridWatermark: Boolean(hideAdgridWatermark),
    };

    await recordAuditLog({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      tenantId,
      action: 'WHITE_LABEL_CONFIG_UPDATED',
      entity: 'WhiteLabelSettings',
      entityId: tenantId,
      metadata: sub.whiteLabelConfig,
      req,
    });

    return res.json({
      success: true,
      message: 'White-label reporting preferences saved.',
      whiteLabelConfig: sub.whiteLabelConfig,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
