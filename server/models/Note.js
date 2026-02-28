import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    htmlContent: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // AI-generated fields
    aiSummary: {
      type: String,
      default: '',
    },
    aiTags: [String],
    // Vector embedding for semantic search (RAG)
    embedding: {
      type: [Number],
      default: [],
      index: false, // Atlas Vector Search handles indexing
    },
    // Bi-directional links
    linkedNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    backlinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    // Collaboration
    collaborators: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareLink: {
      type: String,
      default: null,
    },
    // Attachments
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Metadata
    wordCount: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for full-text search
noteSchema.index({ title: 'text', content: 'text' });

// Compound index for efficient queries
noteSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

// Pre-save: calculate word count & read time
noteSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
    this.readTime = Math.ceil(this.wordCount / 200); // avg 200 wpm
  }
  next();
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
