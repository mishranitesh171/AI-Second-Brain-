# 🧠 AI Second Brain

> AI-powered knowledge management platform with RAG search, real-time collaboration, and interactive knowledge graph.

![MERN](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Features

### 🤖 AI-Powered
- **RAG Q&A** — Ask questions about your notes, AI retrieves relevant context via vector search
- **AI Summarize / Expand / Rewrite** — One-click content transformation
- **Smart Semantic Search** — Find notes by meaning, not just keywords
- **AI Web Clipper** — Paste URL → auto-scrape, summarize, and save
- **AI Auto-Tag** — Suggest tags based on content analysis
- **AI Writing Assistant** — Continue writing with AI suggestions

### 📝 Rich Editor
- Rich text editing with React Quill
- Auto-save with debounce
- Bi-directional links (`[[note-name]]`)
- Version history
- Code blocks, lists, images

### ⚡ Real-Time Collaboration
- Socket.IO powered live editing
- Presence awareness (colored cursors)
- Share notes with view/edit permissions
- Live comments

### 📊 Dashboard
- Stats cards (notes, favorites, words written)
- Quick actions
- Recent notes with animations

### 🎨 Premium UI
- Glassmorphism design with glass cards
- Dark / Light theme toggle
- Framer Motion animations
- Fully responsive (Mobile → Tablet → Desktop)
- Mobile bottom navigation

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Editor | React Quill |
| Animations | Framer Motion |
| Styling | Vanilla CSS, CSS Variables |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI | Google Gemini API |
| Vector Search | MongoDB Atlas Vector Search |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh tokens) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (free from [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ai-second-brain

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Copy and edit server/.env
cp .env.example server/.env
# Add your MONGODB_URI and GEMINI_API_KEY
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit `http://localhost:5173` 🚀

## 📁 Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/          # Axios + JWT auto-refresh
│       ├── components/   # Layout, Editor, Common
│       ├── context/      # Auth, Theme
│       ├── pages/        # Dashboard, Notes, Editor, AI, Trash, Settings
│       └── styles/       # Design system
│
├── server/          # Express backend
│   ├── config/      # MongoDB, Passport
│   ├── controllers/ # Auth, Notes, AI, Collections, Tags
│   ├── middleware/   # JWT auth, Error handler, Multer
│   ├── models/      # User, Note, Collection, Tag, NoteVersion
│   ├── routes/      # All API routes
│   └── services/    # AI, Embeddings, RAG, Socket.IO, Web Clipper
```

## 🌐 Deployment

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Frontend | Vercel | Unlimited deploys |
| Backend | Render | Free web service |
| Database | MongoDB Atlas | 512MB free |

## 📄 License

MIT © Nitesh Kumar
