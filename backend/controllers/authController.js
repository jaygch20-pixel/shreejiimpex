const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact super admin.' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: admin.toJSON(),
    });
  } catch (error) {
    console.error(`Admin login failed: ${error.message}`);
    res.status(500).json({ success: false, message: 'Unable to log in right now.' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error(`Admin profile lookup failed: ${error.message}`);
    res.status(500).json({ success: false, message: 'Unable to load the admin profile.' });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!admin) return res.status(401).json({ success: false, message: 'Admin account no longer exists.' });
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error(`Admin password change failed: ${error.message}`);
    res.status(500).json({ success: false, message: 'Unable to change the password right now.' });
  }
};

module.exports = { login, getMe, changePassword };
