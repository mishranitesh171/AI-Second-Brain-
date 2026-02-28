import express from 'express';
import {
  getNotes, getNote, createNote, updateNote, trashNote, restoreNote,
  deleteNote, togglePin, toggleFavorite, getTrashedNotes, getNoteVersions,
  getStats, getGraphData,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/graph', getGraphData);
router.get('/trash', getTrashedNotes);

router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);

router.patch('/:id/pin', togglePin);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/trash', trashNote);
router.patch('/:id/restore', restoreNote);
router.get('/:id/versions', getNoteVersions);

export default router;
