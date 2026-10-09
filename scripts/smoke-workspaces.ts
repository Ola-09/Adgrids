import { prisma } from '../server/db';

const BASE_URL = 'http://localhost:3000/api';

async function loginUser(email: string, password = 'AdGrid2026!') {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Login failed for ${email}: ${data.error || res.statusText}`);
  }
  return data.token;
}

async function runWorkspaceTests() {
  console.log('\n=====================================================');
  console.log('ADGRID PHASE 2: WORKSPACE API & ACCESS TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = '') {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName} (FAILED: ${detail})`);
      failed++;
    }
  }

  // 1. Agency Admin token
  const agencyToken = await loginUser('kofi.admin@afrireach.africa');
  const agencyHeaders = { Authorization: `Bearer ${agencyToken}` };

  const agencyOverviewRes = await fetch(`${BASE_URL}/agency/overview`, { headers: agencyHeaders });
  const agencyOverview = await agencyOverviewRes.json();
  assert(agencyOverviewRes.status === 200 && agencyOverview.success && agencyOverview.kpis.totalCampaignsCount > 0, 'Agency Overview returns real KPIs and campaigns');

  const agencyCampaignsRes = await fetch(`${BASE_URL}/agency/campaigns`, { headers: agencyHeaders });
  const agencyCampaigns = await agencyCampaignsRes.json();
  assert(agencyCampaignsRes.status === 200 && agencyCampaigns.campaigns.length > 0, 'Agency Campaigns returns real flights list');

  const firstCampaignId = agencyCampaigns.campaigns[0].id;
  const campaignDetailRes = await fetch(`${BASE_URL}/agency/campaigns/${firstCampaignId}`, { headers: agencyHeaders });
  const campaignDetail = await campaignDetailRes.json();
  assert(campaignDetailRes.status === 200 && campaignDetail.campaign.id === firstCampaignId, 'Agency Campaign Detail returns locations and issues');

  const agencyOpsRes = await fetch(`${BASE_URL}/agency/operations`, { headers: agencyHeaders });
  const agencyOps = await agencyOpsRes.json();
  assert(agencyOpsRes.status === 200 && agencyOps.operations.locations.length > 0, 'Agency Operations returns telemetry locations');

  const agencyVendorsRes = await fetch(`${BASE_URL}/agency/vendors`, { headers: agencyHeaders });
  const agencyVendors = await agencyVendorsRes.json();
  assert(agencyVendorsRes.status === 200 && agencyVendors.jobs.length > 0, 'Agency Vendors returns work orders');

  const agencyFinanceRes = await fetch(`${BASE_URL}/agency/finance`, { headers: agencyHeaders });
  const agencyFinance = await agencyFinanceRes.json();
  assert(agencyFinanceRes.status === 200 && agencyFinance.summary.totalBilledUSD > 0, 'Agency Finance returns transparent ledger');

  // 2. Client Token
  const clientToken = await loginUser('fmutasa@safaricom.co.ke');
  const clientHeaders = { Authorization: `Bearer ${clientToken}` };

  const clientOverviewRes = await fetch(`${BASE_URL}/client/overview`, { headers: clientHeaders });
  const clientOverview = await clientOverviewRes.json();
  assert(clientOverviewRes.status === 200 && clientOverview.success, 'Client Overview returns isolated client campaigns');

  const clientLocationsRes = await fetch(`${BASE_URL}/client/locations`, { headers: clientHeaders });
  const clientLocations = await clientLocationsRes.json();
  assert(clientLocationsRes.status === 200 && clientLocations.success, 'Client Locations returns live radar locations');

  // 3. Media Owner Token
  const mediaOwnerToken = await loginUser('fadeleke@continentaloutdoor.ng');
  const mediaOwnerHeaders = { Authorization: `Bearer ${mediaOwnerToken}` };

  const mediaOwnerRes = await fetch(`${BASE_URL}/media-owner/overview`, { headers: mediaOwnerHeaders });
  const mediaOwner = await mediaOwnerRes.json();
  assert(mediaOwnerRes.status === 200 && mediaOwner.success, 'Media Owner Overview returns concession bookings');

  // 4. Vendor Token
  const vendorToken = await loginUser('sbakare@arclightmedia.ng');
  const vendorHeaders = { Authorization: `Bearer ${vendorToken}` };

  const vendorRes = await fetch(`${BASE_URL}/vendor/overview`, { headers: vendorHeaders });
  const vendor = await vendorRes.json();
  assert(vendorRes.status === 200 && vendor.success, 'Vendor Overview returns assigned jobs and payout stats');

  // 5. Field Agent Token
  const fieldAgentToken = await loginUser('babatunde.field@afrireach.africa');
  const fieldAgentHeaders = { Authorization: `Bearer ${fieldAgentToken}` };

  const fieldAgentRes = await fetch(`${BASE_URL}/field-agent/today`, { headers: fieldAgentHeaders });
  const fieldAgent = await fieldAgentRes.json();
  assert(fieldAgentRes.status === 200 && fieldAgent.success, "Field Agent Workspace returns today's audit tasks");

  // 6. Platform Admin Token
  const platformAdminToken = await loginUser('tariro.admin@adgrid.cloud');
  const platformHeaders = { Authorization: `Bearer ${platformAdminToken}` };

  const platformOverviewRes = await fetch(`${BASE_URL}/platform/overview`, { headers: platformHeaders });
  const platformOverview = await platformOverviewRes.json();
  assert(platformOverviewRes.status === 200 && platformOverview.stats.tenantsCount > 0, 'Platform Admin Overview returns multi-tenant counts');

  const platformOrgsRes = await fetch(`${BASE_URL}/platform/organizations`, { headers: platformHeaders });
  const platformOrgs = await platformOrgsRes.json();
  assert(platformOrgsRes.status === 200 && platformOrgs.organizations.length > 0, 'Platform Admin Organizations returns registered tenants');

  const platformUsersRes = await fetch(`${BASE_URL}/platform/users`, { headers: platformHeaders });
  const platformUsers = await platformUsersRes.json();
  assert(platformUsersRes.status === 200 && platformUsers.users.length > 0, 'Platform Admin Users returns managed user accounts');

  const platformLogsRes = await fetch(`${BASE_URL}/platform/audit-logs`, { headers: platformHeaders });
  const platformLogs = await platformLogsRes.json();
  assert(platformLogsRes.status === 200 && platformLogs.logs.length > 0, 'Platform Admin Audit Logs returns event trail');

  console.log(`\n=====================================================`);
  console.log(`PHASE 2 SUMMARY: ${passed} Passed, ${failed} Failed out of ${passed + failed} total tests.`);
  console.log(`=====================================================\n`);
}

runWorkspaceTests().catch(console.error);
