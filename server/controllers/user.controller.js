const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');

// Helper: Promise-based Cloudinary Upload
const uploadToCloudinary = fileBuffer => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'profile_photos' },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    let profilePhotoUrl = '';

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters long');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('Email is already registered');
    }

    // Handle file upload
    if (req.file) {
      console.log('📤 Uploading image to Cloudinary...');
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        profilePhotoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError.message);
        throw new Error('Failed to upload profile photo');
      }
    } else {
      console.log('⚠️ No profile image uploaded. Using default avatar.');
    }

    // Use default avatar if upload not done
    if (!profilePhotoUrl) {
      profilePhotoUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      mobile: mobile || '',
      profilePhoto: profilePhotoUrl,
    });

    // Success response
    if (user) {
      console.log('✅ User registered successfully:', user.email);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profilePhoto: user.profilePhoto,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('🔥 Registration Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error('User not found. Please register first.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid password. Please try again.');
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    profilePhoto: user.profilePhoto,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
