import bcrypt from 'bcryptjs';
import { prisma } from '../server/db';
import { ROLE_DEFAULT_PERMISSIONS } from '../server/auth';

const SEED_PASSWORD_PLAIN = 'AdGrid2026!';

const TENANTS_SEED = [
  {
    id: 'tenant-agency-afrireach',
    name: 'AfriReach Pan-African Media Group',
    type: 'AGENCY',
    licenseNumber: 'APCON/2024/CORP-091',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    id: 'tenant-client-safaricom',
    name: 'Safaricom PLC (Brand Operations)',
    type: 'CLIENT',
    licenseNumber: 'CAK/OOH/ADV-8841',
    city: 'Nairobi',
    country: 'Kenya',
  },
  {
    id: 'tenant-media-owner-continental',
    name: 'Continental Outdoor & Alliance Media Concession',
    type: 'MEDIA_OWNER',
    licenseNumber: 'LASAA/OOH/VOL.4/2024-REG',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    id: 'tenant-vendor-arclight',
    name: 'Arclight Fabrication & Grand-Format Printing Ltd',
    type: 'VENDOR',
    licenseNumber: 'FMWH/RIG/2023/T1-042',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    id: 'tenant-field-lagos',
    name: 'Lagos Rapid Audit Unit (Mobile OS)',
    type: 'FIELD_UNIT',
    licenseNumber: 'LASAA/FIELD/INSP-109',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    id: 'tenant-platform-afriooh',
    name: 'ADGRID Governance & Trust Protocol',
    type: 'AGENCY',
    licenseNumber: 'ADGRID-TRUST-ROOT-001',
    city: 'Johannesburg',
    country: 'South Africa',
  },
  {
    id: 'tenant-test-agency',
    name: 'AdGrid Test Agency Alpha',
    type: 'AGENCY',
    licenseNumber: 'TEST-AGENCY-001',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    id: 'tenant-test-client',
    name: 'AdGrid Test Advertiser Beta',
    type: 'CLIENT',
    licenseNumber: 'TEST-CLIENT-002',
    city: 'Nairobi',
    country: 'Kenya',
  },
];

const METROS_SEED = [
  { code: 'LOS', name: 'Lagos', country: 'Nigeria', currency: 'NGN', currencySymbol: '₦', sitesCount: 42, crewsCount: 12, complianceRate: 98.6 },
  { code: 'ABJ', name: 'Abuja', country: 'Nigeria', currency: 'NGN', currencySymbol: '₦', sitesCount: 23, crewsCount: 8, complianceRate: 96.8 },
  { code: 'PHC', name: 'Port Harcourt', country: 'Nigeria', currency: 'NGN', currencySymbol: '₦', sitesCount: 18, crewsCount: 6, complianceRate: 95.1 },
  { code: 'IBD', name: 'Ibadan', country: 'Nigeria', currency: 'NGN', currencySymbol: '₦', sitesCount: 14, crewsCount: 5, complianceRate: 94.4 },
  { code: 'KAN', name: 'Kano', country: 'Nigeria', currency: 'NGN', currencySymbol: '₦', sitesCount: 20, crewsCount: 7, complianceRate: 97.2 },
  { code: 'NBO', name: 'Nairobi', country: 'Kenya', currency: 'KES', currencySymbol: 'KSh', sitesCount: 31, crewsCount: 10, complianceRate: 97.9 },
  { code: 'JNB', name: 'Johannesburg', country: 'South Africa', currency: 'ZAR', currencySymbol: 'R', sitesCount: 26, crewsCount: 9, complianceRate: 96.1 },
  { code: 'ACC', name: 'Accra', country: 'Ghana', currency: 'GHS', currencySymbol: '₵', sitesCount: 17, crewsCount: 6, complianceRate: 95.6 },
  { code: 'KGL', name: 'Kigali', country: 'Rwanda', currency: 'RWF', currencySymbol: 'FRw', sitesCount: 12, crewsCount: 4, complianceRate: 94.8 },
  { code: 'ADD', name: 'Addis Ababa', country: 'Ethiopia', currency: 'ETB', currencySymbol: 'Br', sitesCount: 19, crewsCount: 5, complianceRate: 96.3 },
];

