const express = require('express');
const router = express.Router();
const { getContent, getAllContent, adminGetAllContent, adminGetContent, adminUpdateContent, adminPublishContent, adminMarkSampleData, adminDeleteContent } = require('../controllers/contentController');
const { protect } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

// Public
router.get('/', getAllContent);
router.get('/:section', getContent);

// Admin
router.get('/admin/all', protect, adminGetAllContent);
router.get('/admin/:section', protect, adminGetContent);
router.put('/admin/:section', protect, uploadContent.array('images', 5), adminUpdateContent);
router.patch('/admin/:section/publish', protect, adminPublishContent);
router.patch('/admin/:section/sample-data', protect, adminMarkSampleData);
router.delete('/admin/:section', protect, adminDeleteContent);

module.exports = router;
