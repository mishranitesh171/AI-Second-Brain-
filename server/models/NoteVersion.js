import mongoose from 'mongoose';

const noteVersionSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    htmlContent: { type: String, default: '' },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

noteVersionSchema.index({ noteId: 1, versionNumber: -1 });

const NoteVersion = mongoose.model('NoteVersion', noteVersionSchema);
export default NoteVersion;
