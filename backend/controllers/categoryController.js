const Category = require('../models/Category');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');
const { publicSampleDataFilter } = require('../config/sampleDataPreview');

// @desc    Get all active categories (public)
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true, ...publicSampleDataFilter(req) }).sort({ sortOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ADMIN CONTROLLERS
const adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminCreateCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const image = req.file ? { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: name } : undefined;

    const category = await Category.create({ name, slug, description, image, sortOrder: sortOrder || 0 });
    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Category already exists.' });
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, description, isActive, sortOrder } = req.body;
    if (name) { category.name = name; category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;
    if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder);
    category.isSampleData = false;

    if (req.file) {
      if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
      category.image = { url: getUploadedFileUrl(req.file, req), publicId: req.file.filename, alt: category.name };
    }

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteCategory = async (req, res) => {
  try {
    const Design = require('../models/Design');
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const designCount = await Design.countDocuments({ category: req.params.id });
    if (designCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${designCount} design(s) use this category. Reassign them first.` });
    }

    if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getCategories, adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory };
