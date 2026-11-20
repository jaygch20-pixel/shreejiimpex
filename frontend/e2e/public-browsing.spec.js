import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('public pages are browseable without an account and the requested navigation stays focused', async ({ page }) => {
  await mockApi(page);
  await page.route('https://res.cloudinary.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/gif',
    body: Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64'),
  }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Premium Printed Cotton Fabric for Global Markets' })).toBeVisible();
  await expect(page.locator('.home-hero img')).toHaveCount(2);
  await expect(page.locator('.home-hero img').nth(0)).toHaveAttribute('src', '/images/homepage-background-1.webp');
  await expect(page.locator('.home-hero img').nth(1)).toHaveAttribute('src', '/images/homepage-background-2.webp');
  await expect(page.locator('.core-values-section img')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'OUR CORE VALUES' })).toBeVisible();
  await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('img', { name: 'SHREEJI IMPEX logo' })).toHaveAttribute('src', '/images/shreeji-impex-logo.webp');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/images/shreeji-impex-icon.png');
  await expect(page.locator('.grid a[href="/products/java"]').first()).toBeVisible();
  await expect(page.locator('.grid a[href="/products/java"]').first().locator('img')).toHaveAttribute('src', '/images/products/java/java-01.jpeg');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')).toHaveText(['Home', 'About', 'Our Products', 'Contact']);
  const desktopNavAtRight = await page.getByRole('navigation', { name: 'Main navigation' }).evaluate((nav) => {
    const container = nav.parentElement;
    const style = window.getComputedStyle(container);
    const contentRight = container.getBoundingClientRect().right - Number.parseFloat(style.paddingRight);
    return Math.abs(nav.getBoundingClientRect().right - contentRight) < 2;
  });
  expect(desktopNavAtRight).toBe(true);
  const homeCta = page.locator('.home-textile-cta');
  await expect(homeCta).toHaveCSS('background-attachment', 'fixed');
  await expect(homeCta).toHaveCSS('min-height', `${await page.evaluate(() => window.innerHeight)}px`);
  await expect(page.locator('footer').getByRole('link', { name: 'Gallery' })).toBeVisible();
  await expect(page.locator('footer').getByRole('link', { name: 'Verified Design' })).toHaveAttribute('href', '/designs/verified-design');
  await expect(page.locator('footer')).toContainText('shreejiimpexjetpur@gmail.com');

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.home-textile-cta')).toHaveCSS('background-attachment', 'fixed');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link')).toHaveText(['Home', 'About', 'Our Products', 'Contact']);
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Our Products' }).click();
  await expect(page).toHaveURL(/\/products$/);

  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Explore the catalogue' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Java' }).first()).toBeVisible();
  for (const printType of ['Angel', 'Ankara Print', 'Java', 'Rainbow Color', 'Real Wax']) {
    await expect(page.locator('main').getByRole('link', { name: printType }).first()).toBeVisible();
  }
  await expect(page.locator('body')).not.toContainText('Sign in to browse');

  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible();
  await expect(page.getByText('Founded in 2010, Shreeji Impex is a textile manufacturing company based in Jetpur, Gujarat, India.', { exact: false })).toBeVisible();
  await expect(page.getByText('Our Speciality: Premium Swiss Voile and Kitenge printed fabrics, featuring vibrant colours and attractive designs.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Our Capabilities' })).toHaveCount(0);
  await expect(page.getByText(/formerly known as Geneva Textile Printery|Established in 1995/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'OUR VISION' }).locator('..')).toContainText('quality printed cotton fabrics with attractive designs and vibrant colours');
  await expect(page.getByRole('heading', { name: 'Quality First' }).locator('..')).toContainText('maintaining consistent fabric quality and meeting our customers’ expectations.');
  await expect(page.getByRole('heading', { name: 'Quality First' }).locator('..')).not.toContainText('in-house testing');
  await expect(page.locator('body')).not.toContainText('formerly known as Geneva Textile Printery');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  for (const [slug, name, count] of [
    ['angel', 'Angel', 6],
    ['ankara-print', 'Ankara Print', 5],
    ['java', 'Java', 3],
    ['rainbow-color', 'Rainbow Color', 5],
    ['real-wax', 'Real Wax', 11],
  ]) {
    await page.goto(`/products/${slug}`);
    await expect(page.getByRole('heading', { name })).toBeVisible();
    const galleryImages = page.locator(`main img[alt^="${name} printed cotton fabric design"]`);
    await expect(galleryImages).toHaveCount(count);
    const photoUrls = await galleryImages.evaluateAll((images) => images.map((image) => image.getAttribute('src')));
    const photoResponses = await page.evaluate((urls) => Promise.all(urls.map(async (url) => {
      const response = await fetch(url);
      return response.ok;
    })), photoUrls);
    expect(photoResponses).toEqual(Array(count).fill(true));
  }
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: "Let's Connect" })).toBeVisible();
  await expect(page.locator('a[href="tel:+919925872457"]')).toHaveCount(2);
  await expect(page.locator('body')).not.toContainText('9929872457');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
