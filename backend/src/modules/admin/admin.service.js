const { pool } = require('../../config/db');

exports.stats = async () => {
  const [summaryRows] = await pool.query(
    `SELECT
      (SELECT COUNT(id) FROM posts WHERE post_type = 'lost' AND is_deleted = 0) AS totalLostPosts,
      (SELECT COUNT(id) FROM posts WHERE post_type = 'found' AND is_deleted = 0) AS totalFoundPosts,
      (SELECT COUNT(id) FROM posts WHERE status = 'resolved' AND is_deleted = 0) AS resolvedPosts,
      (SELECT COUNT(id) FROM users WHERE role = 'student') AS totalUsers,
      (SELECT COUNT(id) FROM matches) AS totalMatches`
  );

  const [recentActivity] = await pool.query(
    `SELECT
      DATE(p.created_at) AS date,
      SUM(CASE WHEN p.post_type = 'lost' THEN 1 ELSE 0 END) AS lost_count,
      SUM(CASE WHEN p.post_type = 'found' THEN 1 ELSE 0 END) AS found_count
     FROM posts p
     WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(p.created_at)
     ORDER BY DATE(p.created_at)`
  );

  const summary = summaryRows[0];
  const totalPostCount = Number(summary.totalLostPosts) + Number(summary.totalFoundPosts);
  const successRate = totalPostCount === 0 ? '0.0' : ((Number(summary.resolvedPosts) / totalPostCount) * 100).toFixed(1);

  return {
    totalLostPosts: Number(summary.totalLostPosts),
    totalFoundPosts: Number(summary.totalFoundPosts),
    resolvedPosts: Number(summary.resolvedPosts),
    successRate,
    totalUsers: Number(summary.totalUsers),
    totalMatches: Number(summary.totalMatches),
    recentActivity,
  };
};

exports.listUsers = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const whereClauses = [];
  const params = [];
  if (query.role) {
    whereClauses.push('role = ?');
    params.push(query.role);
  }
  if (query.is_locked !== undefined) {
    whereClauses.push('is_locked = ?');
    params.push(Number(query.is_locked));
  }
  if (query.search) {
    whereClauses.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [users] = await pool.query(
    `SELECT id, name, email, role, is_locked, created_at
     FROM users
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(id) AS total FROM users ${whereSql}`,
    params
  );

  return {
    users,
    total: countRows[0].total,
    page,
    totalPages: Math.ceil(countRows[0].total / limit) || 1,
  };
};

exports.setUserLockStatus = async (id, isLocked) => {
  await pool.query('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked ? 1 : 0, id]);
  const [users] = await pool.query(
    'SELECT id, name, email, role, is_locked, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  if (users.length === 0) {
    const err = new Error('Không tìm thấy người dùng');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return users[0];
};

exports.listPosts = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const [posts] = await pool.query(
    `SELECT
      p.id, p.user_id, p.category_id, p.post_type, p.title, p.location, p.incident_date, p.status, p.is_deleted, p.created_at,
      u.name AS owner_name
     FROM posts p
     INNER JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [countRows] = await pool.query('SELECT COUNT(id) AS total FROM posts');
  return {
    posts,
    total: countRows[0].total,
    page,
    totalPages: Math.ceil(countRows[0].total / limit) || 1,
  };
};

exports.removePost = async (id) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [id]);
  return { deleted: true };
};
