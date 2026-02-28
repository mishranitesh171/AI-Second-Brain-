import mongoose from 'mongoose';
import Note from '../models/Note.js';
import { generateEmbedding } from './embeddingService.js';
import { askQuestion } from './aiService.js';

/**
 * RAG Pipeline:
 * 1. Convert user query → embedding vector
 * 2. MongoDB Atlas $vectorSearch → find semantically similar notes
 * 3. Build context from retrieved notes
 * 4. Send context + question to Gemini for grounded answer
 */
export const ragQuery = async (userId, question) => {
  // Step 1: Generate query embedding
  const queryEmbedding = await generateEmbedding(question);

  let relevantNotes = [];

  if (queryEmbedding.length > 0) {
    // Step 2: Vector search for semantically similar notes
    try {
      relevantNotes = await Note.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 5,
            filter: {
              userId: new mongoose.Types.ObjectId(userId),
              isDeleted: false,
            },
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]);
    } catch (err) {
      console.log('Vector search not available, falling back to text search');
    }
  }

  // Fallback: text search if vector search unavailable
  if (relevantNotes.length === 0) {
    relevantNotes = await Note.find(
      {
        userId,
        isDeleted: false,
        $text: { $search: question },
      },
      { score: { $meta: 'textScore' }, title: 1, content: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .lean();
  }

  // If still nothing, do basic keyword search
  if (relevantNotes.length === 0) {
    const keywords = question.split(' ').filter((w) => w.length > 3);
    if (keywords.length > 0) {
      const regex = new RegExp(keywords.join('|'), 'i');
      relevantNotes = await Note.find({
        userId,
        isDeleted: false,
        $or: [{ title: regex }, { content: regex }],
      })
        .select('title content')
        .limit(5)
        .lean();
    }
  }

  if (relevantNotes.length === 0) {
    return {
      answer: "I couldn't find any relevant notes to answer your question. Try adding more notes on this topic!",
      sources: [],
    };
  }

  // Step 3: Build context
  const context = relevantNotes
    .map(
      (note, i) =>
        `[Note ${i + 1}: "${note.title}"]\n${note.content
          .replace(/<[^>]*>/g, '')
          .slice(0, 1500)}`
    )
    .join('\n\n---\n\n');

  // Step 4: Generate grounded answer
  const answer = await askQuestion(question, context);

  const sources = relevantNotes.map((n) => ({
    id: n._id,
    title: n.title,
    score: n.score || null,
  }));

  return { answer, sources };
};

/**
 * Semantic search: find notes similar to query text
 */
export const semanticSearch = async (userId, query, limit = 10) => {
  const queryEmbedding = await generateEmbedding(query);

  if (queryEmbedding.length > 0) {
    try {
      const results = await Note.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit,
            filter: {
              userId: new mongoose.Types.ObjectId(userId),
              isDeleted: false,
            },
          },
        },
        {
          $project: {
            title: 1,
            content: { $substrCP: ['$content', 0, 200] },
            tags: 1,
            updatedAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]);

      if (results.length > 0) return results;
    } catch (err) {
      console.log('Vector search fallback to text search');
    }
  }

  // Fallback to text search
  return Note.find(
    { userId, isDeleted: false, $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .select('title content tags updatedAt')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('tags', 'name color')
    .lean();
};

export default { ragQuery, semanticSearch };
