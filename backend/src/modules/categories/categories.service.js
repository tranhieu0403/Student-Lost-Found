const { pool } = require('../../config/db');

exports.list = async () => {
  const [rows] = await pool.query(
    'SELECT id, name FROM categories ORDER BY id ASC'
  );
  return rows;
};

exports.resolveCategoryId = async (categoryId) => {
  if (!categoryId) return null;
  const [rows] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [
    categoryId,
  ]);
  return rows.length > 0 ? rows[0].id : null;
};
