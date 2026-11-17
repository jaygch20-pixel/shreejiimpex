import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('visitor submits a public contact enquiry without login or bearer token', async ({ page }) => {
  await mockApi(page);
  let enquiryRequest;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/enquiries')) enquiryRequest = request;
  });

  await page.goto('/contact');
  await page.getByLabel('Full Name').fill('Business Buyer');
  await page.getByLabel('Email Address').fill('buyer@example.test');
  await page.getByLabel('Phone Number').fill('5550101234');
  await page.getByLabel('Subject').fill('Fabric availability');
  await page.getByLabel('Message').fill('Please share quotation details.');
  await page.getByRole('button', { name: 'Send a Message' }).click();

  await expect(page.getByRole('status')).toContainText('ENQ-TEST-1');
  expect(enquiryRequest).toBeTruthy();
  expect(enquiryRequest.headers()['authorization']).toBeUndefined();
  const submitted = JSON.parse(enquiryRequest.postData());
  expect(submitted.subject).toBe('Fabric availability');
  expect(submitted.additionalMessage).toBe('Please share quotation details.');
  expect(submitted.country).toBeUndefined();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
