const express = require('express');
const router = express.Router();
const { submitCustomRequest, adminGetCustomRequests, adminGetCustomRequest, adminUpdateCustomRequest, adminDeleteCustomRequest } = require('../controllers/customRequestController');
const { protect } = require('../middleware/auth');
const { uploadArtwork } = require('../config/cloudinary');

// Public
router.post('/', uploadArtwork.single('artwork'), submitCustomRequest);

// Admin
router.get('/admin/all', protect, adminGetCustomRequests);
router.get('/admin/:id', protect, adminGetCustomRequest);
router.put('/admin/:id', protect, adminUpdateCustomRequest);
router.delete('/admin/:id', protect, adminDeleteCustomRequest);

module.exports = router;
