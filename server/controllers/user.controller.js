// controllers/user.controller.js
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

// ---------------------------
// Register
// ---------------------------
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
    if (req.file && req.file.buffer) {
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
    // If we already set error status above, keep it. Otherwise 500.
    if (!res.headersSent)
      res
        .status(res.statusCode === 200 ? 500 : res.statusCode)
        .json({ message: error.message });
  }
});

// ---------------------------
// Login
// ---------------------------
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

// ---------------------------
// Get Profile
// ---------------------------
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// ---------------------------
// Update Profile (requires currentPassword for confirmation)
// Route: PUT /api/user/profile
// Access: Private
// Body:
//   currentPassword: string (required)
//   name, email, mobile (optional)
//   newPassword (optional)
//   (optional) file upload in req.file (profile photo)
// ---------------------------
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { currentPassword, name, email, mobile, newPassword } = req.body;

  // Confirm current password for any profile updates
  if (!currentPassword) {
    res.status(400);
    throw new Error('Current password is required to confirm profile changes');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Email change: ensure uniqueness
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error('Email is already taken by another account');
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (mobile !== undefined) user.mobile = mobile;

  // Profile photo upload if provided
  if (req.file && req.file.buffer) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      user.profilePhoto = uploadResult.secure_url;
    } catch (uploadError) {
      console.error(
        'Cloudinary upload error during update:',
        uploadError.message
      );
      res.status(500);
      throw new Error('Failed to upload new profile photo');
    }
  }

  // Change password if requested
  if (newPassword) {
    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('New password must be at least 8 characters long');
    }
    user.password = newPassword; // assuming User model pre-save hashes it
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    mobile: updatedUser.mobile,
    profilePhoto: updatedUser.profilePhoto,
    role: updatedUser.role,
    token: generateToken(updatedUser._id), // refresh token after changes
  });
});

// ---------------------------
// Delete Profile (requires currentPassword for confirmation)
// Route: DELETE /api/user/profile
// Access: Private
// Body: { currentPassword: string }
// ---------------------------
const deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { currentPassword } = req.body;
  if (!currentPassword) {
    res.status(400);
    throw new Error('Current password is required to confirm account deletion');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // ✅ Delete the user using Mongoose v7-compatible method
  await User.findByIdAndDelete(req.user.id);

  console.log(`🗑️ User deleted successfully: ${user.email}`);

  res.status(200).json({ message: 'User account deleted successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
