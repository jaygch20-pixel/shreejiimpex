const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: {
    url: String,
    publicId: String,
    alt: String,
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  isSampleData: { type: Boolean, default: false },
}, { timestamps: true });

categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
