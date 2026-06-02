const { pool } = require('../../config/db');
const matchesService = require('../matches/matches.service');

function toNotFoundError(message = 'Không tìm thấy bài đăng') {
  const err = new Error(message);
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}

async function getPostOwnership(postId) {
  const [rows] = await pool.query(
    'SELECT id, user_id FROM posts WHERE id = ? AND is_deleted = 0 LIMIT 1',
    [postId]
  );
  return rows[0];
}

exports.list = async (filters = {}, currentUser = null) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const whereClauses = ['p.is_deleted = 0'];
  const params = [];

  if (filters.type) {
    whereClauses.push('p.post_type = ?');
    params.push(filters.type);
  }
  if (filters.category_id) {
    whereClauses.push('p.category_id = ?');
    params.push(Number(filters.category_id));
  }
  if (filters.location) {
    whereClauses.push('p.location LIKE ?');
    params.push(`%${filters.location}%`);
  }
  if (filters.status) {
    whereClauses.push('p.status = ?');
    params.push(filters.status);
  }
  if (filters.date_from) {
    whereClauses.push('p.incident_date >= ?');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    whereClauses.push('p.incident_date <= ?');
    params.push(filters.date_to);
  }
  if (filters.search) {
    whereClauses.push('MATCH(p.title, p.description) AGAINST (? IN NATURAL LANGUAGE MODE)');
    params.push(filters.search);
  }
  if (String(filters.mine).toLowerCase() === 'true') {
    if (!currentUser?.id) {
      const err = new Error('Chua dang nhap');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }
    whereClauses.push('p.user_id = ?');
    params.push(currentUser.id);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

  const [posts] = await pool.query(
    `SELECT
      p.id, p.user_id, p.category_id, p.post_type, p.title, p.description, p.location, p.incident_date,
      p.status, p.created_at,
      u.name AS owner_name,
      c.name AS category_name,
      GROUP_CONCAT(i.image_url ORDER BY i.id SEPARATOR '||') AS image_urls
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN images i ON i.post_id = p.id
    ${whereSql}
    GROUP BY p.id, p.user_id, p.category_id, p.post_type, p.title, p.description, p.location, p.incident_date,
      p.status, p.created_at, u.name, c.name
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(p.id) AS total
     FROM posts p
     ${whereSql}`,
    params
  );

  return {
    posts: posts.map((post) => ({
      ...post,
      type: post.post_type,
      date: post.incident_date,
      image_urls: post.image_urls ? post.image_urls.split('||') : [],
      images: post.image_urls ? post.image_urls.split('||') : [],
    })),
    total: countRows[0].total,
    page,
    totalPages: Math.ceil(countRows[0].total / limit) || 1,
  };
};

exports.detail = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      p.id, p.user_id, p.category_id, p.post_type, p.title, p.description, p.location, p.incident_date,
      p.status, p.created_at,
      u.name AS owner_name, u.email AS owner_email,
      c.name AS category_name,
      i.image_url
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN images i ON i.post_id = p.id
    WHERE p.id = ? AND p.is_deleted = 0
    ORDER BY i.id`,
    [id]
  );

  if (rows.length === 0) {
    throw toNotFoundError();
  }

  const first = rows[0];
  return {
    id: first.id,
    user_id: first.user_id,
    category_id: first.category_id,
    category_name: first.category_name,
    post_type: first.post_type,
    type: first.post_type,
    title: first.title,
    description: first.description,
    location: first.location,
    incident_date: first.incident_date,
    date: first.incident_date,
    status: first.status,
    created_at: first.created_at,
    user: {
      id: first.user_id,
      name: first.owner_name,
      email: first.owner_email,
    },
    images: rows.filter((row) => row.image_url).map((row) => row.image_url),
  };
};

exports.create = async (userId, payload) => {
  const [result] = await pool.query(
    `INSERT INTO posts (user_id, category_id, post_type, title, description, location, incident_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'searching')`,
    [
      userId,
      payload.category_id || null,
      payload.post_type,
      payload.title,
      payload.description || null,
      payload.location || null,
      payload.incident_date || null,
    ]
  );

  if (Array.isArray(payload.image_urls) && payload.image_urls.length > 0) {
    const imageValues = payload.image_urls.map((url) => [result.insertId, url]);
    await pool.query('INSERT INTO images (post_id, image_url) VALUES ?', [imageValues]);
  }

  void matchesService.findMatches(result.insertId);
  return this.detail(result.insertId);
};

exports.update = async (currentUser, id, payload) => {
  const post = await getPostOwnership(id);
  if (!post) {
    throw toNotFoundError();
  }

  const canModify = currentUser.role === 'admin' || Number(post.user_id) === Number(currentUser.id);
  if (!canModify) {
    const err = new Error('Không có quyền cập nhật bài đăng này');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  await pool.query(
    `UPDATE posts
     SET category_id = ?, post_type = ?, title = ?, description = ?, location = ?, incident_date = ?
     WHERE id = ?`,
    [
      payload.category_id || null,
      payload.post_type,
      payload.title,
      payload.description || null,
      payload.location || null,
      payload.incident_date || null,
      id,
    ]
  );

  await pool.query('DELETE FROM images WHERE post_id = ?', [id]);
  if (Array.isArray(payload.image_urls) && payload.image_urls.length > 0) {
    const imageValues = payload.image_urls.map((url) => [id, url]);
    await pool.query('INSERT INTO images (post_id, image_url) VALUES ?', [imageValues]);
  }

  void matchesService.findMatches(Number(id));
  return this.detail(id);
};

exports.updateStatus = async (userId, id, status) => {
  const post = await getPostOwnership(id);
  if (!post) {
    throw toNotFoundError();
  }
  if (Number(post.user_id) !== Number(userId)) {
    const err = new Error('Chỉ chủ bài đăng mới được cập nhật trạng thái');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  await pool.query('UPDATE posts SET status = ? WHERE id = ?', [status, id]);
  return this.detail(id);
};

exports.remove = async (currentUser, id) => {
  const post = await getPostOwnership(id);
  if (!post) {
    throw toNotFoundError();
  }
  const canDelete = currentUser.role === 'admin' || Number(post.user_id) === Number(currentUser.id);
  if (!canDelete) {
    const err = new Error('Không có quyền xóa bài đăng này');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  await pool.query('UPDATE posts SET is_deleted = 1 WHERE id = ?', [id]);
  return null;
};
