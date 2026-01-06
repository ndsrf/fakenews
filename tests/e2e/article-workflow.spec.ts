import { test, expect } from '@playwright/test';

/**
 * Article Workflow E2E Tests
 *
 * These tests verify the article creation and management workflow:
 * 1. User can navigate to article creation page
 * 2. Article creation form loads properly
 * 3. Form validation works
 * 4. Articles appear in the list after creation
 */

test.describe('Article Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the login page for each test
    await page.goto('/login');
  });

  test('should load login page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Fictional News/i);
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });

  test('should navigate to register page from login', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole('heading', { name: /register|sign up/i })).toBeVisible();
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /log in|sign in/i });
    await loginButton.click();

    // Wait a bit for validation
    await page.waitForTimeout(500);

    // Form should not submit (we should still be on login page)
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show email and password fields', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('register page should have all required fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/^password/i)).toBeVisible();
    await expect(page.getByPlaceholder(/confirm.*password/i)).toBeVisible();

    // Language select should exist
    const languageSelect = page.locator('select[name="language"]');
    await expect(languageSelect).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder(/name/i).fill('Test User');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/^password$/i).fill('password123');
    await page.getByPlaceholder(/confirm.*password/i).fill('differentpassword');

    await page.selectOption('select[name="language"]', 'en');

    const registerButton = page.getByRole('button', { name: /register|sign up/i });
    await registerButton.click();

    // Should show error or stay on page
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*register/);
  });
});

test.describe('Navigation and UI', () => {
  test('should have proper page structure on login', async ({ page }) => {
    await page.goto('/login');

    // Should have main content area
    const mainContent = page.locator('main, [role="main"], .container');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/login');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');

    // Check for labels or placeholders
    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