const USERS_SEED = [
  // 1. Mandatory Phase 1 Test Accounts from Specification Section 25
  {
    id: 'usr-test-platform-admin',
    email: 'admin@adgrid.test',
    name: 'Platform Administrator',
    firstName: 'Admin',
    lastName: 'AdGrid',
    role: 'Platform Admin',
    title: 'Platform Chief Infrastructure Architect',
    tenantId: 'tenant-platform-afriooh',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-agency-admin',
    email: 'agency@adgrid.test',
    name: 'Agency Managing Director',
    firstName: 'Agency',
    lastName: 'Admin',
    role: 'Agency Admin',
    title: 'Managing Director & Partner',
    tenantId: 'tenant-test-agency',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-campaign-mgr',
    email: 'campaigns@adgrid.test',
    name: 'Campaign Pacing Lead',
    firstName: 'Campaign',
    lastName: 'Manager',
    role: 'Campaign Manager',
    title: 'Pan-African Traffic & Pacing Director',
    tenantId: 'tenant-test-agency',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-ops-mgr',
    email: 'operations@adgrid.test',
    name: 'Regional Operations Lead',
    firstName: 'Operations',
    lastName: 'Manager',
    role: 'Operations Manager',
    title: 'Regional Logistics Hub Director',
    tenantId: 'tenant-test-agency',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-client',
    email: 'client@adgrid.test',
    name: 'Enterprise Brand Executive',
    firstName: 'Brand',
    lastName: 'Client',
    role: 'Customer / Client Company',
    title: 'Head of Brand Experience & OOH Investments',
    tenantId: 'tenant-test-client',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-mediaowner',
    email: 'mediaowner@adgrid.test',
    name: 'Concessionaire Director',
    firstName: 'Media',
    lastName: 'Owner',
    role: 'Media Owner',
    title: 'Managing Director & Concessionaire',
    tenantId: 'tenant-media-owner-continental',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-vendor',
    email: 'vendor@adgrid.test',
    name: 'Print & Rigging Principal',
    firstName: 'Vendor',
    lastName: 'Contractor',
    role: 'Vendor',
    title: 'Tier-1 Technical Contractor & Print Principal',
    tenantId: 'tenant-vendor-arclight',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-test-fieldagent',
    email: 'fieldagent@adgrid.test',
    name: 'Senior Field Operative',
    firstName: 'Field',
    lastName: 'Agent',
    role: 'Field Agent',
    title: 'Senior Field Operative & Drone Auditor',
    tenantId: 'tenant-field-lagos',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },

  // 2. Existing Demo Seed Accounts (for seamless backwards compatibility with UI Presets)
  {
    id: 'usr-agency-admin',
    email: 'kofi.admin@afrireach.africa',
    name: 'Kofi Mensah',
    firstName: 'Kofi',
    lastName: 'Mensah',
    role: 'Agency Admin',
    title: 'Managing Director & Partner',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-account-mgr',
    email: 'amina.bello@afrireach.africa',
    name: 'Amina Bello',
    firstName: 'Amina',
    lastName: 'Bello',
    role: 'Account Manager',
    title: 'Senior Client Partner (Telco & FMCG)',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-campaign-mgr',
    email: 'chidi.campaigns@afrireach.africa',
    name: 'Chidi Okafor',
    firstName: 'Chidi',
    lastName: 'Okafor',
    role: 'Campaign Manager',
    title: 'Pan-African Traffic & Pacing Director',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-ops-mgr',
    email: 'tendai.ops@afrireach.africa',
    name: 'Tendai Moyo',
    firstName: 'Tendai',
    lastName: 'Moyo',
    role: 'Operations Manager',
    title: 'Regional Field & Rigging Operations Lead',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-finance-mgr',
    email: 'nkosana.treasury@afrireach.africa',
    name: 'Nkosana Dlamini',
    firstName: 'Nkosana',
    lastName: 'Dlamini',
    role: 'Finance Manager',
    title: 'Head of Escrow & Cross-Border Clearing',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-field-mgr',
    email: 'wanjiku.field@afrireach.africa',
    name: 'Wanjiku Kamau',
    firstName: 'Wanjiku',
    lastName: 'Kamau',
    role: 'Field Manager',
    title: 'Chief Verification Auditor (Nairobi Node)',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-agency-staff',
    email: 'david.media@afrireach.africa',
    name: 'David Osei',
    firstName: 'David',
    lastName: 'Osei',
    role: 'Agency Staff',
    title: 'Digital Asset & Schedule Coordinator',
    tenantId: 'tenant-agency-afrireach',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-client-company',
    email: 'fmutasa@safaricom.co.ke',
    name: 'Farai Mutasa',
    firstName: 'Farai',
    lastName: 'Mutasa',
    role: 'Customer / Client Company',
    title: 'Head of Brand Experience & OOH Investments',
    tenantId: 'tenant-client-safaricom',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-media-owner',
    email: 'fadeleke@continentaloutdoor.ng',
    name: 'Folashade Adeleke',
    firstName: 'Folashade',
    lastName: 'Adeleke',
    role: 'Media Owner',
    title: 'Managing Director & Concessionaire',
    tenantId: 'tenant-media-owner-continental',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-vendor',
    email: 'sbakare@arclightmedia.ng',
    name: 'Oluwaseun Bakare',
    firstName: 'Oluwaseun',
    lastName: 'Bakare',
    role: 'Vendor',
    title: 'Tier-1 Technical Contractor & Print Principal',
    tenantId: 'tenant-vendor-arclight',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-field-agent',
    email: 'babatunde.field@afrireach.africa',
    name: 'Babatunde Oladipo',
    firstName: 'Babatunde',
    lastName: 'Oladipo',
    role: 'Field Agent',
    title: 'Senior Field Operative & Drone Auditor',
    tenantId: 'tenant-field-lagos',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'usr-platform-admin',
    email: 'tariro.admin@adgrid.cloud',
    name: 'Dr. Tariro Sithole',
    firstName: 'Tariro',
    lastName: 'Sithole',
    role: 'Platform Admin',
    title: 'Platform Chief Infrastructure Architect',
    tenantId: 'tenant-platform-afriooh',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  },
];

