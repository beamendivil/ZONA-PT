import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('public landing and login have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/login']) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('clinician can review controlled-pilot readiness', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('admin@zonapt.com');
  await page.getByLabel('Password', { exact: true }).fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: 'Pilot readiness' }).click();
  await expect(page.getByRole('heading', { name: 'Safe progress, clearly documented' })).toBeVisible();
  await expect(page.getByText('PHI production mode is off')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('logout removes access to protected clinician routes', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('admin@zonapt.com');
  await page.getByLabel('Password', { exact: true }).fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});
