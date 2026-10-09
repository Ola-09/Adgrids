import { prisma } from '../server/db';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`  ✗ ${name} (FAILED: ${details || 'Assertion failed'})`);
    results.push({ name, passed: false, details });
  }
}

async function runHierarchyTestSuite() {
  console.log('\n=============================================================');
  console.log('ADGRID END-TO-END HIERARCHY & ONBOARDING VALIDATION SUITE');
  console.log('MEDIA OWNER → MARKETING AGENCY → WORKSPACE → CLIENTS + FIELD AGENTS');
  console.log('=============================================================\n');

  const unique = Date.now().toString(36);

  // 1. MEDIA OWNER TOP-LEVEL REGISTRATION
  console.log('1. MEDIA OWNER IS THE TOP-LEVEL OWNER');
  const moEmail = `concessionaire-${unique}@testmedia.africa`;
  const moRes = await fetch(`${BASE_URL}/auth/register-media-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alhaji Aliko Concessions',
      email: moEmail,
      password: 'AdGrid2026!Secure',
      organization: `Peak Billboard Fleet ${unique}`,
      city: 'Lagos',
      licenseNumber: `LASAA/2026/${unique}`,
    }),
  });

  const moData = await moRes.json();
  assert(moRes.status === 201 && moData.success && !!moData.token, 'Media Owner registers successfully and receives active session');
  assert(moData.redirectTo === '/admin/media-owner', 'Media Owner redirected to /admin/media-owner');

  const moToken = moData.token;
  const moTenantId = moData.user.tenantId;

  // Verify Media Owner Tenant is ACTIVE in DB
  const moTenant = await prisma.tenant.findUnique({ where: { id: moTenantId } });
  assert(!!moTenant && moTenant.status === 'ACTIVE' && moTenant.type === 'MEDIA_OWNER', 'Media Owner tenant is ACTIVE with MEDIA_OWNER type');

  // 2. MARKETING AGENCY REGISTRATION (MUST BE PENDING)
  console.log('\n2. MARKETING AGENCY REGISTRATION (PENDING STATE ENFORCED)');
  const agencyEmail = `director-${unique}@africacreative.agency`;
  const agencyName = `Creative Horizon Agency ${unique}`;

  const agencyRegRes = await fetch(`${BASE_URL}/auth/register-agency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyName,
      ownerFullName: 'Folake Adeyemi',
      email: agencyEmail,
      password: 'AdGrid2026!Secure',
      phone: '+234 803 111 2233',
      city: 'Lagos',
      country: 'Nigeria',
    }),
  });

  const agencyRegData = await agencyRegRes.json();
  assert(agencyRegRes.status === 201 && agencyRegData.success && agencyRegData.pendingApproval === true, 'Agency registration succeeds with pendingApproval: true');
  assert(!agencyRegData.token, 'Agency registration DOES NOT issue an active authenticated session token');

  // Verify DB state for Agency and Agency Owner
  const agencyUser = await prisma.user.findUnique({
    where: { email: agencyEmail },
    include: { tenant: true },
  });
  assert(!!agencyUser && agencyUser.status === 'PENDING', 'Agency Owner user status in database is PENDING');
  assert(!!agencyUser?.tenant && agencyUser.tenant.status === 'PENDING', 'Agency Tenant organization status in database is PENDING');

  // 3. AGENCY OWNER LOGIN ATTEMPT BEFORE APPROVAL MUST BE REJECTED
  console.log('\n3. AGENCY OWNER PRE-APPROVAL LOGIN REJECTION');
  const preApprovalLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: agencyEmail,
      password: 'AdGrid2026!Secure',
      portalType: 'agency',
    }),
  });

  const preApprovalLoginData = await preApprovalLoginRes.json();
  assert(
    preApprovalLoginRes.status === 403 &&
    (preApprovalLoginData.code === 'account_pending_approval' || preApprovalLoginData.code === 'tenant_pending_approval'),
    'Unapproved Agency Owner login is rejected with 403 pending approval'
  );

  // 4. MEDIA OWNER REVIEWS PENDING APPLICATIONS
  console.log('\n4. MEDIA OWNER REVIEWS PENDING APPLICATIONS');
  const pendingAgenciesRes = await fetch(`${BASE_URL}/media-owner/agencies`, {
    headers: {
      Authorization: `Bearer ${moToken}`,
    },
  });

  const pendingAgenciesData = await pendingAgenciesRes.json();
  assert(pendingAgenciesRes.status === 200 && pendingAgenciesData.success === true, 'Media Owner fetches agency applications list');
  const foundPending = pendingAgenciesData.pendingAgencies?.find((a: any) => a.id === agencyUser?.tenantId);
  assert(!!foundPending, 'Submitted agency appears in Media Owner pending applications list');

  // 5. MEDIA OWNER APPROVES THE AGENCY
  console.log('\n5. MEDIA OWNER APPROVAL ACTION');
  const approveRes = await fetch(`${BASE_URL}/media-owner/agencies/${agencyUser!.tenantId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${moToken}`,
    },
    body: JSON.stringify({ action: 'approve' }),
  });

  const approveData = await approveRes.json();
  assert(approveRes.status === 200 && approveData.success === true && approveData.status === 'ACTIVE', 'Media Owner approves agency successfully');

  // Verify DB state is now ACTIVE
  const approvedAgencyTenant = await prisma.tenant.findUnique({ where: { id: agencyUser!.tenantId } });
  const approvedAgencyUser = await prisma.user.findUnique({ where: { id: agencyUser!.id } });
  assert(approvedAgencyTenant?.status === 'ACTIVE', 'Agency tenant is now ACTIVE in database');
  assert(approvedAgencyUser?.status === 'ACTIVE', 'Agency owner user is now ACTIVE in database');

  // 6. AGENCY OWNER LOGIN AFTER APPROVAL
  console.log('\n6. APPROVED AGENCY OWNER AUTHENTICATION');
  const postApprovalLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: agencyEmail,
      password: 'AdGrid2026!Secure',
      portalType: 'agency',
    }),
  });

  const postApprovalLoginData = await postApprovalLoginRes.json();
  assert(postApprovalLoginRes.status === 200 && postApprovalLoginData.success === true && !!postApprovalLoginData.token, 'Approved Agency Owner successfully logs in');
  assert(postApprovalLoginData.redirectTo === '/admin/agency', 'Agency Owner redirected to /admin/agency');

  const agencyToken = postApprovalLoginData.token;

  // 7. AGENCY OWNER INVITES CLIENT
  console.log('\n7. CLIENT INVITATION FLOW (TIED TO AGENCY TENANT)');
  const clientEmail = `client-${unique}@danone.africa`;
  const inviteClientRes = await fetch(`${BASE_URL}/agency/team/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agencyToken}`,
    },
    body: JSON.stringify({
      email: clientEmail,
      role: 'Customer / Client Company',
      title: 'Global Media Director',
      name: 'Danone Brand Lead',
    }),
  });

  const inviteClientData = await inviteClientRes.json();
  assert(inviteClientRes.status === 201 && inviteClientData.success === true && !!inviteClientData.inviteToken, 'Agency invites Client with bound agency tenant ID');
  const clientInviteToken = inviteClientData.inviteToken;

  // Verify invitation info inspection endpoint
  const clientInfoRes = await fetch(`${BASE_URL}/auth/invitation-info?token=${encodeURIComponent(clientInviteToken)}`);
  const clientInfoData = await clientInfoRes.json();
  assert(clientInfoRes.status === 200 && clientInfoData.valid === true && clientInfoData.role === 'Customer / Client Company', 'Invitation inspection verifies valid client invite token and role');

  // Client accepts invitation
  const clientAcceptRes = await fetch(`${BASE_URL}/auth/accept-invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: clientInviteToken,
      name: 'Amara Diallo',
      password: 'AdGrid2026!Secure',
    }),
  });

  const clientAcceptData = await clientAcceptRes.json();
  assert(clientAcceptRes.status === 200 && clientAcceptData.success === true && !!clientAcceptData.token, 'Client successfully accepts invitation and sets password');
  assert(clientAcceptData.redirectTo === '/admin/client', 'Client redirected to /admin/client');

  const clientUser = await prisma.user.findUnique({ where: { email: clientEmail } });
  assert(clientUser?.tenantId === agencyUser!.tenantId, 'Client user account is attached to the Marketing Agency tenant');

  // 8. AGENCY OWNER INVITES FIELD AGENT
  console.log('\n8. FIELD AGENT INVITATION FLOW (TIED TO AGENCY TENANT)');
  const agentEmail = `fieldagent-${unique}@rapidops.ng`;
  const inviteAgentRes = await fetch(`${BASE_URL}/agency/team/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agencyToken}`,
    },
    body: JSON.stringify({
      email: agentEmail,
      role: 'Field Agent',
      title: 'Senior Drone Auditor',
      name: 'Kofi Mensah',
    }),
  });

  const inviteAgentData = await inviteAgentRes.json();
  assert(inviteAgentRes.status === 201 && inviteAgentData.success === true && !!inviteAgentData.inviteToken, 'Agency invites Field Agent');
  const agentInviteToken = inviteAgentData.inviteToken;

  // Field Agent accepts invitation
  const agentAcceptRes = await fetch(`${BASE_URL}/auth/accept-invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: agentInviteToken,
      name: 'Kofi Mensah',
      password: 'AdGrid2026!Secure',
    }),
  });

  const agentAcceptData = await agentAcceptRes.json();
  assert(agentAcceptRes.status === 200 && agentAcceptData.success === true && !!agentAcceptData.token, 'Field Agent accepts invitation');
  assert(agentAcceptData.redirectTo === '/admin/field-agent', 'Field Agent redirected to /admin/field-agent');

  const fieldAgentUser = await prisma.user.findUnique({ where: { email: agentEmail } });
  assert(fieldAgentUser?.tenantId === agencyUser!.tenantId, 'Field Agent is attached to the Marketing Agency tenant');

  // 9. ROLE-BASED DASHBOARD ROUTING VALIDATION
  console.log('\n9. STRICT ROLE-BASED ACCESS CONTROL');
  const clientToken = clientAcceptData.token;
  const agentToken = agentAcceptData.token;

  // Client attempts to access agency workspace
  const clientAccessAgencyRes = await fetch(`${BASE_URL}/auth/validate-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({ targetPath: '/admin/agency' }),
  });
  const clientAccessAgencyData = await clientAccessAgencyRes.json();
  assert(clientAccessAgencyRes.status === 403 && clientAccessAgencyData.authorized === false, 'Client denied access to /admin/agency and redirected to /admin/client');

  // Field Agent attempts to access media owner workspace
  const agentAccessMoRes = await fetch(`${BASE_URL}/auth/validate-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ targetPath: '/admin/media-owner' }),
  });
  const agentAccessMoData = await agentAccessMoRes.json();
  assert(agentAccessMoRes.status === 403 && agentAccessMoData.authorized === false, 'Field Agent denied access to /admin/media-owner and redirected to /admin/field-agent');

  // 10. REJECTION FLOW VALIDATION
  console.log('\n10. REJECTION FLOW VALIDATION');
  const rejectedEmail = `rejected-agency-${unique}@sample.com`;
  await fetch(`${BASE_URL}/auth/register-agency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyName: `Rejected Agency ${unique}`,
      ownerFullName: 'Rejection Candidate',
      email: rejectedEmail,
      password: 'AdGrid2026!Secure',
    }),
  });

  const rejectedUser = await prisma.user.findUnique({ where: { email: rejectedEmail } });
  // Media Owner rejects the agency
  const rejectRes = await fetch(`${BASE_URL}/media-owner/agencies/${rejectedUser!.tenantId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${moToken}`,
    },
    body: JSON.stringify({ action: 'reject' }),
  });
  const rejectData = await rejectRes.json();
  assert(rejectRes.status === 200 && rejectData.status === 'REJECTED', 'Media Owner rejects application');

  // Rejected Agency tries to log in
  const rejectedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: rejectedEmail,
      password: 'AdGrid2026!Secure',
      portalType: 'agency',
    }),
  });
  const rejectedLoginData = await rejectedLoginRes.json();
  assert(rejectedLoginRes.status === 403 && rejectedLoginData.code === 'account_rejected', 'Rejected agency owner login blocked with 403 account_rejected');

  console.log('\n-------------------------------------------------------------');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(allPassed ? '>>> ALL HIERARCHY TESTS PASSED SUCCESSFULLY! <<<' : '>>> SOME TESTS FAILED! <<<');
  console.log('-------------------------------------------------------------\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runHierarchyTestSuite()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
