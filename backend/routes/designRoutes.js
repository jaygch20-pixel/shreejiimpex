const express = require('express');
const router = express.Router();
const {
  getDesigns, getDesignBySlug,
  adminGetAllDesigns, adminGetDesign, adminCreateDesign, adminUpdateDesign,
  adminDeleteDesign, adminPublishDesign, adminUnpublishDesign, adminDeleteDesignImage,
} = require('../controllers/designController');
const { protect } = require('../middleware/auth');
const { uploadDesign } = require('../config/cloudinary');

// Public routes
router.get('/', getDesigns);
router.get('/:slug', getDesignBySlug);

// Admin routes
router.get('/admin/all', protect, adminGetAllDesigns);
router.get('/admin/:id', protect, adminGetDesign);
router.post('/admin', protect, uploadDesign.array('images', 10), adminCreateDesign);
router.put('/admin/:id', protect, uploadDesign.array('images', 10), adminUpdateDesign);
router.delete('/admin/:id', protect, adminDeleteDesign);
router.patch('/admin/:id/publish', protect, adminPublishDesign);
router.patch('/admin/:id/unpublish', protect, adminUnpublishDesign);
router.delete('/admin/:id/image/:publicId', protect, adminDeleteDesignImage);

module.exports = router;
