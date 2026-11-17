const express = require('express');
const router = express.Router();
const { getGallery, adminGetGallery, adminUploadGalleryImage, adminUpdateGalleryImage, adminDeleteGalleryImage } = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const { uploadGallery } = require('../config/cloudinary');

// Public
router.get('/', getGallery);

// Admin
router.get('/admin/all', protect, adminGetGallery);
router.post('/admin', protect, uploadGallery.single('image'), adminUploadGalleryImage);
router.put('/admin/:id', protect, uploadGallery.single('image'), adminUpdateGalleryImage);
router.delete('/admin/:id', protect, adminDeleteGalleryImage);

module.exports = router;
