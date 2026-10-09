import { prisma } from '../server/db';
import { hashPassword, hashToken } from '../server/auth';

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

async function runAuthTestSuite() {
  console.log('\n=====================================================');
  console.log('ADGRID PHASE 1: COMPREHENSIVE AUTH & SECURITY TEST SUITE');
  console.log('=====================================================\n');

  // 1. HEALTH CHECK
  console.log('1. DATABASE HEALTH & CONNECTIVITY');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'ok' && healthData.db === 'connected', 'Database connectivity via /api/health');

  // 2. REGISTRATION TESTS
  console.log('\n2. REGISTRATION & TENANCY TESTS');
  const uniqueId = Date.now().toString(36);
  const testRegEmail = `mediaowner-${uniqueId}@testconcession.ng`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chukwuma Obi',
      email: testRegEmail,
      password: 'AdGrid2026!Secure',
      organization: `Obi Concession Group ${uniqueId}`,
      role: 'Media Owner',
      city: 'Lagos',
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success && !!regData.token, 'Successful public registration generates user and access token');
  assert(!!regData.user.tenantId, 'Public registration automatically provisions isolated organization tenant');

  // Verify tenant was created in DB
  const createdTenant = await prisma.tenant.findUnique({ where: { id: regData.user.tenantId } });
  assert(!!createdTenant && createdTenant.type === 'MEDIA_OWNER', 'Provisioned tenant is persisted in database with correct type');

  // Duplicate email registration should fail with 409
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chukwuma Duplicate',
      email: testRegEmail,
      password: 'AdGrid2026!Secure',
      organization: 'Duplicate Ltd',
      role: 'Media Owner',
    }),
  });
  assert(dupRes.status === 409, 'Duplicate email registration fails with 409 Conflict');

  // Privileged role self-assignment attempt (Section 6 & 7 security requirement!)
  const privilegedRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malicious Attacker',
      email: `hacker-${uniqueId}@exploit.com`,
      password: 'AdGrid2026!Secure',
      organization: 'Hacker Corp',
      role: 'Platform Admin',
    }),
  });
  assert(privilegedRes.status === 403, 'Privilege escalation prevented: Public cannot self-assign Platform Admin');

  // 3. LOGIN TESTS
  console.log('\n3. LOGIN & CREDENTIAL VERIFICATION TESTS');
  // Correct credentials for seed user
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agency@adgrid.test',
      password: 'AdGrid2026!',
    }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.success && !!loginData.token, 'Seed user login succeeds with valid credentials');
  assert(loginData.user.role === 'Agency Admin', 'User claims and role are properly returned from database');

  // Wrong password
  const badPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agency@adgrid.test',
      password: 'WrongPassword123!',
    }),
  });
  assert(badPassRes.status === 401, 'Wrong password rejected with 401 Unauthorized');

  // Non-existent user
  const nonExistRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nobody@nowhere-adgrid.test',
      password: 'AdGrid2026!',
    }),
  });
  assert(nonExistRes.status === 401, 'Non-existent account rejected with 401 Unauthorized');

  // Suspended account login check
  const suspendedUserEmail = `suspended-${uniqueId}@adgrid.test`;
  await prisma.user.create({
    data: {
      email: suspendedUserEmail,
      name: 'Suspended Account User',
      passwordHash: await hashPassword('AdGrid2026!'),
      role: 'Agency Staff',
      status: 'SUSPENDED',
    },
  });
  const suspendedRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: suspendedUserEmail,
      password: 'AdGrid2026!',
    }),
  });
  assert(suspendedRes.status === 403, 'Suspended account is blocked from login with 403 Forbidden');

  // 4. REFRESH TOKEN ROTATION & REPLAY ATTACK DETECTION
  console.log('\n4. REFRESH TOKEN ROTATION & SESSION INTEGRITY TESTS');
  // Extract refresh token from cookie or create one
  const agencyUser = await prisma.user.findUnique({ where: { email: 'agency@adgrid.test' } });
  const rawSessionToken = 'test-refresh-token-' + uniqueId;
  await prisma.refreshToken.create({
    data: {
      userId: agencyUser!.id,
      tokenHash: hashToken(rawSessionToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // First refresh: should rotate successfully
  const refreshRes1 = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rawSessionToken }),
  });
  const refreshData1 = await refreshRes1.json();
  assert(refreshRes1.status === 200 && refreshData1.success && !!refreshData1.token, 'Refresh token rotated and new access token issued');

  // Verify in DB that old token is marked revoked
  const oldSessionRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawSessionToken) },
  });
  assert(oldSessionRecord?.revokedAt !== null, 'Old refresh token marked revoked in database');

  // Replay Attack Detection: Attempt to re-use the revoked refresh token!
  const replayRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rawSessionToken }),
  });
  assert(replayRes.status === 401, 'Replay attack detected: Revoked refresh token rejected');

  // 5. EMAIL VERIFICATION TESTS
  console.log('\n5. EMAIL VERIFICATION WORKFLOW TESTS');
  const verifyTokenRaw = 'raw-verify-token-' + uniqueId;
  const unverifiedEmail = `unverified-${uniqueId}@adgrid.test`;
  const unverifiedUser = await prisma.user.create({
    data: {
      email: unverifiedEmail,
      name: 'Unverified User',
      passwordHash: await hashPassword('AdGrid2026!'),
      role: 'Media Owner',
      status: 'PENDING_VERIFICATION',
      emailVerifiedAt: null,
    },
  });
  await prisma.emailToken.create({
    data: {
      userId: unverifiedUser.id,
      type: 'VERIFY_EMAIL',
      tokenHash: hashToken(verifyTokenRaw),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Verify email with token
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verifyTokenRaw }),
  });
  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200 && verifyData.success, 'Valid email verification token marks user verified');

  // Check DB state
  const verifiedUserDb = await prisma.user.findUnique({ where: { id: unverifiedUser.id } });
  assert(verifiedUserDb?.emailVerifiedAt !== null && verifiedUserDb?.status === 'ACTIVE', 'User record updated with verification timestamp and ACTIVE status');

  // Reused verification token must fail
  const reuseVerifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verifyTokenRaw }),
  });
  assert(reuseVerifyRes.status === 400, 'Reused email verification token rejected');

  // 6. PASSWORD RESET WORKFLOW TESTS
  console.log('\n6. PASSWORD RESET WORKFLOW TESTS');
  const resetPassRaw = 'raw-reset-token-' + uniqueId;
  await prisma.emailToken.create({
    data: {
      userId: agencyUser!.id,
      type: 'RESET_PASSWORD',
      tokenHash: hashToken(resetPassRaw),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: resetPassRaw,
      password: 'NewAdGrid2026!Password',
    }),
  });
  assert(resetRes.status === 200, 'Password reset succeeded with valid single-use token');

  // Reused reset token must fail
  const reuseResetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: resetPassRaw,
      password: 'AnotherPassword2026!',
    }),
  });
  assert(reuseResetRes.status === 400, 'Reused password reset token rejected');

  // Restore seed password for agency user
  await prisma.user.update({
    where: { id: agencyUser!.id },
    data: { passwordHash: await hashPassword('AdGrid2026!') },
  });

  // 7. TENANT ISOLATION TESTS (Section 5 Requirement!)
  console.log('\n7. MULTI-TENANT ISOLATION TESTS');
  // Login as Agency Admin (belongs to tenant-test-agency)
  const agencyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'agency@adgrid.test', password: 'AdGrid2026!' }),
  });
  const agencyAuth = await agencyLoginRes.json();

  // Agency fetches tenant users
  const agencyUsersRes = await fetch(`${BASE_URL}/tenant/users`, {
    headers: { Authorization: `Bearer ${agencyAuth.token}` },
  });
  const agencyUsersData = await agencyUsersRes.json();
  assert(agencyUsersRes.status === 200 && Array.isArray(agencyUsersData.users), 'Agency Admin can fetch their own organization users');

  // Verify none of the users belong to a different tenant!
  const hasCrossTenantUsers = agencyUsersData.users.some(
    (u: any) => u.email === 'client@adgrid.test' || u.email === 'mediaowner@adgrid.test'
  );
  assert(!hasCrossTenantUsers, 'Tenant isolation enforced: Agency users list contains zero users from other tenants');

  // Client attempts to access agency operations endpoint
  const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@adgrid.test', password: 'AdGrid2026!' }),
  });
  const clientAuth = await clientLoginRes.json();

  const clientValidateAgency = await fetch(`${BASE_URL}/auth/validate-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientAuth.token}`,
    },
    body: JSON.stringify({ targetPath: '/admin/agency' }),
  });
  assert(clientValidateAgency.status === 403, 'Role boundary enforced: Client forbidden from accessing Agency command workspace (403)');

  // 8. AUDIT LOG RECORDING TESTS
  console.log('\n8. AUDIT LOGGING TESTS');
  const auditLogsCount = await prisma.auditLog.count();
  assert(auditLogsCount > 0, `Security audit events recorded in database (Total records: ${auditLogsCount})`);

  // 9. LOGOUT TESTS
  console.log('\n9. LOGOUT & SESSION REVOCATION TESTS');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agencyAuth.token}`,
    },
  });
  assert(logoutRes.status === 200, 'Logout successfully executes');

  console.log('\n=====================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${results.length} total tests.`);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTestSuite()
  .catch((err) => {
    console.error('Test runner fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
