import express from 'express';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getCollections).post(createCollection);
router.route('/:id').put(updateCollection).delete(deleteCollection);

export default router;
