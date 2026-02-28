import Note from '../models/Note.js';
import NoteVersion from '../models/NoteVersion.js';
import { generateEmbedding } from '../services/embeddingService.js';

// @desc    Get all notes
// @route   GET /api/notes
export const getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-updatedAt', tag, collection, search, favorite, pinned } = req.query;

    const query = { userId: req.user._id, isDeleted: false };

    if (tag) query.tags = tag;
    if (collection) query.collectionId = collection;
    if (favorite === 'true') query.isFavorite = true;
    if (pinned === 'true') query.isPinned = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .select('-embedding -htmlContent')
      .populate('tags', 'name color')
      .populate('collectionId', 'name icon color')
      .populate('userId', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isDeleted: false })
      .populate('tags', 'name color')
      .populate('collectionId', 'name icon color')
      .populate('linkedNotes', 'title')
      .populate('backlinks', 'title')
      .populate('collaborators.userId', 'name avatar email')
      .populate('userId', 'name avatar');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Check access
    const isOwner = note.userId._id.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(
      (c) => c.userId._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && !note.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create note
// @route   POST /api/notes
export const createNote = async (req, res, next) => {
  try {
    const { title, content, htmlContent, tags, collectionId } = req.body;

    const note = await Note.create({
      title: title || 'Untitled',
      content: content || '',
      htmlContent: htmlContent || '',
      tags: tags || [],
      collectionId: collectionId || null,
      userId: req.user._id,
    });

    // Generate embedding asynchronously (don't block response)
    if (content && content.length > 10) {
      generateEmbedding(`${title} ${content}`).then((embedding) => {
        if (embedding.length > 0) {
          Note.findByIdAndUpdate(note._id, { embedding }).catch(console.error);
        }
      });
    }

    const populated = await note.populate([
      { path: 'tags', select: 'name color' },
      { path: 'collectionId', select: 'name icon color' },
    ]);

    res.status(201).json({ success: true, data: { note: populated } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Save version before updating
    const versionCount = await NoteVersion.countDocuments({ noteId: note._id });
    await NoteVersion.create({
      noteId: note._id,
      title: note.title,
      content: note.content,
      htmlContent: note.htmlContent,
      editedBy: req.user._id,
      versionNumber: versionCount + 1,
    });

    const { title, content, htmlContent, tags, collectionId } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (htmlContent !== undefined) note.htmlContent = htmlContent;
    if (tags !== undefined) note.tags = tags;
    if (collectionId !== undefined) note.collectionId = collectionId;
    note.lastEditedBy = req.user._id;

    await note.save();

    // Re-generate embedding if content changed
    if (content && content.length > 10) {
      generateEmbedding(`${note.title} ${content}`).then((embedding) => {
        if (embedding.length > 0) {
          Note.findByIdAndUpdate(note._id, { embedding }).catch(console.error);
        }
      });
    }

    // Parse bi-directional links [[note-name]]
    const linkPattern = /\[\[([^\]]+)\]\]/g;
    const linkedTitles = [];
    let match;
    while ((match = linkPattern.exec(content || '')) !== null) {
      linkedTitles.push(match[1]);
    }

    if (linkedTitles.length > 0) {
      const linkedNotes = await Note.find({
        userId: req.user._id,
        title: { $in: linkedTitles },
        isDeleted: false,
      }).select('_id');

      note.linkedNotes = linkedNotes.map((n) => n._id);
      await note.save();

      // Update backlinks on linked notes
      for (const linked of linkedNotes) {
        await Note.findByIdAndUpdate(linked._id, {
          $addToSet: { backlinks: note._id },
        });
      }
    }

    const updated = await note.populate([
      { path: 'tags', select: 'name color' },
      { path: 'collectionId', select: 'name icon color' },
    ]);

    res.json({ success: true, data: { note: updated } });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete note (move to trash)
// @route   PATCH /api/notes/:id/trash
export const trashNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore note from trash
// @route   PATCH /api/notes/:id/restore
export const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Remove associated versions
    await NoteVersion.deleteMany({ noteId: req.params.id });

    // Remove backlinks
    await Note.updateMany({ backlinks: note._id }, { $pull: { backlinks: note._id } });

    res.json({ success: true, message: 'Note permanently deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin
// @route   PATCH /api/notes/:id/pin
export const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.isPinned = !note.isPinned;
    await note.save();
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   PATCH /api/notes/:id/favorite
export const toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.isFavorite = !note.isFavorite;
    await note.save();
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trashed notes
// @route   GET /api/notes/trash
export const getTrashedNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id, isDeleted: true })
      .select('title updatedAt deletedAt')
      .sort('-deletedAt')
      .lean();
    res.json({ success: true, data: { notes } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get note versions
// @route   GET /api/notes/:id/versions
export const getNoteVersions = async (req, res, next) => {
  try {
    const versions = await NoteVersion.find({ noteId: req.params.id })
      .populate('editedBy', 'name avatar')
      .sort('-versionNumber')
      .limit(20)
      .lean();
    res.json({ success: true, data: { versions } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/notes/stats
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalNotes, totalFavorites, totalPinned, totalTrashed] = await Promise.all([
      Note.countDocuments({ userId, isDeleted: false }),
      Note.countDocuments({ userId, isDeleted: false, isFavorite: true }),
      Note.countDocuments({ userId, isDeleted: false, isPinned: true }),
      Note.countDocuments({ userId, isDeleted: true }),
    ]);

    // Activity heatmap: notes per day for last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activity = await Note.aggregate([
      { $match: { userId, createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total words
    const wordStats = await Note.aggregate([
      { $match: { userId, isDeleted: false } },
      { $group: { _id: null, totalWords: { $sum: '$wordCount' } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalNotes,
          totalFavorites,
          totalPinned,
          totalTrashed,
          totalWords: wordStats[0]?.totalWords || 0,
          activity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get graph data (notes + connections)
// @route   GET /api/notes/graph
export const getGraphData = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id, isDeleted: false })
      .select('title tags linkedNotes backlinks collectionId')
      .populate('tags', 'name color')
      .lean();

    const nodes = notes.map((n) => ({
      id: n._id,
      title: n.title,
      tags: n.tags,
      connections: (n.linkedNotes?.length || 0) + (n.backlinks?.length || 0),
    }));

    const links = [];
    notes.forEach((note) => {
      (note.linkedNotes || []).forEach((targetId) => {
        links.push({ source: note._id, target: targetId });
      });
    });

    res.json({ success: true, data: { nodes, links } });
  } catch (error) {
    next(error);
  }
};
