const fs = require('fs');
const os = require('os');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-test-secret-value-at-least-32-characters';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';
for (const key of ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'ADMIN_EMAIL']) {
  process.env[key] = '';
}

const uploadsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shreeji-test-'));
process.env.UPLOADS_DIR = uploadsDirectory;

const app = require('../app');
const Admin = require('../models/Admin');
const Design = require('../models/Design');
const Category = require('../models/Category');
const GalleryImage = require('../models/GalleryImage');
const Enquiry = require('../models/Enquiry');
const CustomRequest = require('../models/CustomRequest');
const WebsiteContent = require('../models/WebsiteContent');
const ManufacturingStage = require('../models/ManufacturingStage');
const jwt = require('jsonwebtoken');

let mongo;

const startTestApp = async () => {
  mongo = await MongoMemoryServer.create(
    process.env.MONGOMS_SYSTEM_BINARY
      ? { binary: { systemBinary: process.env.MONGOMS_SYSTEM_BINARY } }
      : undefined,
  );
  await mongoose.connect(mongo.getUri());
  return app;
};

const stopTestApp = async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  fs.rmSync(uploadsDirectory, { recursive: true, force: true });
};

const clearCollections = async () => {
  for (const model of [Admin, Design, Category, GalleryImage, Enquiry, CustomRequest, WebsiteContent, ManufacturingStage]) {
    await model.deleteMany({});
  }
};

const createAdmin = async () => {
  const admin = await Admin.create({
    name: 'Test Admin',
    email: 'admin@example.test',
    password: 'Test-admin-password-123',
    role: 'super_admin',
  });
  return jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0y8AAAAASUVORK5CYII=',
  'base64',
);

module.exports = {
  Admin,
  Category,
  CustomRequest,
  Design,
  Enquiry,
  GalleryImage,
  ManufacturingStage,
  WebsiteContent,
  app,
  clearCollections,
  createAdmin,
  png,
  startTestApp,
  stopTestApp,
};
