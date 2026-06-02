require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const initializeDatabase = require('./database/init');

const PORT = process.env.PORT || 5000;

let server;

async function bootstrap() {
  await testConnection();
  if (process.env.NODE_ENV === 'development') {
    await initializeDatabase();
  }

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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
