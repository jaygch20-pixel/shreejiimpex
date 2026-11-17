const express = require('express');
const router = express.Router();
const { submitEnquiry, adminGetEnquiries, adminGetEnquiry, adminUpdateEnquiry, adminDeleteEnquiry, adminSendQuotation, adminGetStats } = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

// Public
router.post('/', submitEnquiry);

// Admin
router.get('/admin/stats', protect, adminGetStats);
router.get('/admin/all', protect, adminGetEnquiries);
router.get('/admin/:id', protect, adminGetEnquiry);
router.put('/admin/:id', protect, adminUpdateEnquiry);
router.put('/admin/:id/quotation', protect, adminSendQuotation);
router.delete('/admin/:id', protect, adminDeleteEnquiry);

module.exports = router;
