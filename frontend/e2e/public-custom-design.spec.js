import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('public contact page does not require login or expose custom artwork submission', async ({ page }) => {
  await mockApi(page);
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: "Let's Connect" })).toBeVisible();
  await expect(page.getByRole('button', { name: /artwork/i })).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.getByLabel('Full Name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send a Message' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
