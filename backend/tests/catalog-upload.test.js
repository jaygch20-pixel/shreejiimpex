const assert = require('node:assert/strict');
const { before, beforeEach, after, test } = require('node:test');
const request = require('supertest');
const { app, clearCollections, createAdmin, png, startTestApp, stopTestApp, Design } = require('./support');

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

test('admin creates, uploads, publishes, updates, and deletes a public design', async () => {
  const categoryResponse = await request(app)
    .post('/api/categories/admin')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Verified Cotton')
    .field('description', 'Published category')
    .expect(201);
  const categoryId = categoryResponse.body.data._id;

  await request(app)
    .get('/api/categories')
    .expect(200)
    .then(({ body }) => assert.equal(body.data[0].name, 'Verified Cotton'));

  const designResponse = await request(app)
    .post('/api/designs/admin')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Verified Weave')
    .field('designCode', 'VW-001')
    .field('category', categoryId)
    .field('description', 'Verified product description')
    .field('availableColors', 'Indigo, Natural')
    .attach('images', png, { filename: 'fabric.png', contentType: 'image/png' })
    .expect(201);

  const designId = designResponse.body.data._id;
  assert.equal(designResponse.body.data.status, 'draft');
  assert.match(designResponse.body.data.images[0].url, /^http:\/\/127\.0\.0\.1/);
  await request(app).get('/api/designs').expect(200).then(({ body }) => assert.equal(body.data.length, 0));

  await request(app)
    .patch(`/api/designs/admin/${designId}/publish`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const publicList = await request(app).get('/api/designs').expect(200);
  assert.equal(publicList.body.data.length, 1);
  assert.deepEqual(publicList.body.data[0].availableColors, ['Indigo', 'Natural']);

  const imageURL = new URL(publicList.body.data[0].images[0].url);
  await request(app).get(imageURL.pathname).expect(200);

  await request(app)
    .put(`/api/designs/admin/${designId}`)
    .set('Authorization', `Bearer ${token}`)
    .field('shortDescription', 'Updated description')
    .expect(200)
    .then(({ body }) => assert.equal(body.data.shortDescription, 'Updated description'));

  await request(app)
    .delete(`/api/designs/admin/${designId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  await request(app).get(`/api/designs/${publicList.body.data[0].slug}`).expect(404);
});

test('sample designs remain hidden from public APIs even when marked published', async () => {
  await Design.create({
    name: 'Sample only',
    designCode: 'SAMPLE-001',
    slug: 'sample-only',
    status: 'published',
    isPublished: true,
    isSampleData: true,
  });
  const list = await request(app).get('/api/designs').expect(200);
  assert.deepEqual(list.body.data, []);
  await request(app).patch('/api/designs/admin/000000000000000000000001/publish').set('Authorization', `Bearer ${token}`).expect(404);
});

test('admin manages categories, gallery images, manufacturing stages, and published CMS content', async () => {
  const category = await request(app)
    .post('/api/categories/admin')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Catalog group', description: 'Verified category' })
    .expect(201);
  const categoryId = category.body.data._id;
  await request(app)
    .put(`/api/categories/admin/${categoryId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ description: 'Updated category' })
    .expect(200);
  await request(app).get('/api/categories').expect(200).then(({ body }) => assert.equal(body.data[0].description, 'Updated category'));

  const galleryItem = await request(app)
    .post('/api/gallery/admin')
    .set('Authorization', `Bearer ${token}`)
    .field('title', 'Production photo')
    .field('category', 'factory')
    .attach('image', png, { filename: 'gallery.png', contentType: 'image/png' })
    .expect(201);
  const galleryId = galleryItem.body.data._id;
  await request(app).get('/api/gallery').expect(200).then(({ body }) => assert.equal(body.data[0].title, 'Production photo'));
  await request(app)
    .put(`/api/gallery/admin/${galleryId}`)
    .set('Authorization', `Bearer ${token}`)
    .field('title', 'Updated production photo')
    .expect(200);
  await request(app).delete(`/api/gallery/admin/${galleryId}`).set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).get('/api/gallery').expect(200).then(({ body }) => assert.equal(body.data.length, 0));

  const stage = await request(app)
    .post('/api/manufacturing/admin')
    .set('Authorization', `Bearer ${token}`)
    .field('stageNumber', '1')
    .field('title', 'Printing')
    .field('description', 'Verified process step')
    .expect(201);
  const stageId = stage.body.data._id;
  await request(app).get('/api/manufacturing').expect(200).then(({ body }) => assert.equal(body.data[0].title, 'Printing'));
  await request(app)
    .put(`/api/manufacturing/admin/${stageId}`)
    .set('Authorization', `Bearer ${token}`)
    .field('title', 'Updated printing')
    .expect(200);
  await request(app).delete(`/api/manufacturing/admin/${stageId}`).set('Authorization', `Bearer ${token}`).expect(200);

  const content = await request(app)
    .put('/api/content/admin/homepage_hero')
    .set('Authorization', `Bearer ${token}`)
    .field('heading', 'Verified homepage heading')
    .field('blocks', JSON.stringify([{ heading: 'Block', body: 'Published body' }]))
    .field('data', JSON.stringify({ ctaText: 'Browse' }))
    .expect(200);
  assert.equal(content.body.data.status, 'draft');
  await request(app).get('/api/content/homepage_hero').expect(404);
  await request(app).patch('/api/content/admin/homepage_hero/publish').set('Authorization', `Bearer ${token}`).expect(200);
  await request(app)
    .get('/api/content/homepage_hero')
    .expect(200)
    .then(({ body }) => {
      assert.equal(body.data.heading, 'Verified homepage heading');
      assert.equal(body.data.data.ctaText, 'Browse');
      assert.equal(body.data.blocks[0].heading, 'Block');
    });
  await request(app)
    .delete('/api/content/admin/homepage_hero')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  await request(app).get('/api/content/homepage_hero').expect(404);

  await request(app).delete(`/api/categories/admin/${categoryId}`).set('Authorization', `Bearer ${token}`).expect(200);
});
