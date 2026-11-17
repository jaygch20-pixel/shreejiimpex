const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  country: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  whatsapp: { type: String, trim: true },

  // Artwork
  artwork: {
    url: { type: String, required: true },
    publicId: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    resourceType: { type: String, default: 'image' },
  },

  requiredQuantity: { type: String },
  preferredColors: { type: String },
  additionalInstructions: { type: String },

  status: {
    type: String,
    enum: ['new', 'under_review', 'in_progress', 'completed', 'rejected'],
    default: 'new',
  },
  adminNotes: { type: String },
  ipAddress: { type: String },
}, { timestamps: true });

customRequestSchema.index({ status: 1 });
customRequestSchema.index({ email: 1 });
customRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomRequest', customRequestSchema);
