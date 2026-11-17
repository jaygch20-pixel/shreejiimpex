import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('visitor can submit custom artwork without creating an account', async ({ page }) => {
  await mockApi(page);
  let customRequest;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/custom-requests')) customRequest = request;
  });

  await page.goto('/contact');
  await page.getByRole('button', { name: 'Sending artwork for a custom design? Submit it here' }).click();
  await page.getByLabel('Full Name').fill('Artwork Buyer');
  await page.getByLabel('Email Address').fill('artwork@example.test');
  await page.getByLabel('Country').fill('Testland');
  await page.getByLabel(/Artwork/).setInputFiles({
    name: 'pattern.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake image'),
  });
  await page.getByRole('button', { name: 'Submit Artwork' }).click();

  await expect(page.getByRole('status')).toContainText('Custom artwork received.');
  expect(customRequest).toBeTruthy();
  expect(customRequest.headers()['authorization']).toBeUndefined();
  expect(customRequest.headers()['content-type']).toContain('multipart/form-data');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