export async function seedDatabase() {
  console.log('Seeding ADGRID production database...');

  // 1. Seed Tenants
  for (const tenant of TENANTS_SEED) {
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      update: { name: tenant.name, type: tenant.type, licenseNumber: tenant.licenseNumber, city: tenant.city, country: tenant.country },
      create: tenant,
    });
  }
  console.log(`✓ Seeded ${TENANTS_SEED.length} organization tenants`);

  // 2. Seed Metros
  for (const metro of METROS_SEED) {
    await prisma.metro.upsert({
      where: { code: metro.code },
      update: metro,
      create: metro,
    });
  }
  console.log(`✓ Seeded ${METROS_SEED.length} African metro corridors`);

  // 3. Seed Role Permissions
  let permissionsCount = 0;
  for (const [role, permissions] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role, permission } },
        update: {},
        create: { role, permission },
      });
      permissionsCount++;
    }
  }
  console.log(`✓ Seeded ${permissionsCount} role permission records`);

  // 4. Seed Users
  const passwordHash = await bcrypt.hash(SEED_PASSWORD_PLAIN, 12);
  for (const user of USERS_SEED) {
    await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
        passwordHash,
        status: user.status,
        emailVerifiedAt: new Date(),
      },
      create: {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
        passwordHash,
        status: user.status,
        emailVerifiedAt: new Date(),
      },
    });
  }
  console.log(`✓ Seeded ${USERS_SEED.length} database-backed user accounts`);

  // 5. Seed Campaigns & Locations & Issues
  const CAMPAIGNS_SEED = [
    {
      id: 'cmp-safaricom-blitz',
      tenantId: 'tenant-agency-afrireach',
      clientTenantId: 'tenant-client-safaricom',
      name: 'Safaricom 5G Pan-African Corridor Blitz',
      clientName: 'Safaricom PLC',
      brand: 'Safaricom & M-Pesa',
      status: 'Active',
      health: 'Healthy',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-11-30'),
      budgetUSD: 420000,
      spendUSD: 245000,
      deliveryRate: 98.4,
      verificationRate: 96.8,
      targetImpressions: 12000000,
      objective: 'Brand Awareness & 5G Rollout across High-Density Transit Routes',
    },
    {
      id: 'cmp-coca-cola-q4',
      tenantId: 'tenant-agency-afrireach',
      clientTenantId: 'tenant-test-client',
      name: 'Coca-Cola Real Magic Seasonal Wrap',
      clientName: 'Coca-Cola Beverages Africa',
      brand: 'Coca-Cola',
      status: 'Active',
      health: 'Needs Attention',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      budgetUSD: 310000,
      spendUSD: 115000,
      deliveryRate: 92.1,
      verificationRate: 88.5,
      targetImpressions: 8500000,
      objective: 'Seasonal Holiday Reach & Iconic Unipole Dominance',
    },
    {
      id: 'cmp-flutterwave-reach',
      tenantId: 'tenant-agency-afrireach',
      clientTenantId: 'tenant-test-client',
      name: 'Flutterwave Enterprise Send Rollout',
      clientName: 'Flutterwave Technologies',
      brand: 'Flutterwave Send',
      status: 'Live',
      health: 'Healthy',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-10-31'),
      budgetUSD: 185000,
      spendUSD: 165000,
      deliveryRate: 99.1,
      verificationRate: 98.0,
      targetImpressions: 5400000,
      objective: 'Fintech Airport & Commercial Hub Domination',
    },
    {
      id: 'cmp-mtn-lagos-domination',
      tenantId: 'tenant-agency-afrireach',
      clientTenantId: 'tenant-client-safaricom',
      name: 'MTN 5G Broadband Super-Highway',
      clientName: 'MTN Nigeria',
      brand: 'MTN Broadband',
      status: 'Active',
      health: 'At Risk',
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-10-25'),
      budgetUSD: 240000,
      spendUSD: 190000,
      deliveryRate: 84.2,
      verificationRate: 79.4,
      targetImpressions: 7200000,
      objective: 'Fiber & 5G Consumer Activation',
    },
    {
      id: 'cmp-stanbic-wealth',
      tenantId: 'tenant-agency-afrireach',
      clientTenantId: 'tenant-test-client',
      name: 'Stanbic Bank Wealth Leadership',
      clientName: 'Stanbic IBTC Holdings',
      brand: 'Stanbic Wealth',
      status: 'Completed',
      health: 'Healthy',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-09-01'),
      budgetUSD: 150000,
      spendUSD: 150000,
      deliveryRate: 100,
      verificationRate: 99.5,
      targetImpressions: 4100000,
      objective: 'High-Net-Worth Financial Service Advisory',
    },
  ];

  for (const cmp of CAMPAIGNS_SEED) {
    await prisma.campaign.upsert({
      where: { id: cmp.id },
      update: cmp,
      create: cmp,
    });
  }
  console.log(`✓ Seeded ${CAMPAIGNS_SEED.length} core campaigns`);

  // 6. Seed Locations
  const LOCATIONS_SEED = [
    {
      id: 'loc-1',
      campaignId: 'cmp-safaricom-blitz',
      billboardId: 'LOS-DOOH-101',
      siteName: 'Lekki Toll Gate Curved DOOH Spectacular',
      metro: 'Lagos',
      corridor: 'Lekki–Epe Expressway Corridor',
      format: 'Iconic 3D LED',
      lat: 6.4474,
      lng: 3.4723,
      status: 'Verified',
      healthScore: 99.4,
      previewUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
      luxScore: 1420,
      gpsCoords: '6.4474° N, 3.4723° E',
      verifiedAt: new Date(),
      impressionsDelivered: 420000,
    },
    {
      id: 'loc-2',
      campaignId: 'cmp-safaricom-blitz',
      billboardId: 'LOS-VI-088',
      siteName: 'Victoria Island Coastal Dual DOOH Monolith',
      metro: 'Lagos',
      corridor: 'Ahmadu Bello Financial Corridor',
      format: 'Digital Billboard (LED)',
      lat: 6.4281,
      lng: 3.4219,
      status: 'Live',
      healthScore: 98.2,
      previewUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
      luxScore: 1350,
      gpsCoords: '6.4281° N, 3.4219° E',
      verifiedAt: new Date(),
      impressionsDelivered: 380000,
    },
    {
      id: 'loc-3',
      campaignId: 'cmp-safaricom-blitz',
      billboardId: 'NBO-UH-044',
      siteName: 'Uhuru Highway Overhead Mega-Gantry',
      metro: 'Nairobi',
      corridor: 'CBD Express Corridor',
      format: 'Gantry Monolith',
      lat: -1.2864,
      lng: 36.8172,
      status: 'Verified',
      healthScore: 97.6,
      previewUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      luxScore: 1290,
      gpsCoords: '1.2864° S, 36.8172° E',
      verifiedAt: new Date(),
      impressionsDelivered: 510000,
    },
    {
      id: 'loc-4',
      campaignId: 'cmp-coca-cola-q4',
      billboardId: 'LOS-OZ-11',
      siteName: 'Ozumba Mbadiwe Highway Gantry',
      metro: 'Lagos',
      corridor: 'Victoria Island Express',
      format: 'Gantry Unipole',
      lat: 6.4350,
      lng: 3.4390,
      status: 'Issue',
      healthScore: 78.4,
      previewUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
      luxScore: 910,
      gpsCoords: '6.4350° N, 3.4390° E',
      impressionsDelivered: 190000,
    },
    {
      id: 'loc-5',
      campaignId: 'cmp-mtn-lagos-domination',
      billboardId: 'LOS-IK-042',
      siteName: 'Ikorodu Road Cantilever LED',
      metro: 'Lagos',
      corridor: 'Mainland Trunk Corridor',
      format: 'Digital Billboard (LED)',
      lat: 6.5350,
      lng: 3.3710,
      status: 'Offline',
      healthScore: 62.0,
      previewUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      luxScore: 400,
      gpsCoords: '6.5350° N, 3.3710° E',
      impressionsDelivered: 95000,
    },
    {
      id: 'loc-6',
      campaignId: 'cmp-flutterwave-reach',
      billboardId: 'LOS-AP-008',
      siteName: 'Murtala Muhammed International Airport Cantilever',
      metro: 'Lagos',
      corridor: 'Airport Transit Corridor',
      format: 'Digital Billboard (LED)',
      lat: 6.5774,
      lng: 3.3212,
      status: 'Verified',
      healthScore: 99.8,
      previewUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
      luxScore: 1480,
      gpsCoords: '6.5774° N, 3.3212° E',
      verifiedAt: new Date(),
      impressionsDelivered: 620000,
    },
  ];

  for (const loc of LOCATIONS_SEED) {
    await prisma.campaignLocation.upsert({
      where: { id: loc.id },
      update: loc,
      create: loc,
    });
  }
  console.log(`✓ Seeded ${LOCATIONS_SEED.length} campaign billboard locations`);

  // 7. Seed Issues
  const ISSUES_SEED = [
    {
      id: 'iss-1',
      campaignId: 'cmp-coca-cola-q4',
      siteId: 'LOS-OZ-11',
      siteName: 'Ozumba Mbadiwe Highway Gantry',
      title: 'Obstructed sightline by seasonal tree trimming delay',
      description: 'Lekki local government greenery overhanging top 15% of the display face. Council permit dispatched.',
      severity: 'high',
      status: 'open',
    },
    {
      id: 'iss-2',
      campaignId: 'cmp-mtn-lagos-domination',
      siteId: 'LOS-IK-042',
      siteName: 'Ikorodu Road Cantilever LED',
      title: 'Inverter power failure on secondary LED power cabinet',
      description: 'Display offline between 02:00 and 06:30. Backup generator tripped. Contractor Arclight dispatched.',
      severity: 'critical',
      status: 'in_progress',
    },
  ];

  for (const iss of ISSUES_SEED) {
    await prisma.campaignIssue.upsert({
      where: { id: iss.id },
      update: iss,
      create: iss,
    });
  }
  console.log(`✓ Seeded ${ISSUES_SEED.length} operational issues`);

  // 8. Seed Vendor Jobs
  const JOBS_SEED = [
    {
      id: 'job-101',
      tenantId: 'tenant-agency-afrireach',
      vendorTenantId: 'tenant-vendor-arclight',
      campaignId: 'cmp-safaricom-blitz',
      title: 'Grand-Format UV Vinyl Print & Frame Mount',
      serviceType: 'Printing',
      siteName: 'Ozumba Mbadiwe Highway Gantry',
      location: 'Victoria Island, Lagos',
      status: 'Completed',
      deadline: new Date('2026-10-10'),
      instructions: 'Heavyweight 550gsm frontlit vinyl with high UV resistance coating. Deliver to depot.',
      payoutUSD: 3800,
      assigneeName: 'Arclight Fabrication Team',
      completedAt: new Date('2026-10-09'),
    },
    {
      id: 'job-102',
      tenantId: 'tenant-agency-afrireach',
      vendorTenantId: 'tenant-vendor-arclight',
      campaignId: 'cmp-coca-cola-q4',
      title: 'Structural Rigging & Nighttime Display Illumination Check',
      serviceType: 'Installation',
      siteName: 'Lekki Toll Gate Curved DOOH',
      location: 'Lekki Expressway, Lagos',
      status: 'In Progress',
      deadline: new Date('2026-10-14'),
      instructions: 'Nighttime installation window 23:00 - 04:30. Traffic management safety cones mandatory.',
      payoutUSD: 4500,
      assigneeName: 'Arclight Rigging Crew Alpha',
    },
    {
      id: 'job-103',
      tenantId: 'tenant-agency-afrireach',
      vendorTenantId: 'tenant-vendor-arclight',
      campaignId: 'cmp-mtn-lagos-domination',
      title: 'Emergency Power Supply Maintenance & Cabinet Swap',
      serviceType: 'Maintenance',
      siteName: 'Ikorodu Road Cantilever LED',
      location: 'Ikorodu Road, Lagos',
      status: 'Assigned',
      deadline: new Date('2026-10-08'),
      instructions: 'Diagnose inverter trip and replace 2x 48V power supply units.',
      payoutUSD: 2200,
      assigneeName: 'Tunde Bakare (Lead Tech)',
    },
  ];

  for (const job of JOBS_SEED) {
    await prisma.vendorJob.upsert({
      where: { id: job.id },
      update: job,
      create: job,
    });
  }
  console.log(`✓ Seeded ${JOBS_SEED.length} vendor jobs`);

  // 9. Seed Field Tasks
  const TASKS_SEED = [
    {
      id: 'tsk-01',
      tenantId: 'tenant-agency-afrireach',
      agentId: 'usr-field-agent',
      siteId: 'LOS-DOOH-101',
      siteName: 'Lekki Toll Gate Curved DOOH Spectacular',
      metro: 'Lagos',
      corridor: 'Lekki–Epe Expressway Corridor',
      lat: 6.4474,
      lng: 3.4723,
      status: 'Verified',
      gpsVerification: 'GPS Geofence Match (±1.4m accuracy)',
      instructions: 'Conduct daylight lux audit and 4K optical telemetry capture.',
      luxScore: 1420,
      verificationResult: 'Pass: Lux illumination meets standard. 0 dead pixels.',
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
      completedAt: new Date(),
    },
    {
      id: 'tsk-02',
      tenantId: 'tenant-agency-afrireach',
      agentId: 'usr-field-agent',
      siteId: 'LOS-VI-088',
      siteName: 'Victoria Island Coastal Dual DOOH',
      metro: 'Lagos',
      corridor: 'Ahmadu Bello Way',
      lat: 6.4281,
      lng: 3.4219,
      status: 'Assigned',
      instructions: 'Nighttime illumination verification and sightline photograph from 150m approach.',
      scheduledDate: new Date(),
    },
    {
      id: 'tsk-03',
      tenantId: 'tenant-agency-afrireach',
      agentId: 'usr-field-agent',
      siteId: 'LOS-OZ-11',
      siteName: 'Ozumba Mbadiwe Highway Gantry',
      metro: 'Lagos',
      corridor: 'Victoria Island Express',
      lat: 6.4350,
      lng: 3.4390,
      status: 'In Transit',
      instructions: 'Inspect reported tree branch obstruction and photograph sightline from car lane 2.',
      scheduledDate: new Date(),
    },
  ];

  for (const task of TASKS_SEED) {
    await prisma.fieldTask.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }
  console.log(`✓ Seeded ${TASKS_SEED.length} field agent audit tasks`);

  // 10. Seed Invoices
  const INVOICES_SEED = [
    {
      id: 'inv-01',
      tenantId: 'tenant-agency-afrireach',
      recipientTenantId: 'tenant-client-safaricom',
      invoiceNumber: 'INV-2026-AFR-0941',
      clientName: 'Safaricom PLC',
      amountUSD: 85000,
      status: 'Paid',
      dueDate: new Date('2026-09-30'),
      paidAt: new Date('2026-09-28'),
      itemsSummary: 'Month 1 Flight: 12 Prime Digital LED corridors across Lagos and Nairobi',
    },
    {
      id: 'inv-02',
      tenantId: 'tenant-agency-afrireach',
      recipientTenantId: 'tenant-client-safaricom',
      invoiceNumber: 'INV-2026-AFR-1012',
      clientName: 'Safaricom PLC',
      amountUSD: 95000,
      status: 'Pending',
      dueDate: new Date('2026-10-31'),
      itemsSummary: 'Month 2 Flight: 14 High-Impact Corridor Sites + Optical Proof-of-Play Certification',
    },
    {
      id: 'inv-03',
      tenantId: 'tenant-agency-afrireach',
      recipientTenantId: 'tenant-test-client',
      invoiceNumber: 'INV-2026-AFR-1088',
      clientName: 'Coca-Cola Beverages Africa',
      amountUSD: 110000,
      status: 'Pending',
      dueDate: new Date('2026-11-15'),
      itemsSummary: 'Q4 Festive Wrap Dominance: Sandton Central & Lekki Expressway',
    },
    {
      id: 'inv-04',
      tenantId: 'tenant-media-owner-continental',
      recipientTenantId: 'tenant-agency-afrireach',
      invoiceNumber: 'INV-2026-CNT-0418',
      clientName: 'AfriReach Pan-African Media Group',
      amountUSD: 48000,
      status: 'Paid',
      dueDate: new Date('2026-09-15'),
      paidAt: new Date('2026-09-14'),
      itemsSummary: 'Concession lease payout for 6 Prime Lekki LED assets',
    },
  ];

  for (const inv of INVOICES_SEED) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: inv,
      create: inv,
    });
  }
  console.log(`✓ Seeded ${INVOICES_SEED.length} platform invoices`);

  // 11a. Seed Billboard inventory (core entity — one stable identity per entity via `code`)
  const BILLBOARDS_SEED = [
    {
      code: 'LOS-DOOH-101', tenantId: 'tenant-media-owner-continental', name: 'Lekki Expressway Digital Billboard',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Lekki Expressway, Lagos', corridor: 'Lekki–Epe Expressway Corridor',
      format: 'Digital LED', status: 'Live & Verified', lifecycleStatus: 'PUBLISHED',
      dimensions: '12.5m x 5.5m', resolution: '1920 x 848', lightingType: 'Active LED Display',
      priceMonthlyUSD: 3200, priceDailyUSD: 180, dailyTrafficVehicles: 185000, dwellTimeSeconds: 14,
      lat: 6.4457, lng: 3.5526, previewUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 92,
    },
    {
      code: 'LOS-VI-088', tenantId: 'tenant-media-owner-continental', name: 'Victoria Island Coastal LED Mega-Screen',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Ahmadu Bello Way, Victoria Island', corridor: 'VI Coastal Corridor',
      format: 'Iconic 3D LED', status: 'Live & Verified', lifecycleStatus: 'PUBLISHED',
      dimensions: '18m x 9m', resolution: '3840 x 1920', lightingType: 'Active LED Display',
      priceMonthlyUSD: 4800, priceDailyUSD: 260, dailyTrafficVehicles: 240000, dwellTimeSeconds: 22,
      lat: 6.4281, lng: 3.4219, previewUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 96,
    },
    {
      code: 'LOS-LK-042', tenantId: 'tenant-media-owner-continental', name: 'Lekki Toll Gate Curved DOOH Spectacular',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Lekki Toll Gate, Lagos', corridor: 'Lekki–Epe Expressway Corridor',
      format: 'Gantry Monolith', status: 'Active DOOH', lifecycleStatus: 'PUBLISHED',
      dimensions: '20m x 6m', resolution: '3072 x 920', lightingType: 'Active LED Display',
      priceMonthlyUSD: 5200, priceDailyUSD: 290, dailyTrafficVehicles: 310000, dwellTimeSeconds: 18,
      lat: 6.4419, lng: 3.5398, previewUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 88,
    },
    {
      code: 'NBO-UH-044', tenantId: 'tenant-media-owner-continental', name: 'Nairobi Uhuru Highway Digital Gantry',
      metro: 'NBO', metroName: 'Nairobi, Kenya', location: 'Uhuru Highway, Nairobi', corridor: 'Uhuru Highway Corridor',
      format: 'Digital LED', status: 'Live & Verified', lifecycleStatus: 'PUBLISHED',
      dimensions: '14m x 6m', resolution: '2560 x 1096', lightingType: 'Active LED Display',
      priceMonthlyUSD: 3900, priceDailyUSD: 210, dailyTrafficVehicles: 160000, dwellTimeSeconds: 15,
      lat: -1.2921, lng: 36.8219, previewUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 90,
    },
    {
      code: 'LOS-OZ-11', tenantId: 'tenant-media-owner-continental', name: 'Ozumba Mbadiwe Dual-Screen Tower',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Ozumba Mbadiwe Avenue, Victoria Island', corridor: 'VI Coastal Corridor',
      format: 'Overhead Dual DOOH', status: 'Live Loop', lifecycleStatus: 'PUBLISHED',
      dimensions: '2 x 10m x 4m', resolution: '1600 x 640', lightingType: 'Active LED Display',
      priceMonthlyUSD: 2750, priceDailyUSD: 150, dailyTrafficVehicles: 148000, dwellTimeSeconds: 12,
      lat: 6.4354, lng: 3.4316, previewUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 85,
    },
    {
      code: 'LOS-IK-042', tenantId: 'tenant-media-owner-continental', name: 'Ikeja Allen Avenue Static Unipole',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Allen Avenue, Ikeja', corridor: 'Ikeja Commercial Loop',
      format: 'Static Unipole', status: 'Audited', lifecycleStatus: 'PUBLISHED',
      dimensions: '12m x 4m', lightingType: 'Solar High-Lumen Backlit',
      priceMonthlyUSD: 1450, priceDailyUSD: 85, dailyTrafficVehicles: 96000, dwellTimeSeconds: 9,
      lat: 6.6018, lng: 3.3515, previewUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 78,
    },
    {
      code: 'LOS-AP-008', tenantId: 'tenant-media-owner-continental', name: 'Apapa Wharf Road Wallscape',
      metro: 'LOS', metroName: 'Lagos, Nigeria', location: 'Wharf Road, Apapa', corridor: 'Apapa Port Access',
      format: 'Static Wallscape', status: 'Pending PoP', lifecycleStatus: 'PUBLISHED',
      dimensions: '16m x 5m', lightingType: 'Prismatic LED Array',
      priceMonthlyUSD: 1150, priceDailyUSD: 65, dailyTrafficVehicles: 74000, dwellTimeSeconds: 11,
      lat: 6.4489, lng: 3.3591, previewUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      mediaOwnerCompany: 'Continental Outdoor & Alliance Media Concession', importSource: 'manual', profileCompleteness: 70,
    },
  ];

  for (const bb of BILLBOARDS_SEED) {
    await prisma.billboard.upsert({
      where: { code: bb.code },
      update: bb,
      create: bb,
    });
  }
  console.log(`✓ Seeded ${BILLBOARDS_SEED.length} billboard inventory records`);

  // 11b. Seed agency clients (doc §5 — Client entity managed by a marketing agency)
  const CLIENTS_SEED = [
    { tenantId: 'tenant-agency-afrireach', name: 'Safaricom PLC', brand: 'Safaricom 5G & M-Pesa', contactName: 'Fiona Mutasa', contactEmail: 'fmutasa@safaricom.co.ke', status: 'ACTIVE' },
    { tenantId: 'tenant-agency-afrireach', name: 'Flutterwave Inc.', brand: 'Flutterwave Enterprise Send', contactName: 'Media Team', contactEmail: 'media@flutterwave.com', status: 'ACTIVE' },
    { tenantId: 'tenant-agency-afrireach', name: 'Coca-Cola Nigeria', brand: 'Real Magic Seasonal', contactName: 'Brand Desk', contactEmail: 'brands@coca-cola.ng', status: 'ACTIVE' },
  ];
  for (const cli of CLIENTS_SEED) {
    await prisma.client.upsert({
      where: { tenantId_name: { tenantId: cli.tenantId, name: cli.name } },
      update: cli,
      create: cli,
    });
  }
  console.log(`✓ Seeded ${CLIENTS_SEED.length} agency clients`);

  // 11c. Seed subscriptions (doc §7 — persisted, backend-authoritative)
  const SUBSCRIPTIONS_SEED = [
    { tenantId: 'tenant-agency-afrireach', planId: 'plan_professional', planTier: 'professional', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { tenantId: 'tenant-media-owner-continental', planId: 'plan_professional', planTier: 'professional', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { tenantId: 'tenant-client-safaricom', planId: 'plan_starter', planTier: 'starter', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  ];
  for (const sub of SUBSCRIPTIONS_SEED) {
    await prisma.subscription.upsert({
      where: { tenantId: sub.tenantId },
      update: sub,
      create: sub,
    });
  }
  console.log(`✓ Seeded ${SUBSCRIPTIONS_SEED.length} tenant subscriptions`);

  // 11. Seed Media Bookings
  const BOOKINGS_SEED = [
    {
      id: 'mbk-01',
      mediaOwnerTenantId: 'tenant-media-owner-continental',
      agencyTenantId: 'tenant-agency-afrireach',
      billboardId: 'LOS-DOOH-101',
      billboardName: 'Lekki Expressway Digital Billboard',
      brand: 'Safaricom & M-Pesa',
      campaignName: 'Safaricom 5G Pan-African Corridor Blitz',
      agencyName: 'AfriReach Pan-African Media Group',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-11-30'),
      rateMonthlyUSD: 3200,
      totalAmountUSD: 9600,
      status: 'Active',
    },
    {
      id: 'mbk-02',
      mediaOwnerTenantId: 'tenant-media-owner-continental',
      agencyTenantId: 'tenant-agency-afrireach',
      billboardId: 'LOS-VI-088',
      billboardName: 'Victoria Island Coastal LED Mega-Screen',
      brand: 'Flutterwave',
      campaignName: 'Flutterwave Enterprise Send Rollout',
      agencyName: 'AfriReach Pan-African Media Group',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-12-15'),
      rateMonthlyUSD: 4800,
      totalAmountUSD: 9600,
      status: 'Pending',
    },
    {
      id: 'mbk-03',
      mediaOwnerTenantId: 'tenant-media-owner-continental',
      agencyTenantId: 'tenant-agency-afrireach',
      billboardId: 'LOS-LK-042',
      billboardName: 'Lekki Toll Gate Curved DOOH Spectacular',
      brand: 'Coca-Cola',
      campaignName: 'Coca-Cola Real Magic Seasonal Wrap',
      agencyName: 'AfriReach Pan-African Media Group',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-12-31'),
      rateMonthlyUSD: 5200,
      totalAmountUSD: 10400,
      status: 'Approved',
    },
  ];

  for (const bkg of BOOKINGS_SEED) {
    await prisma.mediaBooking.upsert({
      where: { id: bkg.id },
      update: bkg,
      create: bkg,
    });
  }
  console.log(`✓ Seeded ${BOOKINGS_SEED.length} media owner concession bookings`);
  console.log(`✓ All development seed accounts configured with password: "${SEED_PASSWORD_PLAIN}"`);
}

seedDatabase()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
