const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const authRoutes = require('./modules/auth/auth.routes');
const postsRoutes = require('./modules/posts/posts.routes');
const matchesRoutes = require('./modules/matches/matches.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const errorHandler = require('./middlewares/errorHandler');
const healthCheck = require('./utils/healthCheck');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', healthCheck);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
