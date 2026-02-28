import mongoose from 'mongoose';

const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Create vector search index if it doesn't exist
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'notes' }).toArray();

      if (collections.length > 0) {
        try {
          const notesCollection = db.collection('notes');
          const indexes = await notesCollection.listSearchIndexes().toArray();
          const hasVectorIndex = indexes.some(idx => idx.name === 'vector_index');

          if (!hasVectorIndex) {
            console.log('📊 Creating vector search index...');
            await notesCollection.createSearchIndex({
              name: 'vector_index',
              type: 'vectorSearch',
              definition: {
                fields: [
                  {
                    type: 'vector',
                    path: 'embedding',
                    numDimensions: 768,
                    similarity: 'cosine',
                  },
                ],
              },
            });
            console.log('✅ Vector search index created');
          }
        } catch (err) {
          console.log('ℹ️  Vector search index setup skipped (requires Atlas M10+):', err.message);
        }
      }

      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(res => setTimeout(res, 3000));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Check your connection string and network.');
        process.exit(1);
      }
    }
  }
};

export default connectDB;

