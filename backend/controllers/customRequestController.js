const CustomRequest = require('../models/CustomRequest');
const { sendCustomRequestNotification } = require('../config/email');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');

// @desc    Submit custom design request (public)
// @route   POST /api/custom-requests
const submitCustomRequest = async (req, res) => {
  try {
    const { fullName, companyName, country, email, whatsapp, requiredQuantity, preferredColors, additionalInstructions } = req.body;

    if (!fullName || !country || !email) {
      return res.status(400).json({ success: false, message: 'Full name, country and email are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Artwork file is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const request = await CustomRequest.create({
      fullName, companyName, country, email, whatsapp,
      artwork: {
        url: getUploadedFileUrl(req.file, req),
        publicId: req.file.filename,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        resourceType: req.file.mimetype === 'application/pdf' ? 'raw' : 'image',
      },
      requiredQuantity, preferredColors, additionalInstructions,
      ipAddress: req.ip,
    });

    sendCustomRequestNotification(request).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Your custom design request has been submitted. Our team will review your artwork and contact you within 24-48 business hours.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit request. Please try again.', error: error.message });
  }
};

// ADMIN CONTROLLERS
const adminGetCustomRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      CustomRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      CustomRequest.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: requests, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetCustomRequest = async (req, res) => {
  try {
    const request = await CustomRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateCustomRequest = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await CustomRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;

    await request.save();
    res.status(200).json({ success: true, message: 'Request updated.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteCustomRequest = async (req, res) => {
  try {
    const request = await CustomRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.artwork?.publicId) await deleteFromCloudinary(request.artwork.publicId, request.artwork.resourceType || 'image');
    await request.deleteOne();
    res.status(200).json({ success: true, message: 'Custom request deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete the custom request.', error: error.message });
  }
};

module.exports = { submitCustomRequest, adminGetCustomRequests, adminGetCustomRequest, adminUpdateCustomRequest, adminDeleteCustomRequest };
