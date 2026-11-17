const mongoose = require('mongoose');

const manufacturingStageSchema = new mongoose.Schema({
  stageNumber: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'circle' },
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String, default: '' },
  },
  isActive: { type: Boolean, default: true },
  isSampleData: { type: Boolean, default: true },
}, { timestamps: true });

manufacturingStageSchema.index({ stageNumber: 1 });

module.exports = mongoose.model('ManufacturingStage', manufacturingStageSchema);
