const path = require('path');

// Ưu tiên .env ở root repo (docker-compose), sau đó backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const initializeDatabase = require('./database/init');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Token invalid'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  socket.join(`user:${userId}`);
  console.log(`Socket connected: user ${userId}`);

  socket.on('send_message', async ({ receiverId, content }) => {
    if (!receiverId || !content?.trim()) return;

    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      const message = await chatService.sendMessageSocket(userId, receiverId, content.trim());

      socket.emit('new_message', message);
      io.to(`user:${receiverId}`).emit('new_message', message);
      socket.emit('conversation_updated');
      io.to(`user:${receiverId}`).emit('conversation_updated');
    } catch (err) {
      socket.emit('message_error', { message: err.message });
    }
  });

  socket.on('mark_read', async ({ partnerId }) => {
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.markAsRead(userId, partnerId);
      io.to(`user:${partnerId}`).emit('messages_read', { readBy: userId });
    } catch {}
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: user ${userId}`);
  });
});

let server;

async function bootstrap() {
  await testConnection();
  if (process.env.NODE_ENV === 'development') {
    await initializeDatabase();
  }

  server = httpServer.listen(PORT, () => {
    console.log(`Server + WebSocket running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap server:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server gracefully...');
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = { io, httpServer };
