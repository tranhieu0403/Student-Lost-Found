const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
}).array('images', 5);

exports.uploadImages = (req, res, next) => {
  upload(req, res, (error) => {
    const uploadedFiles = req.files || [];
    const imageUrls = uploadedFiles.map((file) => `/uploads/${file.filename}`);

    if (error && imageUrls.length === 0) {
      error.status = 400;
      return next(error);
    }

    return res.status(201).json({
      success: true,
      data: {
        imageUrls,
        uploadedCount: imageUrls.length,
        hasPartialFailure: Boolean(error),
      },
      message: error
        ? 'Một số ảnh upload thất bại, đã trả về các ảnh thành công.'
        : 'Upload ảnh thành công',
    });
  });
};
