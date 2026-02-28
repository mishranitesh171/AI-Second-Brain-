import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters'],
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;
