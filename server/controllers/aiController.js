import { summarizeText, expandText, rewriteText, suggestTags, generateWritingSuggestion } from '../services/aiService.js';
import { ragQuery, semanticSearch } from '../services/ragService.js';
import { clipWebPage } from '../services/webClipperService.js';
import Note from '../models/Note.js';

// @desc    Summarize text
// @route   POST /api/ai/summarize
export const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const summary = await summarizeText(text);
    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

// @desc    Expand text
// @route   POST /api/ai/expand
export const expand = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const expanded = await expandText(text);
    res.json({ success: true, data: { expanded } });
  } catch (error) {
    next(error);
  }
};

// @desc    Rewrite text
// @route   POST /api/ai/rewrite
export const rewrite = async (req, res, next) => {
  try {
    const { text, tone = 'professional' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const rewritten = await rewriteText(text, tone);
    res.json({ success: true, data: { rewritten } });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Q&A (RAG pipeline)
// @route   POST /api/ai/ask
export const ask = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    const result = await ragQuery(req.user._id, question);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest tags
// @route   POST /api/ai/suggest-tags
export const autoTag = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const tags = await suggestTags(text);
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};

// @desc    Smart semantic search
// @route   GET /api/ai/search
export const smartSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

    const results = await semanticSearch(req.user._id, q, parseInt(limit));
    res.json({ success: true, data: { results } });
  } catch (error) {
    next(error);
  }
};

// @desc    Web clipper
// @route   POST /api/ai/clip
export const webClip = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const clipped = await clipWebPage(url);

    // Auto-create note from clipped content
    const note = await Note.create({
      title: clipped.title,
      content: clipped.content,
      aiSummary: clipped.summary,
      aiTags: clipped.tags,
      userId: req.user._id,
    });

    res.json({ success: true, data: { note, clipped } });
  } catch (error) {
    next(error);
  }
};

// @desc    Writing suggestion
// @route   POST /api/ai/suggest
export const writingSuggestion = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const suggestion = await generateWritingSuggestion(text);
    res.json({ success: true, data: { suggestion } });
  } catch (error) {
    next(error);
  }
};

// @desc    Find auto-links between notes
// @route   GET /api/ai/auto-link/:noteId
export const autoLink = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, userId: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Use semantic search to find related notes
    const related = await semanticSearch(req.user._id, `${note.title} ${note.content.slice(0, 500)}`, 5);

    // Filter out the current note
    const suggestions = related.filter((r) => r._id.toString() !== note._id.toString());

    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    next(error);
  }
};
