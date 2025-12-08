import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Fictional News/);
  await expect(page.getByRole('heading')).toBeVisible();
});

test('navigation to register works', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: /Register/i }).click();
  await expect(page).toHaveURL(/.*register/);
  await expect(page.getByRole('heading', { name: /Register/i })).toBeVisible();
});
