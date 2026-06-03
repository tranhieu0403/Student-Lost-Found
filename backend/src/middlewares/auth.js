const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

module.exports = async function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Chưa đăng nhập');
    err.status = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, email, role, is_locked FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );

    const user = rows[0];
    if (!user) {
      const err = new Error('Không tìm thấy người dùng');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    if (Number(user.is_locked) === 1) {
      const err = new Error('Tài khoản đã bị khóa');
      err.status = 403;
      err.code = 'ACCOUNT_LOCKED';
      return next(err);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    const err = new Error(error.message || 'Token không hợp lệ');
    err.status = 401;
    err.name = error.name;
    next(err);
  }
};
