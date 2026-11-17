const mongoose = require('mongoose');

const exportDestinationSchema = new mongoose.Schema({
  country: { type: String, required: true, trim: true },
  region: { type: String, trim: true },
  flag: { type: String }, // emoji or image URL
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  isSampleData: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ExportDestination', exportDestinationSchema);
