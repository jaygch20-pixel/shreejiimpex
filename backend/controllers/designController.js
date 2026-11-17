const Design = require('../models/Design');
const Category = require('../models/Category');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');
const { publicSampleDataFilter } = require('../config/sampleDataPreview');

// @desc    Get all published designs (public)
// @route   GET /api/designs
const getDesigns = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, featured, newArrival } = req.query;
    const query = { status: 'published', isActive: true, ...publicSampleDataFilter(req) };

    if (category && category !== 'all') {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      featured: { isFeatured: -1, createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { sortOrder: 1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [designs, total] = await Promise.all([
      Design.find(query).populate('category', 'name slug').sort(sortBy).skip(skip).limit(parseInt(limit)),
      Design.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: designs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @desc    Get single design by slug (public)
// @route   GET /api/designs/:slug
const getDesignBySlug = async (req, res) => {
  try {
    const design = await Design.findOne({ slug: req.params.slug, status: 'published', isActive: true, ...publicSampleDataFilter(req) }).populate('category', 'name slug');
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });
    res.status(200).json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ADMIN CONTROLLERS
const adminGetAllDesigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [designs, total] = await Promise.all([
      Design.find(query).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Design.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: designs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate('category', 'name slug');
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });
    res.status(200).json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminCreateDesign = async (req, res) => {
  try {
    const { name, designCode, description, shortDescription, category, fabricType, fabricWidth, weight, availableColors, moq, customizationAvailable, isFeatured, isNewArrival, tags } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + designCode.toLowerCase();

    const images = req.files ? req.files.map((f, i) => ({
      url: getUploadedFileUrl(f, req),
      publicId: f.filename,
      alt: name,
      isPrimary: i === 0,
    })) : [];

    const design = await Design.create({
      name, designCode: designCode.toUpperCase(), slug, description, shortDescription,
      category: category || undefined,
      images,
      fabricType, fabricWidth, weight,
      availableColors: availableColors ? (Array.isArray(availableColors) ? availableColors : availableColors.split(',').map(c => c.trim())) : [],
      moq,
      customizationAvailable: customizationAvailable !== 'false',
      isFeatured: isFeatured === 'true',
      isNewArrival: isNewArrival === 'true',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      isSampleData: false,
      status: 'draft',
    });

    res.status(201).json({ success: true, message: 'Design created successfully.', data: design });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Design code or name already exists.' });
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });

    const updateData = { ...req.body };
    updateData.isSampleData = false;
    if (typeof updateData.availableColors === 'string') {
      updateData.availableColors = updateData.availableColors.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (updateData.category === '') updateData.category = undefined;
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + (updateData.designCode || design.designCode).toLowerCase();
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f, i) => ({
        url: getUploadedFileUrl(f, req),
        publicId: f.filename,
        alt: updateData.name || design.name,
        isPrimary: design.images.length === 0 && i === 0,
      }));
      updateData.images = [...design.images, ...newImages];
    }

    Object.assign(design, updateData);
    await design.save();

    res.status(200).json({ success: true, message: 'Design updated.', data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });

    // Delete images from Cloudinary
    for (const img of design.images) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }

    await design.deleteOne();
    res.status(200).json({ success: true, message: 'Design deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminPublishDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });

    design.status = 'published';
    design.isPublished = true;
    design.publishedAt = new Date();
    if (design.isSampleData) {
      return res.status(400).json({ success: false, message: 'Replace sample data with verified product information before publishing.' });
    }
    await design.save();

    res.status(200).json({ success: true, message: 'Design published.', data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUnpublishDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });

    design.status = 'draft';
    design.isPublished = false;
    await design.save();

    res.status(200).json({ success: true, message: 'Design unpublished.', data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteDesignImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const design = await Design.findById(id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found.' });

    await deleteFromCloudinary(publicId);
    design.images = design.images.filter(img => img.publicId !== publicId);
    // If deleted was primary, make first remaining primary
    if (design.images.length > 0) design.images[0].isPrimary = true;
    await design.save();

    res.status(200).json({ success: true, message: 'Image deleted.', data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  getDesigns,
  getDesignBySlug,
  adminGetAllDesigns,
  adminGetDesign,
  adminCreateDesign,
  adminUpdateDesign,
  adminDeleteDesign,
  adminPublishDesign,
  adminUnpublishDesign,
  adminDeleteDesignImage,
};
