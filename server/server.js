import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { initSocket } from './services/socketService.js';

// Route imports
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import aiRoutes from './routes/ai.js';
import collectionRoutes from './routes/collections.js';
import tagRoutes from './routes/tags.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// AI routes have a stricter rate limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'AI rate limit reached. Please wait a moment.' },
});
app.use('/api/ai/', aiLimiter);

// Body parsing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🧠 AI Second Brain API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`
    🧠 ═══════════════════════════════════════════
       AI Second Brain Server
       Port: ${PORT}
       Mode: ${process.env.NODE_ENV || 'development'}
       Socket.IO: Active
    ═══════════════════════════════════════════ 🧠
    `);
  });
};

startServer();

export { app, httpServer, io };
