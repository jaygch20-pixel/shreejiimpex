const assert = require('node:assert/strict');
const { before, beforeEach, after, test } = require('node:test');
const request = require('supertest');
const { isSampleDataPreviewEnabled } = require('../config/sampleDataPreview');
const {
  app, Category, Design, GalleryImage, ManufacturingStage, WebsiteContent,
  clearCollections, createAdmin, startTestApp, stopTestApp,
} = require('./support');

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

test('public resources are available without customer authentication and admin APIs are protected', async () => {
  const categories = await request(app).get('/api/categories').expect(200);
  assert.deepEqual(categories.body.data, []);

  await request(app).get('/api/designs').expect(200);
  await request(app).get('/api/gallery').expect(200);
  await request(app).get('/api/manufacturing').expect(200);
  await request(app).get('/api/content').expect(200);
  await request(app).post('/api/categories/admin').send({ name: 'Restricted' }).expect(401);
  await request(app).get('/api/enquiries/admin/all').expect(401);
});

test('sample data stays private outside the loopback development preview', async () => {
  const category = await Category.create({
    name: 'Demo Geometry',
    slug: 'demo-geometry',
    isSampleData: true,
  });
  const design = await Design.create({
    name: 'Demo Print',
    designCode: 'DEMO-001',
    slug: 'demo-print-001',
    category: category._id,
    status: 'published',
    isPublished: true,
    isSampleData: true,
    images: [{ url: '/demo-assets/kitango-01.svg', alt: 'Illustrated demo print' }],
  });
  await Promise.all([
    GalleryImage.create({
      title: 'Demo fabric',
      isSampleData: true,
      image: { url: '/demo-assets/kitango-01.svg' },
    }),
    ManufacturingStage.create({
      stageNumber: 1,
      title: 'Demo stage',
      description: 'Placeholder stage.',
      isSampleData: true,
    }),
    WebsiteContent.create({
      section: 'branding',
      status: 'published',
      isSampleData: true,
      data: { companyName: 'Demo only' },
    }),
  ]);

  const previousEnvironment = process.env.NODE_ENV;
  const previousPreview = process.env.SHOW_SAMPLE_DATA_PREVIEW;
  try {
    process.env.NODE_ENV = 'test';
    process.env.SHOW_SAMPLE_DATA_PREVIEW = 'true';
    await request(app).get('/api/designs').expect(200).then(({ body }) => assert.equal(body.data.length, 0));
    await request(app).get('/api/categories').expect(200).then(({ body }) => assert.equal(body.data.length, 0));

    process.env.NODE_ENV = 'development';
    assert.equal(isSampleDataPreviewEnabled({ ip: '::ffff:127.0.0.1' }), true);
    assert.equal(isSampleDataPreviewEnabled({ ip: '203.0.113.10' }), false);
    await request(app).get('/api/designs').expect(200).then(({ body }) => {
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0]._id, design.id);
    });
    await request(app).get('/api/designs/demo-print-001').expect(200);
    await request(app).get('/api/categories').expect(200).then(({ body }) => assert.equal(body.data[0].slug, 'demo-geometry'));
    await request(app).get('/api/gallery').expect(200).then(({ body }) => assert.equal(body.data.length, 1));
    await request(app).get('/api/manufacturing').expect(200).then(({ body }) => assert.equal(body.data.length, 1));
    await request(app).get('/api/content/branding').expect(200).then(({ body }) => assert.equal(body.data.isSampleData, true));
  } finally {
    process.env.NODE_ENV = previousEnvironment;
    if (previousPreview === undefined) delete process.env.SHOW_SAMPLE_DATA_PREVIEW;
    else process.env.SHOW_SAMPLE_DATA_PREVIEW = previousPreview;
  }
});

test('admin can log in with bcrypt credentials and access protected profile; no registration endpoint exists', async () => {
  const login = await request(app)
    .post('/api/admin/auth/login')
    .send({ email: 'admin@example.test', password: 'Test-admin-password-123' })
    .expect(200);

  assert.ok(login.body.token);
  assert.equal(login.body.admin.email, 'admin@example.test');
  assert.equal(Object.hasOwn(login.body.admin, 'password'), false);

  const profile = await request(app)
    .get('/api/admin/auth/me')
    .set('Authorization', `Bearer ${login.body.token}`)
    .expect(200);
  assert.equal(profile.body.admin.email, 'admin@example.test');

  await request(app)
    .post('/api/admin/auth/login')
    .send({ email: 'admin@example.test', password: 'incorrect-password' })
    .expect(401);
  await request(app).post('/api/admin/auth/register').send({}).expect(404);
  await request(app).post('/api/auth/register').send({}).expect(404);
  await request(app).get('/api/categories/admin/all').set('Authorization', `Bearer ${token}`).expect(200);
});
