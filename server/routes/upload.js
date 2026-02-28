import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // For now, return local file path. In production, use Cloudinary.
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
