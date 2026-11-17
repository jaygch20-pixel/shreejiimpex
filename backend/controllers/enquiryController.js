const Enquiry = require('../models/Enquiry');
const { sendEnquiryNotification, sendQuotationEmail } = require('../config/email');

// @desc    Submit enquiry (public)
// @route   POST /api/enquiries
const submitEnquiry = async (req, res) => {
  try {
    const {
      fullName, companyName, country, email, whatsapp, productSelection, subject,
      designId, designName, designCode, quantity, fabricRequirements, additionalMessage, message,
    } = req.body;
    const enquirySubject = subject || productSelection;
    const enquiryMessage = message || additionalMessage;

    if (!fullName || !email || !enquirySubject || !enquiryMessage) {
      return res.status(400).json({ success: false, message: 'Full name, email, subject and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const enquiry = await Enquiry.create({
      fullName, companyName, country, email, whatsapp,
      productSelection: enquirySubject, designId: designId || undefined, designName, designCode,
      quantity, fabricRequirements, additionalMessage: enquiryMessage,
      ipAddress: req.ip,
    });

    // Send email notification (non-blocking)
    sendEnquiryNotification(enquiry).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully. We will contact you within 24-48 business hours.',
      referenceId: enquiry.referenceId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again.', error: error.message });
  }
};

// ADMIN CONTROLLERS
const adminGetEnquiries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).populate('designId', 'name designCode').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Enquiry.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: enquiries, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('designId', 'name designCode images');
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateEnquiry = async (req, res) => {
  try {
    const { status, adminNotes, quotationAmount, quotationCurrency, quotationDate } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });

    if (status) enquiry.status = status;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
    if (quotationAmount !== undefined) enquiry.quotationAmount = quotationAmount;
    if (quotationCurrency) enquiry.quotationCurrency = quotationCurrency;
    if (quotationDate) enquiry.quotationDate = quotationDate;

    await enquiry.save();
    res.status(200).json({ success: true, message: 'Enquiry updated.', data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    await enquiry.deleteOne();
    res.status(200).json({ success: true, message: 'Enquiry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete the enquiry.', error: error.message });
  }
};

const adminSendQuotation = async (req, res) => {
  try {
    const { quotationAmount, quotationCurrency = 'USD', adminNotes } = req.body;
    const amount = Number(quotationAmount);
    const currency = typeof quotationCurrency === 'string' ? quotationCurrency.trim().toUpperCase() : '';
    if (!Number.isFinite(amount) || amount < 0 || !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ success: false, message: 'A non-negative quotation amount and a 3-letter currency code are required.' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });

    enquiry.quotationAmount = amount;
    enquiry.quotationCurrency = currency;
    enquiry.quotationDate = new Date();
    enquiry.status = 'quotation_sent';
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
    await enquiry.save();

    let emailSent;
    try {
      emailSent = await sendQuotationEmail(enquiry);
    } catch (emailError) {
      console.error(`Quotation email failed for ${enquiry.referenceId}: ${emailError.message}`);
      return res.status(502).json({
        success: false,
        message: 'Quotation saved, but email delivery failed. Check SMTP configuration and retry.',
        emailSent: false,
        data: enquiry,
      });
    }

    res.status(200).json({
      success: true,
      message: emailSent ? 'Quotation saved and emailed to the customer.' : 'Quotation saved. Email is not configured; send it to the customer manually.',
      emailSent,
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to save the quotation.', error: error.message });
  }
};

const adminGetStats = async (req, res) => {
  try {
    const Design = require('../models/Design');
    const CustomRequest = require('../models/CustomRequest');

    const [
      totalDesigns, activeDesigns, totalEnquiries, newEnquiries,
      pendingQuotations, totalCustomRequests, newCustomRequests, recentEnquiries
    ] = await Promise.all([
      Design.countDocuments(),
      Design.countDocuments({ status: 'published', isActive: true }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.countDocuments({ status: 'under_review' }),
      CustomRequest.countDocuments(),
      CustomRequest.countDocuments({ status: 'new' }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDesigns, activeDesigns, totalEnquiries, newEnquiries,
        pendingQuotations, totalCustomRequests, newCustomRequests, recentEnquiries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { submitEnquiry, adminGetEnquiries, adminGetEnquiry, adminUpdateEnquiry, adminDeleteEnquiry, adminSendQuotation, adminGetStats };
