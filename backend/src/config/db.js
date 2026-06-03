const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection(maxRetries = 20, retryDelayMs = 3000) {
  const host = process.env.DB_HOST || '(missing DB_HOST)';
  const port = Number(process.env.DB_PORT) || 3306;
  const database = process.env.DB_NAME || '(missing DB_NAME)';
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.query('SELECT 1');
        if (attempt > 1) {
          console.log(`Database connected successfully (attempt ${attempt}/${maxRetries}).`);
        } else {
          console.log('Database connected successfully.');
        }
        return;
      } finally {
        connection.release();
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `Database connection attempt ${attempt}/${maxRetries} failed (${host}:${port}/${database}).`
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  const hint =
    host === 'db'
      ? ' Backend chạy ngoài Docker thì đặt DB_HOST=localhost trong .env.'
      : '';
  const err = new Error(
    `Không kết nối được MySQL sau ${maxRetries} lần thử.${hint} Chi tiết: ${lastError.message}`
  );
  err.cause = lastError;
  throw err;
}

module.exports = {
  pool,
  testConnection,
};
