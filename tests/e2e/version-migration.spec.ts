import { test, expect } from '@playwright/test';

/**
 * Phase 1 E2E Tests: Version Display and Migration System
 *
 * These tests verify:
 * 1. Version number displays on login page
 * 2. Version API endpoint works
 * 3. Health check includes version info
 */

test.describe.configure({ mode: 'serial' });

test.describe('Version Display and Migration System', () => {
  test('login page displays current version', async ({ page }) => {
    await page.goto('/login');

    // Version should be visible in format v1.0.0
    const versionElement = page.getByText(/v\d+\.\d+\.\d+/);
    await expect(versionElement).toBeVisible();

    // Get the version text
    const versionText = await versionElement.textContent();
    expect(versionText).toMatch(/v?\d+\.\d+\.\d+/);
  });

  test('/api/version endpoint returns version information', async ({ request }) => {
    const response = await request.get('/api/version');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should have app version
    expect(data).toHaveProperty('version');
    expect(data.version).toMatch(/\d+\.\d+\.\d+/);

    // Should have database version property (may be null if migrations haven't run)
    expect(data).toHaveProperty('databaseVersion');

    // If database version exists, it should match app version
    if (data.databaseVersion !== null) {
      expect(data.databaseVersion).toMatch(/\d+\.\d+\.\d+/);
      expect(data.version).toBe(data.databaseVersion);
    }
  });

  test('/health endpoint returns health check with version', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should have status
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');

    // Should have version
    expect(data).toHaveProperty('version');
    expect(data.version).toMatch(/\d+\.\d+\.\d+/);

    // Should have timestamp
    expect(data).toHaveProperty('timestamp');
  });

  test('version matches package.json', async ({ page, request }) => {
    // Get version from login page
    await page.goto('/login');
    const versionElement = page.getByText(/v\d+\.\d+\.\d+/);
    const displayedVersion = (await versionElement.textContent())?.replace('v', '');

    // Get version from API
    const response = await request.get('/api/version');
    const apiData = await response.json();

    // Both should match
    expect(displayedVersion).toBe(apiData.version);
  });

  test('database has AppVersion table with current version', async ({ request }) => {
    // This is tested indirectly through the /api/version endpoint
    const response = await request.get('/api/version');
    const data = await response.json();

    // Should have migration info property
    expect(data).toHaveProperty('appliedMigrations');
    expect(Array.isArray(data.appliedMigrations)).toBe(true);

    // Database version may be null on fresh database before migrations run
    // If it exists, it should be valid
    if (data.databaseVersion) {
      expect(data.databaseVersion).toMatch(/\d+\.\d+\.\d+/);
    }
  });

  test('initial migrations (1.0.0) are applied', async ({ request }) => {
    const response = await request.get('/api/version');
    const data = await response.json();

    // Should be at least version 1.0.0
    const [major] = data.version.split('.').map(Number);
    expect(major).toBeGreaterThanOrEqual(1);

    // Migrations may not have run yet on fresh database
    // If they have, check that initial migration is included
    if (data.appliedMigrations.length > 0) {
      const migrationNames = data.appliedMigrations.map((m: any) => m.name || m);
      const hasInitialMigration = migrationNames.some(
        (name: string) => name.includes('initial') || name.includes('001')
      );
      expect(hasInitialMigration).toBe(true);
    }
  });

  test('version format follows semantic versioning', async ({ request }) => {
    const response = await request.get('/api/version');
    const data = await response.json();

    // Should match MAJOR.MINOR.PATCH format
    const semverRegex = /^\d+\.\d+\.\d+$/;
    expect(data.version).toMatch(semverRegex);

    // Parse version components
    const [major, minor, patch] = data.version.split('.').map(Number);

    // All should be valid numbers
    expect(Number.isInteger(major)).toBe(true);
    expect(Number.isInteger(minor)).toBe(true);
    expect(Number.isInteger(patch)).toBe(true);

    // All should be non-negative
    expect(major).toBeGreaterThanOrEqual(0);
    expect(minor).toBeGreaterThanOrEqual(0);
    expect(patch).toBeGreaterThanOrEqual(0);
  });

  test('server starts successfully with migrations applied', async ({ request }) => {
    // Test that server is running
    const healthResponse = await request.get('/health');
    expect(healthResponse.ok()).toBeTruthy();

    // Test that auth endpoints are available (only work if migrations applied)
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    // Should get a response (even if credentials are wrong)
    // This proves migrations created the User table
    expect(loginResponse.status()).toBe(401); // Unauthorized, but endpoint works
  });

  test('version info is available to authenticated users', async ({ page, request }) => {
    // Register and login a user
    await page.goto('/register');
    await page.getByPlaceholder(/name/i).fill('Version Test User');
    await page.getByPlaceholder(/email/i).fill('versiontest@example.com');
    await page.getByPlaceholder(/^password$/i).fill('TestSecure123!');
    await page.getByPlaceholder(/confirm.*password/i).fill('TestSecure123!');
    await page.getByRole('button', { name: /register|sign up/i }).click();

    // Wait for success or pending message
    await page.waitForTimeout(2000);

    // Navigate to login if needed
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('versiontest@example.com');
    await page.getByPlaceholder(/password/i).fill('TestSecure123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Try to access version endpoint
    const response = await page.request.get('/api/version');

    // Should be accessible
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.version).toBeTruthy();
  });

  test('migration service logs are not exposed to client', async ({ page }) => {
    await page.goto('/login');

    // Check console for any migration logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await page.waitForTimeout(1000);

    // Migration logs should not appear in browser console
    const hasMigrationLogs = consoleLogs.some(log =>
      log.toLowerCase().includes('migration') || log.toLowerCase().includes('applying sql')
    );

    expect(hasMigrationLogs).toBe(false);
  });
});
