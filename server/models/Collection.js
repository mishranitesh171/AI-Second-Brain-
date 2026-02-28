import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    icon: {
      type: String,
      default: '📁',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },
  },
  { timestamps: true }
);

collectionSchema.index({ userId: 1, parentId: 1 });

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
