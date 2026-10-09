/**
 * Centralized Entitlement & Subscription Types for Adgrid
 * Supporting the Guiding Formula:
 * ACCESS = SUBSCRIPTION ENTITLEMENT + USER ROLE + RESOURCE PERMISSION
 */

export type EntitlementKey =
  | 'can_search_inventory'
  | 'can_book_inventory'
  | 'can_view_basic_billboard_data'
  | 'can_view_traffic_data'
  | 'can_view_foot_traffic'
  | 'can_view_vehicle_traffic'
  | 'can_view_location_intelligence'
  | 'can_view_360'
  | 'can_view_video'
  | 'can_compare_billboards'
  | 'can_view_campaign_analytics'
  | 'can_download_reports'
  | 'can_schedule_reports'
  | 'can_view_live_verification'
  | 'can_access_advanced_verification'
  | 'can_create_multiple_campaigns'
  | 'can_manage_multiple_clients'
  | 'can_use_white_label_reports'
  | 'can_access_api'
  | 'can_access_advanced_media_planning'
  | 'can_access_custom_reporting'
  // Future-proofing extensible keys
  | 'can_view_audience_heatmaps'
  | 'can_use_ai_recommendations'
  | 'can_predict_traffic'
  | 'can_access_competitive_intel';

export type PlanTier = 'starter' | 'professional' | 'enterprise' | 'custom';

export type BillingInterval = 'monthly' | 'annual';

export interface EntitlementDefinition {
  key: EntitlementKey;
  name: string;
  category: 'Discovery & Booking' | 'Intelligence & Traffic' | 'Media & Immersive' | 'Verification & Audit' | 'Reporting & White-Label' | 'Enterprise & Scale';
  description: string;
  whyUseful: string;
  requiredTier: PlanTier;
  iconName: string;
  isFutureFeature?: boolean;
}

export interface SubscriptionLimits {
  maxActiveCampaigns: number; // e.g. 1 for starter, 15 for pro, -1 (unlimited) for enterprise
  maxTeamSeats: number;
  maxClientWorkspaces: number;
  maxMonthlyReportExports: number;
  apiCallsPerDay: number;
}

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  priceMonthlyUSD: number;
  priceAnnualUSD: number;
  billingInterval: BillingInterval;
  isPopular?: boolean;
  trialDays: number;
  isActive: boolean;
  limits: SubscriptionLimits;
  entitlements: Record<EntitlementKey, boolean>;
}

export interface TenantSubscriptionState {
  tenantId: string;
  tenantName: string;
  planId: string;
  planTier: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  customEntitlementOverrides?: Partial<Record<EntitlementKey, boolean>>;
  whiteLabelConfig?: {
    agencyLogoUrl?: string;
    clientLogoUrl?: string;
    primaryBrandColor?: string;
    accentBrandColor?: string;
    customReportFooter?: string;
    hideAdgridWatermark: boolean;
  };
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  missingEntitlement?: EntitlementKey;
  missingRolePermission?: string;
  upgradeRequiredPlan?: PlanTier;
}
