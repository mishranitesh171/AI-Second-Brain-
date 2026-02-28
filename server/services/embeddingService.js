import { GoogleGenerativeAI } from '@google/generative-ai';

let embeddingModel = null;

const getEmbeddingModel = () => {
  if (!embeddingModel && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }
  return embeddingModel;
};

/**
 * Generate embedding vector for a given text
 * Returns array of 768 numbers (dimensions)
 */
export const generateEmbedding = async (text) => {
  const model = getEmbeddingModel();
  if (!model) {
    console.log('ℹ️  Embedding model not available (no API key)');
    return [];
  }

  try {
    // Clean text: remove HTML, limit length
    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000); // Gemini embedding limit

    if (!cleanText || cleanText.length < 10) return [];

    const result = await model.embedContent(cleanText);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return [];
  }
};

/**
 * Generate embeddings for multiple texts (batch)
 */
export const generateBatchEmbeddings = async (texts) => {
  const results = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }
  return results;
};

export default { generateEmbedding, generateBatchEmbeddings };
