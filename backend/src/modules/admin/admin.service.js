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

  const [dailyStats] = await pool.query(
    `SELECT
      DATE(p.created_at) AS date,
      SUM(CASE WHEN p.post_type = 'lost' THEN 1 ELSE 0 END) AS lost_count,
      SUM(CASE WHEN p.post_type = 'found' THEN 1 ELSE 0 END) AS found_count
     FROM posts p
     WHERE p.is_deleted = 0 AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
     GROUP BY DATE(p.created_at)
     ORDER BY DATE(p.created_at)`
  );

  const [categoryStats] = await pool.query(
    `SELECT
      COALESCE(c.name, 'Khác') AS name,
      COUNT(p.id) AS count
     FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_deleted = 0
     GROUP BY COALESCE(c.name, 'Khác')
     ORDER BY count DESC`
  );

  const [recentPosts] = await pool.query(
    `SELECT
      p.id, p.title, p.post_type AS type, p.created_at,
      u.name AS user_name
     FROM posts p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = 0
     ORDER BY p.created_at DESC
     LIMIT 10`
  );

  const summary = summaryRows[0];
  const totalLostPosts = Number(summary.totalLostPosts);
  const totalFoundPosts = Number(summary.totalFoundPosts);
  const totalPostCount = totalLostPosts + totalFoundPosts;
  const resolvedPosts = Number(summary.resolvedPosts);
  const successRate = totalPostCount === 0
    ? '0.0'
    : ((resolvedPosts / totalPostCount) * 100).toFixed(1);

  return {
    totalPosts: totalPostCount,
    totalLostPosts,
    totalFoundPosts,
    resolvedPosts,
    resolved_posts: resolvedPosts,
    successRate,
    success_rate: successRate,
    totalUsers: Number(summary.totalUsers),
    totalMatches: Number(summary.totalMatches),
    dailyStats,
    categoryStats,
    recentPosts,
    recentActivity: dailyStats,
  };
};

exports.listUsers = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const whereClauses = [];
  const params = [];
  if (query.role) {
    whereClauses.push('u.role = ?');
    params.push(query.role);
  }
  if (query.is_locked !== undefined && query.is_locked !== '') {
    whereClauses.push('u.is_locked = ?');
    params.push(Number(query.is_locked));
  }
  if (query.search) {
    whereClauses.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [users] = await pool.query(
    `SELECT
      u.id, u.name, u.email, u.role, u.is_locked, u.created_at,
      (SELECT COUNT(p.id) FROM posts p WHERE p.user_id = u.id) AS post_count
     FROM users u
     ${whereSql}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(u.id) AS total FROM users u ${whereSql}`,
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

  const whereClauses = [];
  const params = [];

  if (query.type) {
    whereClauses.push('p.post_type = ?');
    params.push(query.type);
  }
  if (query.status) {
    whereClauses.push('p.status = ?');
    params.push(query.status);
  }
  if (query.search) {
    whereClauses.push('(p.title LIKE ? OR u.name LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.include_deleted === '1' || query.include_deleted === 'true') {
    if (query.deleted_only === '1' || query.deleted_only === 'true') {
      whereClauses.push('p.is_deleted = 1');
    }
  } else {
    whereClauses.push('p.is_deleted = 0');
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [posts] = await pool.query(
    `SELECT
      p.id, p.title, p.post_type AS type, p.status, p.is_deleted, p.created_at,
      COALESCE(c.name, 'Khác') AS category,
      u.name AS user_name
     FROM posts p
     INNER JOIN users u ON u.id = p.user_id
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(p.id) AS total
     FROM posts p
     INNER JOIN users u ON u.id = p.user_id
     ${whereSql}`,
    params
  );

  return {
    posts,
    total: countRows[0].total,
    page,
    totalPages: Math.ceil(countRows[0].total / limit) || 1,
  };
};

exports.removePost = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM matches WHERE lost_post_id = ? OR found_post_id = ?',
      [id, id]
    );
    await connection.query('UPDATE messages SET post_id = NULL WHERE post_id = ?', [id]);
    await connection.query('DELETE FROM posts WHERE id = ?', [id]);

    await connection.commit();
    return { deleted: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
