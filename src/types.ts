export type ScreenId =
  | 'screen-01' // Pan-African Operations Center (Agency Command)
  | 'screen-02' // Agency Operations & Field Dispatch Command (Live Operations)
  | 'screen-03' // Executive Mode / Board Deck (Safaricom Blitz)
  | 'screen-04' // Customer Live Tracker (Client View)
  | 'screen-05' // Field Operative OS (Babatunde Handheld Mobile)
  | 'screen-06' // Cross-Border Settlement & Milestone Escrow (Finance & Treasury)
  | 'screen-07' // Media Owner Asset & Yield Command (Concessionaire Portal)
  | 'screen-08' // Platform Admin & Governance (Platform Admin)
  | 'screen-09'; // Contractor & Mounting Operations (Vendor Operations)

export type UserRole =
  | 'Agency Admin'
  | 'Account Manager'
  | 'Campaign Manager'
  | 'Operations Manager'
  | 'Finance Manager'
  | 'Field Manager'
  | 'Agency Staff'
  | 'Customer / Client Company'
  | 'Media Owner'
  | 'Vendor'
  | 'Field Agent'
  | 'Platform Admin';

export interface TenantAccount {
  id: string;
  name: string;
  type: string;
  status?: string;
  licenseNumber?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface SignupParams {
  name: string;
  email: string;
  password?: string;
  organization: string;
  role: UserRole;
  title?: string;
  city?: string;
  country?: string;
  licenseNumber?: string;
  phone?: string;
  invitationToken?: string;
}

export interface SignupResult {
  success: boolean;
  pendingApproval?: boolean;
  message?: string;
  user?: UserAccount;
  redirectTo?: string;
  error?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl: string;
  title: string;
  permissions: string[];
  authorizedDashboard: string;
  tenantId?: string | null;
  tenant?: TenantAccount | null;
  status?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
}

export type MetroCode = 'LOS' | 'ABJ' | 'PHC' | 'IBD' | 'KAN' | 'ENU' | 'BEN' | 'NBO' | 'JNB' | 'ACC' | 'KGL' | 'ADD';

export interface MetroInfo {
  code: MetroCode;
  name: string;
  country: string;
  sitesCount: number;
  crewsCount: number;
  complianceRate: number;
  currency: string;
  currencySymbol: string;
}

export interface BillboardAsset {
  id: string;
  name: string;
  metro: MetroCode;
  metroName: string;
  location: string;
  corridor: string;
  format: 'Digital LED' | 'Iconic 3D LED' | 'Static Unipole' | 'Gantry Monolith' | 'Overhead Dual DOOH' | 'Static Wallscape' | string;
  status: 'Live & Verified' | 'Active DOOH' | 'Live Loop' | 'Audited' | 'Mounting Today' | 'Alert' | 'Pending PoP' | string;
  client: string;
  brand: string;
  flightId: string;
  flightName?: string;
  sensorSignal?: string;
  fps?: number;
  lux?: number;
  playsCount?: string;
  dailyReach?: string;
  illumination?: string;
  fieldCrew?: string;
  lat: number;
  lng: number;
  previewUrl: string;
  nightUrl?: string;
  matchScore?: number;
  rate?: string;
  resolution?: string;
  screenHealth?: string;
}

export interface MediaOwnerContact {
  companyName: string;
  tradingName?: string;
  licenseNumber: string;
  headquartersAddress: string;
  regionalDepotAddress?: string;
  contactPerson: string;
  contactRole: string;
  phoneDirect: string;
  phoneOperations: string;
  emailDirect: string;
  emailBookings: string;
  website: string;
  operatingHours: string;
  emergencySLA: string;
  verifiedStatus: string;
  activeSitesCount: number;
}

export interface MarketplaceBillboard extends BillboardAsset {
  priceMonthlyUSD: number;
  priceDailyUSD: number;
  priceTwoWeeksNGN?: number;
  sizeMeters?: string;
  dimensions: string;
  availabilityStatus: 'Available Now' | 'Next 14 Days' | 'Q4 Booking' | 'Booked (Waitlist)' | string;
  audienceType: 'High-Income Commuters' | 'Tech & Fintech Pros' | 'Transit & Airport' | 'FMCG Shoppers' | 'Youth & University' | string;
  campaignObjective: 'Brand Awareness' | 'Product Launch' | 'Tactical Sales' | 'Market Dominance' | string;
  dailyTrafficVehicles: number;
  dwellTimeSeconds: number;
  mediaOwnerCompany: string;
  companyContact?: MediaOwnerContact;
  description: string;
  lightingType: 'Active LED Display' | 'Solar High-Lumen Backlit' | 'Prismatic LED Array' | string;
  specsList: string[];
  profileCompleteness?: number;
  missingFields?: string[];
  lastImportedAt?: string;
  importSource?: string;
  isProtectedBooking?: boolean;
  protectedReason?: string;
}

export interface SignupParams {
  name: string;
  email: string;
  organization: string;
  role: UserRole;
  title?: string;
  licenseNumber?: string;
  city?: string;
  password?: string;
}

export interface FieldAgent {
  id: string;
  name: string;
  role: string;
  metro: string;
  corridor: string;
  avatar: string;
  status: 'On-Site' | 'In Transit' | 'Verified / Standby' | 'En-Route';
  eta?: string;
  connectivity: string;
  battery: number;
  auditsCount: number;
  assignedSiteId: string;
  assignedSiteName: string;
  clientFlight: string;
  deviceTelemetry: string;
}

export interface VerificationItem {
  id: string;
  siteId: string;
  siteName: string;
  flightRef: string;
  agent: string;
  timestamp: string;
  gpsCoords: string;
  matchPercent: number;
  lineOfSight: string;
  illuminationLux: number;
  deadPixels: number;
  creativeFilename: string;
  imageUrl: string;
  baselineUrl?: string;
  status: 'Pending' | 'Approved' | 'Retake Requested';
  priority: number;
}

export interface EscrowSettlement {
  id: string;
  counterparty: string;
  role: string;
  flightRef: string;
  flightName: string;
  corridor: string;
  metro: string;
  grossAmountUSD: number;
  localCurrencyAmount: string;
  popCompliance: 'AI PoP Certified' | 'Pending Lux Test' | 'Mounting Audited';
  whtPercent: number;
  whtTaxUSD: number;
  whtAuthority: string;
  payoutState: 'Ready to Release' | 'Held in Escrow' | 'Cleared (Flight Completed)';
  checked?: boolean;
}

export interface MediaOwnerRFQ {
  id: string;
  campaign?: string;
  brand?: string;
  agency: string;
  campaignName?: string;
  siteRequested?: string;
  dates?: string;
  offerAmount?: string;
  shareOfVoice?: string;
  amountUSD?: number;
  duration?: string;
  monoliths?: string;
  city?: string;
  availability?: string;
  expiresIn?: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Urgent Action';
}

export interface JobWorkOrder {
  id: string;
  title?: string;
  code?: string;
  client?: string;
  agency?: string;
  brand?: string;
  campaignFlight?: string;
  siteLocation?: string;
  location?: string;
  dimensions: string;
  material?: string;
  specs?: string;
  crew?: string;
  deadline?: string;
  stage?: string;
  tag?: string;
  assignee?: string;
  eta?: string;
  rush?: boolean;
  progress?: number;
  score?: number;
  status?: 'Printing' | 'Mounting' | 'Quality QA' | 'Completed';
}

export type JobLifecycleStep =
  | 'Scheduled'
  | 'Assigned'
  | 'Agent En Route'
  | 'Agent Arrived'
  | 'Installation Started'
  | 'Installation Completed'
  | 'Evidence Submitted'
  | 'AI Verification'
  | 'Agency Review'
  | 'Client Verification'
  | 'Completed';

export interface RealtimeJobEvent {
  id: string;
  jobId: string;
  siteId: string;
  siteName: string;
  campaignName: string;
  step: JobLifecycleStep;
  timestamp: string;
  agentName: string;
  description: string;
  evidenceUrl?: string;
  statusTone: 'info' | 'success' | 'warning' | 'alert';
}

export interface ClientBillboardPin {
  id: string;
  name: string;
  location: string;
  corridor: string;
  city: string;
  lat: number;
  lng: number;
  status: 'live' | 'progress' | 'scheduled' | 'issue' | 'offline';
  statusLabel: string;
  imageUrl: string;
  campaign: string;
  agency: string;
  currentStep: JobLifecycleStep;
  assignedAgent?: string;
  latestEvidence?: string;
  gpsVerification: string;
  timestamp: string;
  verificationResult: string;
  issueHistory?: string;
  jobTimeline: {
    step: JobLifecycleStep;
    time: string;
    completed: boolean;
  }[];
  specDimensions: string;
  luxScore: number;
}
