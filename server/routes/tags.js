import express from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getTags).post(createTag);
router.route('/:id').put(updateTag).delete(deleteTag);

export default router;
