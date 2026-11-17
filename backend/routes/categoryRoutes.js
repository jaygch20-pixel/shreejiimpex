const express = require('express');
const router = express.Router();
const { getCategories, adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

// Public
router.get('/', getCategories);

// Admin
router.get('/admin/all', protect, adminGetCategories);
router.post('/admin', protect, uploadContent.single('image'), adminCreateCategory);
router.put('/admin/:id', protect, uploadContent.single('image'), adminUpdateCategory);
router.delete('/admin/:id', protect, adminDeleteCategory);

module.exports = router;
