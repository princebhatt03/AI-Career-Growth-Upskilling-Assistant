const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/authMiddleware');
const {
  upload,
  uploadErrorHandler,
} = require('../middlewares/uploadMiddleware');

// Routes
router.post(
  '/register',
  upload.single('profilePhoto'),
  uploadErrorHandler,
  registerUser
);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
