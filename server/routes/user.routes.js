// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/authMiddleware');
const {
  upload,
  uploadErrorHandler,
} = require('../middlewares/uploadMiddleware');

// -------------------------------
// USER ROUTES
// -------------------------------

// @route   POST /api/user/register
// @desc    Register new user (with optional profile photo upload)
// @access  Public
router.post(
  '/register',
  upload.single('profilePhoto'),
  uploadErrorHandler,
  registerUser
);

// @route   POST /api/user/login
// @desc    Login existing user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/user/profile
// @desc    Get logged-in user's profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/user/profile
// @desc    Update user's profile (requires current password confirmation)
// @access  Private
router.put(
  '/profile',
  protect,
  upload.single('profilePhoto'),
  uploadErrorHandler,
  updateUserProfile
);

// @route   DELETE /api/user/profile
// @desc    Delete user's account (requires current password confirmation)
// @access  Private
router.delete('/profile', protect, deleteUserProfile);

module.exports = router;
