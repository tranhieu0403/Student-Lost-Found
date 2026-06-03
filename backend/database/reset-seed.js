/**
 * Reset database về dữ liệu mẫu trong seed.sql
 * Chạy: npm run db:seed (từ thư mục backend)
 *
 * Dùng 1 connection duy nhất — SET FOREIGN_KEY_CHECKS phải cùng session
 * với TRUNCATE (pool.query() mỗi lần có thể lấy connection khác).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../src/config/db');

function stripSqlComments(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
}

async function runSqlFile(connection, filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => stripSqlComments(s))
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function resetSeed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const connection = await pool.getConnection();

  try {
    console.log('Đang nạp lại seed.sql...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await runSqlFile(connection, seedPath);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Hoàn tất. Dữ liệu mẫu đã được load lại.');
  } finally {
    connection.release();
    process.exit(0);
  }
}

resetSeed().catch((error) => {
  console.error('Reset seed thất bại:', error.message);
  process.exit(1);
});
