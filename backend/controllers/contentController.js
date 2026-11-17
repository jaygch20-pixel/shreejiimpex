const WebsiteContent = require('../models/WebsiteContent');
const { deleteFromCloudinary, getUploadedFileUrl } = require('../config/cloudinary');
const { publicSampleDataFilter } = require('../config/sampleDataPreview');

// @desc    Get published content for a section (public)
// @route   GET /api/content/:section
const getContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section, status: 'published', ...publicSampleDataFilter(req) });
    if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @desc    Get all published content (public)
// @route   GET /api/content
const getAllContent = async (req, res) => {
  try {
    const content = await WebsiteContent.find({ status: 'published', ...publicSampleDataFilter(req) });
    const contentMap = {};
    content.forEach(c => { contentMap[c.section] = c; });
    res.status(200).json({ success: true, data: contentMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ADMIN CONTROLLERS
const adminGetAllContent = async (req, res) => {
  try {
    const content = await WebsiteContent.find().sort({ section: 1 });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminGetContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section });
    if (!content) return res.status(404).json({ success: false, message: 'Content section not found.' });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminUpdateContent = async (req, res) => {
  try {
    const { section } = req.params;
    const { title, subtitle, heading, subheading, tagline, body, blocks, data } = req.body;

    let content = await WebsiteContent.findOne({ section });
    if (!content) {
      content = new WebsiteContent({ section });
    }

    // Save as draft data
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (subtitle !== undefined) updateFields.subtitle = subtitle;
    if (heading !== undefined) updateFields.heading = heading;
    if (subheading !== undefined) updateFields.subheading = subheading;
    if (tagline !== undefined) updateFields.tagline = tagline;
    if (body !== undefined) updateFields.body = body;
    if (blocks !== undefined) updateFields.blocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;
    if (data !== undefined) updateFields.data = typeof data === 'string' ? JSON.parse(data) : data;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        key: f.fieldname,
        url: getUploadedFileUrl(f, req),
        publicId: f.filename,
        alt: title || section,
      }));
      // Merge with existing images (replace by key if same key exists)
      const existingImages = content.images || [];
      const updatedImages = [...existingImages];
      for (const newImg of newImages) {
        const existingIdx = updatedImages.findIndex(ei => ei.key === newImg.key);
        if (existingIdx >= 0) {
          if (updatedImages[existingIdx].publicId) await deleteFromCloudinary(updatedImages[existingIdx].publicId);
          updatedImages[existingIdx] = newImg;
        } else {
          updatedImages.push(newImg);
        }
      }
      updateFields.images = updatedImages;
    }

    Object.assign(content, updateFields);
    // Save as draft
    content.status = 'draft';
    content.isSampleData = false;
    await content.save();

    res.status(200).json({ success: true, message: 'Content saved as draft.', data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminPublishContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section });
    if (!content) return res.status(404).json({ success: false, message: 'Content section not found.' });

    content.status = 'published';
    content.publishedAt = new Date();
    await content.save();

    res.status(200).json({ success: true, message: 'Content published successfully.', data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminMarkSampleData = async (req, res) => {
  try {
    const { section } = req.params;
    const { isSampleData } = req.body;

    const content = await WebsiteContent.findOneAndUpdate({ section }, { isSampleData }, { new: true });
    if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });

    res.status(200).json({ success: true, message: 'Sample data flag updated.', data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const adminDeleteContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section });
    if (!content) return res.status(404).json({ success: false, message: 'Content section not found.' });
    for (const image of content.images || []) {
      if (image.publicId) await deleteFromCloudinary(image.publicId);
    }
    await content.deleteOne();
    res.status(200).json({ success: true, message: 'Content section deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete the content section.', error: error.message });
  }
};

module.exports = { getContent, getAllContent, adminGetAllContent, adminGetContent, adminUpdateContent, adminPublishContent, adminMarkSampleData, adminDeleteContent };
