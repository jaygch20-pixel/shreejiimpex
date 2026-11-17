const ManufacturingStage = require('../models/ManufacturingStage');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');
const { publicSampleDataFilter } = require('../config/sampleDataPreview');

// @desc    Get all active manufacturing stages (public)
// @route   GET /api/manufacturing
const getManufacturingStages = async (req, res) => {
  try {
    const stages = await ManufacturingStage.find({ isActive: true, ...publicSampleDataFilter(req) }).sort({ stageNumber: 1 });
    res.status(200).json({ success: true, data: stages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetStages = async (req, res) => {
  try {
    const stages = await ManufacturingStage.find().sort({ stageNumber: 1 });
    res.status(200).json({ success: true, data: stages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminCreateStage = async (req, res) => {
  try {
    const { stageNumber, title, description, icon } = req.body;
    if (!stageNumber || !title || !description) {
      return res.status(400).json({ success: false, message: 'Stage number, title and description are required.' });
    }

    const image = req.file ? { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: title } : undefined;

    const stage = await ManufacturingStage.create({
      stageNumber: parseInt(stageNumber), title, description, icon, image, isSampleData: false,
    });

    res.status(201).json({ success: true, message: 'Stage created.', data: stage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateStage = async (req, res) => {
  try {
    const stage = await ManufacturingStage.findById(req.params.id);
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found.' });

    const { stageNumber, title, description, icon, isActive } = req.body;
    if (stageNumber) stage.stageNumber = parseInt(stageNumber);
    if (title) stage.title = title;
    if (description) stage.description = description;
    if (icon) stage.icon = icon;
    if (isActive !== undefined) stage.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      if (stage.image?.publicId) await deleteFromCloudinary(stage.image.publicId);
      stage.image = { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: title || stage.title };
    }

    stage.isSampleData = false;
    await stage.save();
    res.status(200).json({ success: true, message: 'Stage updated.', data: stage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteStage = async (req, res) => {
  try {
    const stage = await ManufacturingStage.findById(req.params.id);
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found.' });

    if (stage.image?.publicId) await deleteFromCloudinary(stage.image.publicId);
    await stage.deleteOne();

    res.status(200).json({ success: true, message: 'Stage deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getManufacturingStages, adminGetStages, adminCreateStage, adminUpdateStage, adminDeleteStage };
