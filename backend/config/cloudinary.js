const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const uploadsDirectory = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

const cloudinaryValues = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
];
const hasCloudinaryConfig = cloudinaryValues.every(Boolean);
const hasPartialCloudinaryConfig = cloudinaryValues.some(Boolean) && !hasCloudinaryConfig;

if (hasPartialCloudinaryConfig) {
  throw new Error('Provide all three Cloudinary environment variables or leave all three unset to use local uploads.');
}

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const allowedMimeTypes = new Map([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
]);
const imageFileFilter = (allowPDF = false) => (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const validImage = allowedMimeTypes.get(file.mimetype)?.has(extension);
  const validPDF = allowPDF && file.mimetype === 'application/pdf' && extension === '.pdf';
  if (validImage || validPDF) return callback(null, true);
  const error = new Error(`Invalid file type. Allowed: ${allowPDF ? 'JPG, JPEG, PNG, WebP, PDF' : 'JPG, JPEG, PNG, WebP'}`);
  error.statusCode = 400;
  return callback(error);
};

const localStorage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadsDirectory),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const createStorage = (folder, transformation, allowPDF) => {
  if (!hasCloudinaryConfig) return localStorage;
  return {
    _handleFile(req, file, callback) {
      const isPDF = allowPDF && file.mimetype === 'application/pdf';
      const extension = path.extname(file.originalname).toLowerCase();
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: `shreeji-impex/${folder}`,
        resource_type: isPDF ? 'raw' : 'image',
        public_id: `${randomUUID()}${isPDF ? extension : ''}`,
        allowed_formats: isPDF ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
        ...(transformation && !isPDF ? { transformation } : {}),
      }, (error, result) => {
        if (error) return callback(error);
        return callback(null, {
          filename: result.public_id,
          path: result.secure_url,
          size: result.bytes,
        });
      });
      file.stream.on('error', callback);
      uploadStream.on('error', callback);
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, callback) {
      cloudinary.uploader.destroy(file.filename, { resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image' })
        .then(() => callback(null))
        .catch(callback);
    },
  };
};

const createUploader = (folder, { allowPDF = false, fileSize = 10 * 1024 * 1024, transformation } = {}) => multer({
  storage: createStorage(folder, transformation, allowPDF),
  fileFilter: imageFileFilter(allowPDF),
  limits: { fileSize },
});

const uploadDesign = createUploader('designs', { transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }] });
const uploadGallery = createUploader('gallery', { transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }] });
const uploadBranding = createUploader('branding', { fileSize: 5 * 1024 * 1024 });
const uploadManufacturing = createUploader('manufacturing', { transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }] });
const uploadArtwork = createUploader('artwork', { allowPDF: true, fileSize: 20 * 1024 * 1024 });
const uploadContent = createUploader('content', { transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }] });

const getUploadedFileUrl = (file, req) => {
  if (!file) return undefined;
  if (/^https?:\/\//i.test(file.path)) return file.path;
  const uploadPath = `/uploads/${path.basename(file.filename || file.path)}`;
  return req ? new URL(uploadPath, `${req.protocol}://${req.get('host')}`).toString() : uploadPath;
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  if (hasCloudinaryConfig) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
    return;
  }

  const filePath = path.join(uploadsDirectory, path.basename(publicId));
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

module.exports = {
  cloudinary,
  uploadDesign,
  uploadGallery,
  uploadBranding,
  uploadManufacturing,
  uploadArtwork,
  uploadContent,
  getUploadedFileUrl,
  deleteFromCloudinary,
  hasCloudinaryConfig,
};
