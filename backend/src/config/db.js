const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  timezone: '+07:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection(maxRetries = 10, retryDelayMs = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.query('SELECT 1');
        console.log('Database connected successfully.');
        return;
      } finally {
        connection.release();
      }
    } catch (error) {
      lastError = error;
      console.warn(`Database connection attempt ${attempt}/${maxRetries} failed.`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw lastError;
}

module.exports = {
  pool,
  testConnection,
};
