const assert = require('node:assert/strict');
const { before, beforeEach, after, test } = require('node:test');
const request = require('supertest');
const { app, clearCollections, createAdmin, png, startTestApp, stopTestApp } = require('./support');

let token;

before(async () => {
  await startTestApp();
});

beforeEach(async () => {
  await clearCollections();
  token = await createAdmin();
});

after(async () => {
  await stopTestApp();
});

test('visitor submits a quotation enquiry and an admin can review and save a quotation', async () => {
  const submission = await request(app)
    .post('/api/enquiries')
    .send({
      fullName: 'Buyer Example',
      companyName: 'Test Trading',
      country: 'Testland',
      email: 'buyer@example.test',
      productSelection: 'Verified fabric',
      quantity: '500 meters',
      additionalMessage: 'Please provide availability.',
    })
    .expect(201);
  assert.match(submission.body.referenceId, /^ENQ-/);

  await request(app).get('/api/enquiries/admin/all').expect(401);
  const saved = await request(app)
    .get('/api/enquiries/admin/all')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(saved.body.pagination.total, 1);
  const enquiryId = saved.body.data[0]._id;

  const updated = await request(app)
    .put(`/api/enquiries/admin/${enquiryId}/quotation`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      quotationAmount: 1250,
      quotationCurrency: 'USD',
      adminNotes: 'Quote prepared.',
    })
    .expect(200);
  assert.equal(updated.body.emailSent, false);
  assert.equal(updated.body.data.quotationAmount, 1250);
  assert.equal(updated.body.data.status, 'quotation_sent');
  assert.match(updated.body.message, /Email is not configured/);

  await request(app)
    .put(`/api/enquiries/admin/${enquiryId}/quotation`)
    .set('Authorization', `Bearer ${token}`)
    .send({ quotationAmount: -1 })
    .expect(400);

  await request(app).post('/api/enquiries').send({ fullName: 'Missing details' }).expect(400);
  await request(app).delete(`/api/enquiries/admin/${enquiryId}`).set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).get('/api/enquiries/admin/all').set('Authorization', `Bearer ${token}`).expect(200).then(({ body }) => assert.equal(body.pagination.total, 0));
});

test('visitor can submit a contact enquiry without country or legacy quotation fields', async () => {
  const submission = await request(app)
    .post('/api/enquiries')
    .send({
      fullName: 'Contact Visitor',
      email: 'visitor@example.test',
      whatsapp: '5550101234',
      subject: 'Fabric availability',
      message: 'Please share the available collections.',
    })
    .expect(201);
  assert.match(submission.body.referenceId, /^ENQ-/);

  const saved = await request(app)
    .get('/api/enquiries/admin/all')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(saved.body.pagination.total, 1);
  assert.equal(saved.body.data[0].country, undefined);
  assert.equal(saved.body.data[0].productSelection, 'Fabric availability');
  assert.equal(saved.body.data[0].additionalMessage, 'Please share the available collections.');
});

test('visitor submits an artwork request without a login and admin can review the uploaded file', async () => {
  const submission = await request(app)
    .post('/api/custom-requests')
    .field('fullName', 'Design Buyer')
    .field('companyName', 'Sample Buyer Co')
    .field('country', 'Testland')
    .field('email', 'design@example.test')
    .field('requiredQuantity', '300 meters')
    .attach('artwork', png, { filename: 'custom-print.png', contentType: 'image/png' })
    .expect(201);
  assert.equal(submission.body.success, true);

  await request(app).get('/api/custom-requests/admin/all').expect(401);
  const list = await request(app)
    .get('/api/custom-requests/admin/all')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(list.body.pagination.total, 1);

  const record = list.body.data[0];
  assert.equal(record.artwork.fileName, 'custom-print.png');
  await request(app).get(new URL(record.artwork.url).pathname).expect(200);

  const updated = await request(app)
    .put(`/api/custom-requests/admin/${record._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'under_review', adminNotes: 'Artwork received.' })
    .expect(200);
  assert.equal(updated.body.data.status, 'under_review');
  await request(app).delete(`/api/custom-requests/admin/${record._id}`).set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).get(new URL(record.artwork.url).pathname).expect(404);
  await request(app).get('/api/custom-requests/admin/all').set('Authorization', `Bearer ${token}`).expect(200).then(({ body }) => assert.equal(body.pagination.total, 0));

  await request(app)
    .post('/api/custom-requests')
    .field('fullName', 'Invalid file')
    .field('country', 'Testland')
    .field('email', 'invalid@example.test')
    .attach('artwork', Buffer.from('not an image'), { filename: 'artwork.exe', contentType: 'application/octet-stream' })
    .expect(400);
});
