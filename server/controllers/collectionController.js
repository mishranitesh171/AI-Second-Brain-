import Collection from '../models/Collection.js';

export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ userId: req.user._id }).sort('name').lean();
    res.json({ success: true, data: { collections } });
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const { name, description, icon, color, parentId } = req.body;
    const collection = await Collection.create({
      name, description, icon, color, parentId, userId: req.user._id,
    });
    res.status(201).json({ success: true, data: { collection } });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.json({ success: true, data: { collection } });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    next(error);
  }
};
