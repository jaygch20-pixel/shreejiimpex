const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
}, { _id: false });

const designSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  shortDescription: { type: String, trim: true },

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  images: [imageSchema],

  // Specifications (marked as sample data where needed)
  fabricType: { type: String, default: '100% Cotton' },
  fabricWidth: { type: String },
  weight: { type: String },
  availableColors: [{ type: String }],
  colorDescription: { type: String },
  moq: { type: String }, // Minimum Order Quantity
  customizationAvailable: { type: Boolean, default: true },

  // Status flags
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isSampleData: { type: Boolean, default: true },

  // CMS draft/publish
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date },

  // SEO
  seoTitle: { type: String },
  seoDescription: { type: String },

  tags: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

designSchema.index({ category: 1 });
designSchema.index({ isActive: 1, status: 1 });
designSchema.index({ isFeatured: 1 });
designSchema.index({ name: 'text', designCode: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Design', designSchema);
