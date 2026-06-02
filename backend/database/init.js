const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../src/config/db');

async function runSqlFile(filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath = path.join(__dirname, 'seed.sql');

  await runSqlFile(schemaPath);

  const [rows] = await pool.query('SELECT COUNT(id) AS total FROM users');
  if (Number(rows[0].total) === 0) {
    await runSqlFile(seedPath);
  }
}

module.exports = initializeDatabase;
