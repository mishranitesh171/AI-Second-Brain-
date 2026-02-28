import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

export const summarizeText = async (text) => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Summarize the following text concisely in 2-3 sentences. Keep the key ideas:\n\n${text}`
  );
  return result.response.text();
};

export const expandText = async (text) => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Expand the following bullet points or brief text into detailed, well-structured paragraphs. Maintain the original meaning:\n\n${text}`
  );
  return result.response.text();
};

export const rewriteText = async (text, tone = 'professional') => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Rewrite the following text in a ${tone} tone. Keep the meaning intact:\n\n${text}`
  );
  return result.response.text();
};

export const askQuestion = async (question, context) => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `You are an AI assistant for a knowledge management app called "AI Second Brain". 
Answer the user's question ONLY based on the provided context from their notes.
If the answer is not in the context, say "I couldn't find relevant information in your notes."
Always cite which note the information came from.

CONTEXT FROM USER'S NOTES:
${context}

USER'S QUESTION: ${question}

ANSWER:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const suggestTags = async (text) => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Analyze the following text and suggest 3-5 relevant tags (single words or short phrases). Return ONLY a JSON array of strings, nothing else:\n\n${text}`
  );
  const responseText = result.response.text().trim();
  try {
    const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return responseText.split(',').map((t) => t.trim().replace(/["[\]]/g, ''));
  }
};

export const generateWritingSuggestion = async (text) => {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured');

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Continue writing the following text naturally. Write 1-2 sentences that flow with the existing content:\n\n${text}`
  );
  return result.response.text();
};

export default {
  summarizeText,
  expandText,
  rewriteText,
  askQuestion,
  suggestTags,
  generateWritingSuggestion,
};
