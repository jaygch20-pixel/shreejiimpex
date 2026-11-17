const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  image: {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
  },
  category: {
    type: String,
    enum: ['factory', 'printing', 'collections', 'quality', 'packaging'],
    default: 'factory',
  },
  isActive: { type: Boolean, default: true },
  isSampleData: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

galleryImageSchema.index({ category: 1 });
galleryImageSchema.index({ isActive: 1 });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
