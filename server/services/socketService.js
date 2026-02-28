import { Server } from 'socket.io';

const onlineUsers = new Map(); // noteId -> Set of { socketId, userId, name, color }

const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6',
];

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins a note room for collaboration
    socket.on('join-note', ({ noteId, userId, userName }) => {
      socket.join(noteId);

      const color = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
      const userInfo = { socketId: socket.id, userId, name: userName, color };

      if (!onlineUsers.has(noteId)) {
        onlineUsers.set(noteId, new Map());
      }
      onlineUsers.get(noteId).set(socket.id, userInfo);

      // Broadcast presence to all users in this note
      const users = Array.from(onlineUsers.get(noteId).values());
      io.to(noteId).emit('presence-update', users);

      console.log(`👤 ${userName} joined note ${noteId}`);
    });

    // User leaves a note room
    socket.on('leave-note', ({ noteId }) => {
      socket.leave(noteId);
      if (onlineUsers.has(noteId)) {
        onlineUsers.get(noteId).delete(socket.id);
        const users = Array.from(onlineUsers.get(noteId).values());
        io.to(noteId).emit('presence-update', users);

        if (onlineUsers.get(noteId).size === 0) {
          onlineUsers.delete(noteId);
        }
      }
    });

    // Real-time content updates (Yjs/CRDT-style — delta-based)
    socket.on('note-update', ({ noteId, delta, userId }) => {
      socket.to(noteId).emit('note-update', { delta, userId });
    });

    // Cursor position broadcast
    socket.on('cursor-move', ({ noteId, cursor, userId }) => {
      socket.to(noteId).emit('cursor-move', { cursor, userId });
    });

    // Real-time typing indicator
    socket.on('typing', ({ noteId, userId, userName }) => {
      socket.to(noteId).emit('typing', { userId, userName });
    });

    socket.on('stop-typing', ({ noteId, userId }) => {
      socket.to(noteId).emit('stop-typing', { userId });
    });

    // Comments
    socket.on('new-comment', ({ noteId, comment }) => {
      io.to(noteId).emit('new-comment', comment);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      for (const [noteId, users] of onlineUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const remaining = Array.from(users.values());
          io.to(noteId).emit('presence-update', remaining);

          if (users.size === 0) {
            onlineUsers.delete(noteId);
          }
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initSocket;
