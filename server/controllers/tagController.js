import Tag from '../models/Tag.js';

export const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ userId: req.user._id }).sort('name').lean();
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.create({ name, color, userId: req.user._id });
    res.status(201).json({ success: true, data: { tag } });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.json({ success: true, data: { tag } });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    next(error);
  }
};
