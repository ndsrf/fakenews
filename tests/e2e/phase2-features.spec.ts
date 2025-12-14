import { test, expect } from '@playwright/test';

/**
 * Phase 2 E2E Tests: Article Generation, Brands, and Templates
 *
 * These tests verify the complete Phase 2 functionality:
 * 1. Brand management (CRUD operations)
 * 2. Template extraction from URLs
 * 3. Article generation with AI
 * 4. Logo generation
 */

test.describe('Phase 2: Brands, Templates, and Articles', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super admin first
    await page.goto('/login');
    // Assuming a super admin exists from Phase 1 setup
    await page.getByPlaceholder(/email/i).fill('super@example.com');
    await page.getByPlaceholder(/password/i).fill('SuperSecure123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for dashboard to load AND for auth to be set
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Verify we're actually on the dashboard and not redirected back
    await expect(page.getByText(/Phase 2 Complete/i)).toBeVisible({ timeout: 10000 });
  });

  test('dashboard shows Phase 2 quick actions', async ({ page }) => {
    // Should see all Phase 2 action cards
    await expect(page.getByRole('link', { name: /Generate Article/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Articles.*Manage articles/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Brands.*Manage news brands/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Templates.*Extract layouts/i })).toBeVisible();

    // Should show Phase 2 complete message
    await expect(page.getByText(/Phase 2 Complete/i)).toBeVisible();
  });

  test('can navigate to brands page', async ({ page }) => {
    // Click on Brands quick action
    await page.getByRole('link', { name: /Brands/i }).first().click();

    // Should navigate to brands page
    await expect(page).toHaveURL(/.*brands/);
    await expect(page.getByText('Fictional News Brands')).toBeVisible();

    // Should have Create Brand and Generate Logo buttons
    await expect(page.getByRole('button', { name: /Create Brand/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate Logo/i })).toBeVisible();
  });

  test('can navigate to templates page', async ({ page }) => {
    // Click on Templates quick action
    await page.getByRole('link', { name: /Templates/i }).first().click();

    // Should navigate to templates page
    await expect(page).toHaveURL(/.*templates/);
    await expect(page.getByText('Article Templates')).toBeVisible();

    // Should have Extract from URL button
    await expect(page.getByRole('button', { name: /Extract from URL/i })).toBeVisible();

    // Should show info about template extraction
    await expect(page.getByText(/Puppeteer/i)).toBeVisible();
  });

  test('can navigate to articles page', async ({ page }) => {
    // Click on Articles quick action
    await page.getByRole('link', { name: /Articles/i }).first().click();

    // Should navigate to articles page
    await expect(page).toHaveURL(/.*articles/);

    // Wait for page to load
    await expect(page.getByText(/Loading articles/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your Articles')).toBeVisible();

    // Should have Generate New Article button (there are 2 on the page - in header and in empty state)
    await expect(page.getByRole('link', { name: /Generate New Article/i }).first()).toBeVisible();

    // Should have filter options
    await expect(page.getByText(/Filter by Status/i)).toBeVisible();
    await expect(page.getByText(/Filter by Brand/i)).toBeVisible();
  });

  test('can navigate to article generation page', async ({ page }) => {
    // Go to articles page first
    await page.goto('/articles');

    // Wait for page to load
    await expect(page.getByText(/Loading articles/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your Articles')).toBeVisible();

    // Click Generate New Article (use first() since there are 2 on the page)
    await page.getByRole('link', { name: /Generate New Article/i }).first().click();

    // Should navigate to create article page
    await expect(page).toHaveURL(/.*articles\/create/);
    await expect(page.getByText('Article Parameters')).toBeVisible();

    // Should have all form fields
    await expect(page.getByText(/Brand \*/i)).toBeVisible();
    await expect(page.getByText(/Topic \*/i)).toBeVisible();
    await expect(page.getByText(/Tone/i)).toBeVisible();
    await expect(page.getByText(/Length/i)).toBeVisible();
    await expect(page.getByText(/Language/i)).toBeVisible();
    await expect(page.getByText(/AI Provider/i)).toBeVisible();

    // Should have checkboxes
    await expect(page.getByText(/Include quotes/i)).toBeVisible();
    await expect(page.getByText(/Include statistics/i)).toBeVisible();
    await expect(page.getByText(/Include charts/i)).toBeVisible();

    // Should have Generate Article button
    await expect(page.getByRole('button', { name: /Generate Article/i })).toBeVisible();

    // Should have preview panel
    await expect(page.getByText('Preview')).toBeVisible();

    // Should show fictional content warning
    await expect(page.getByText(/IMPORTANT: Fictional Content/i)).toBeVisible();
  });

  test('brands page shows brand creation modal', async ({ page }) => {
    await page.goto('/brands');

    // Wait for page to load (not showing "Loading brands...")
    await expect(page.getByText(/Loading brands/i)).not.toBeVisible({ timeout: 10000 });

    // Click Create Brand button
    await page.getByRole('button', { name: /Create Brand/i }).click();

    // Modal should appear with form fields - use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Create Brand' })).toBeVisible();

    // Locate the modal container
    const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Create Brand' });

    // Check form fields within the modal
    await expect(modal.getByText(/Name \*/i)).toBeVisible();
    await expect(modal.getByText(/Tagline/i)).toBeVisible();
    await expect(modal.getByText(/Description \*/i)).toBeVisible();
    await expect(modal.getByText(/Website URL \*/i)).toBeVisible();
    await expect(modal.getByText(/Categories \(comma-separated\) \*/i)).toBeVisible();
    await expect(modal.locator('label', { hasText: 'Language' })).toBeVisible();
    await expect(modal.getByText(/Primary Color/i)).toBeVisible();
    await expect(modal.getByText(/Accent Color/i)).toBeVisible();

    // Should have Create and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Create', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('brands page shows logo generation modal', async ({ page }) => {
    await page.goto('/brands');

    // Wait for page to load
    await expect(page.getByText(/Loading brands/i)).not.toBeVisible({ timeout: 10000 });

    // Click Generate Logo button
    await page.getByRole('button', { name: /Generate Logo/i }).click();

    // Modal should appear with form fields - use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Generate Logo' })).toBeVisible();
    await expect(page.getByText(/Brand Name \*/i)).toBeVisible();
    await expect(page.getByText(/Tagline/i)).toBeVisible();
    await expect(page.getByText(/Style \*/i)).toBeVisible();

    // Should have style options
    const styleSelect = page.locator('select').filter({ hasText: /Modern/ });
    await expect(styleSelect).toBeVisible();

    // Should have Generate and Cancel buttons
    const modal = page.locator('text=Generate Logo').locator('..');
    await expect(modal.getByRole('button', { name: 'Generate', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('templates page shows extraction modal', async ({ page }) => {
    await page.goto('/templates');

    // Wait for page to load
    await expect(page.getByText(/Loading templates/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Article Templates')).toBeVisible();

    // Click Extract from URL button
    await page.getByRole('button', { name: /Extract from URL/i }).click();

    // Modal should appear with form fields
    await expect(page.getByText('Extract Template from Website')).toBeVisible();
    await expect(page.getByText(/Website URL \*/i)).toBeVisible();
    await expect(page.getByText(/Template Name \*/i)).toBeVisible();
    await expect(page.getByText(/Associated Brand/i)).toBeVisible();

    // Should have warning about extraction time
    await expect(page.getByText(/30-60 seconds/i)).toBeVisible();

    // Should have Extract Template and Cancel buttons
    const modal = page.locator('text=Extract Template from Website').locator('..');
    await expect(modal.getByRole('button', { name: /Extract Template/i })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('article generation page requires brand selection', async ({ page }) => {
    await page.goto('/articles/create');

    // Wait for form to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Article Parameters')).toBeVisible();

    // Try to generate without selecting brand
    await page.getByRole('button', { name: /Generate Article/i }).click();

    // Should show validation message (browser native validation)
    // The form should not submit
    await expect(page).toHaveURL(/.*articles\/create/);
  });

  test('navigation links work between Phase 2 pages', async ({ page }) => {
    // Start at dashboard - already logged in from beforeEach
    await expect(page.getByText(/Phase 2 Complete/i)).toBeVisible();

    // Go to brands
    await page.getByRole('link', { name: /Brands/i }).first().click();
    await expect(page).toHaveURL(/.*brands/);
    await expect(page.getByText(/Loading brands/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Fictional News Brands')).toBeVisible();

    // Go to templates via header navigation (Templates page has Templates link)
    await page.goto('/templates');
    await expect(page).toHaveURL(/.*templates/);
    await expect(page.getByText(/Loading templates/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Article Templates')).toBeVisible();

    // Go to articles via header navigation (Articles page has Articles link)
    await page.goto('/articles');
    await expect(page).toHaveURL(/.*articles/);
    await expect(page.getByText(/Loading articles/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your Articles')).toBeVisible();

    // Go back to dashboard via header link (all pages have Dashboard link)
    await page.getByRole('link', { name: /Dashboard/i }).first().click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/Phase 2 Complete/i)).toBeVisible();
  });

  test('all Phase 2 pages have logout button', async ({ page }) => {
    const pages = [
      { path: '/brands', waitFor: 'Fictional News Brands' },
      { path: '/templates', waitFor: 'Article Templates' },
      { path: '/articles', waitFor: 'Your Articles' },
      { path: '/articles/create', waitFor: 'Article Parameters' },
    ];

    for (const { path, waitFor } of pages) {
      await page.goto(path);
      // Wait for page content to load
      await expect(page.getByText(waitFor)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /log out|logout/i })).toBeVisible();
    }
  });

  test('article generation form has all AI provider options', async ({ page }) => {
    await page.goto('/articles/create');

    // Wait for form to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Article Parameters')).toBeVisible();

    // Check AI Provider dropdown has all options
    const aiProviderSelect = page.locator('select').filter({ hasText: /OpenAI/ });
    await expect(aiProviderSelect).toBeVisible();

    // Open dropdown and check options
    const options = await aiProviderSelect.locator('option').allTextContents();
    expect(options).toContain('OpenAI (GPT-4)');
    expect(options).toContain('Anthropic (Claude)');
    expect(options).toContain('Google (Gemini)');
  });

  test('article generation form has tone options', async ({ page }) => {
    await page.goto('/articles/create');

    // Wait for form to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Article Parameters')).toBeVisible();

    // Check Tone dropdown has all options
    const toneSelect = page.locator('select').filter({ hasText: /Serious/ });
    await expect(toneSelect).toBeVisible();

    // Check options
    const options = await toneSelect.locator('option').allTextContents();
    expect(options).toContain('Serious');
    expect(options).toContain('Satirical');
    expect(options).toContain('Dramatic');
    expect(options).toContain('Investigative');
  });

  test('article generation form has length options', async ({ page }) => {
    await page.goto('/articles/create');

    // Wait for form to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Article Parameters')).toBeVisible();

    // Check Length dropdown has all options
    const lengthSelect = page.locator('select').filter({ hasText: /Medium/ });
    await expect(lengthSelect).toBeVisible();

    // Check options
    const options = await lengthSelect.locator('option').allTextContents();
    expect(options.some(o => o.includes('Short'))).toBeTruthy();
    expect(options.some(o => o.includes('Medium'))).toBeTruthy();
    expect(options.some(o => o.includes('Long'))).toBeTruthy();
  });

  test('articles page has status filter', async ({ page }) => {
    await page.goto('/articles');

    // Wait for page to load
    await expect(page.getByText(/Loading articles/i)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your Articles')).toBeVisible();

    // Check Status filter dropdown
    const statusSelect = page.locator('select').filter({ hasText: /All Statuses/ });
    await expect(statusSelect).toBeVisible();

    // Check options
    const options = await statusSelect.locator('option').allTextContents();
    expect(options).toContain('All Statuses');
    expect(options).toContain('Draft');
    expect(options).toContain('Published');
  });
});
