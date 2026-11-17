const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'branding',
      'homepage_hero',
      'homepage_intro',
      'homepage_why_choose',
      'homepage_cta',
      'about_intro',
      'about_story',
      'about_mission',
      'about_values',
      'custom_printing',
      'quality_packaging',
      'export_global',
      'contact_info',
      'footer',
      'seo_global',
    ],
  },

  // Generic content fields
  title: { type: String },
  subtitle: { type: String },
  heading: { type: String },
  subheading: { type: String },
  tagline: { type: String },
  body: { type: String }, // Rich text / markdown

  // Multiple text blocks
  blocks: [mongoose.Schema.Types.Mixed],

  // Images
  images: [{
    key: String,
    url: String,
    publicId: String,
    alt: String,
  }],

  // Key-value pairs for flexible content
  data: { type: mongoose.Schema.Types.Mixed, default: {} },

  // CMS draft/publish
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  draftData: { type: mongoose.Schema.Types.Mixed }, // Saved draft before publishing

  isSampleData: { type: Boolean, default: true },
}, { timestamps: true });

websiteContentSchema.index({ status: 1 });

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
