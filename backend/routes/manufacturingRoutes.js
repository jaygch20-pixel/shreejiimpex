const express = require('express');
const router = express.Router();
const { getManufacturingStages, adminGetStages, adminCreateStage, adminUpdateStage, adminDeleteStage } = require('../controllers/manufacturingController');
const { protect } = require('../middleware/auth');
const { uploadManufacturing } = require('../config/cloudinary');

// Public
router.get('/', getManufacturingStages);

// Admin
router.get('/admin/all', protect, adminGetStages);
router.post('/admin', protect, uploadManufacturing.single('image'), adminCreateStage);
router.put('/admin/:id', protect, uploadManufacturing.single('image'), adminUpdateStage);
router.delete('/admin/:id', protect, adminDeleteStage);

module.exports = router;
