const GalleryImage = require('../models/GalleryImage');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');
const { publicSampleDataFilter } = require('../config/sampleDataPreview');

// @desc    Get gallery images (public)
// @route   GET /api/gallery
const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true, ...publicSampleDataFilter(req) };
    if (category && category !== 'all') query.category = category;

    const images = await GalleryImage.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;

    const images = await GalleryImage.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required.' });

    const { title, description, category, sortOrder } = req.body;

    const image = await GalleryImage.create({
      title,
      description,
      image: { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: title || 'Gallery Image' },
      category: category || 'factory',
      sortOrder: parseInt(sortOrder) || 0,
    });

    res.status(201).json({ success: true, message: 'Image uploaded.', data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    const { title, description, category, isActive, sortOrder } = req.body;
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (category) image.category = category;
    if (isActive !== undefined) image.isActive = isActive === 'true' || isActive === true;
    if (sortOrder !== undefined) image.sortOrder = parseInt(sortOrder);
    image.isSampleData = false;

    if (req.file) {
      if (image.image?.publicId) await deleteFromCloudinary(image.image.publicId);
      image.image = { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: title || image.title || '' };
    }

    await image.save();
    res.status(200).json({ success: true, message: 'Image updated.', data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    if (image.image?.publicId) await deleteFromCloudinary(image.image.publicId);
    await image.deleteOne();

    res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getGallery, adminGetGallery, adminUploadGalleryImage, adminUpdateGalleryImage, adminDeleteGalleryImage };
