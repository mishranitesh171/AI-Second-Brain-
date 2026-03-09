import express from 'express';
import { summarize, expand, rewrite, ask, autoTag, smartSearch, webClip, writingSuggestion, autoLink, imageAnalysis } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/summarize', summarize);
router.post('/expand', expand);
router.post('/rewrite', rewrite);
router.post('/ask', ask);
router.post('/suggest-tags', autoTag);
router.get('/search', smartSearch);
router.post('/clip', webClip);
router.post('/suggest', writingSuggestion);
router.get('/auto-link/:noteId', autoLink);
router.post('/analyze-image', upload.single('image'), imageAnalysis);

export default router;
