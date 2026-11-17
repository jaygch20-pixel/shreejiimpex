const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  referenceId: {
    type: String,
    unique: true,
    default: () =>
      'ENQ-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      Math.random().toString(36).substr(2, 4).toUpperCase(),
  },

  // Customer info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  country: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  whatsapp: { type: String, trim: true },

  // Product selection
  productSelection: { type: String, trim: true },
  designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
  designName: { type: String },
  designCode: { type: String },
  quantity: { type: String },
  fabricRequirements: { type: String },
  additionalMessage: { type: String },

  // Admin management
  status: {
    type: String,
    enum: ['new', 'under_review', 'quotation_sent', 'confirmed', 'completed', 'rejected'],
    default: 'new',
  },
  adminNotes: { type: String },
  quotationAmount: { type: Number },
  quotationCurrency: { type: String, default: 'USD' },
  quotationDate: { type: Date },

  // Tracking
  source: { type: String, default: 'website' },
  ipAddress: { type: String },
}, { timestamps: true });

enquirySchema.index({ status: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
