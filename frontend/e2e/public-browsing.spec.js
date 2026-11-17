import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('public pages are browseable without an account and the requested navigation stays focused', async ({ page }) => {
  await mockApi(page);
  await page.route('https://res.cloudinary.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/gif',
    body: Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64'),
  }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Premium Printed Cotton Fabric for Global Markets' })).toBeVisible();
  await expect(page.locator('.home-hero img')).toHaveCount(2);
  await expect(page.locator('.home-hero img').nth(0)).toHaveAttribute('src', '/images/homepage-background-1.webp');
  await expect(page.locator('.home-hero img').nth(1)).toHaveAttribute('src', '/images/homepage-background-2.webp');
  await expect(page.locator('.core-values-section img')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'OUR CORE VALUES' })).toBeVisible();
  await expect(page.locator('.grid a[href="/products/java"]').first()).toBeVisible();
  await expect(page.locator('.grid a[href="/products/java"]').first().locator('img')).toHaveAttribute('src', /f_auto,q_auto,c_limit,w_720/);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')).toHaveText(['Home', 'About', 'Our Products', 'Contact']);
  await expect(page.locator('footer').getByRole('link', { name: 'Gallery' })).toBeVisible();
  await expect(page.locator('footer').getByRole('link', { name: 'Verified Design' })).toHaveAttribute('href', '/designs/verified-design');
  await expect(page.locator('footer')).toContainText('shreejiimpexjetpur@gmail.com');

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link')).toHaveText(['Home', 'About', 'Our Products', 'Contact']);
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Our Products' }).click();
  await expect(page).toHaveURL(/\/products$/);

  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Explore the catalogue' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Java' }).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Sign in to browse');

  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Traditional Craft to Modern Textile Printing' })).toBeVisible();
  await page.goto('/products/java');
  await expect(page.getByRole('heading', { name: 'Java' })).toBeVisible();
  await expect(page.locator('img[alt="Demo fabric design"]')).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: "Let's Connect" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
