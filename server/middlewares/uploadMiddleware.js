const multer = require('multer');
const path = require('path');

// ✅ File filter for image types only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files (jpg, jpeg, png, webp) are allowed!'),
      false
    );
  }
};

// ✅ Use memory storage for direct cloud uploads
const storage = multer.memoryStorage();

// ✅ Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
});

// ✅ Optional: Middleware to catch Multer-specific errors gracefully
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Max allowed size is 2MB.',
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Unknown errors (e.g., wrong file type)
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, uploadErrorHandler };
