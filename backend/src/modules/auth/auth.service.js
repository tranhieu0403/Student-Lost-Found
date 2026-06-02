const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');

function buildUnauthorizedError(message = 'Email hoặc mật khẩu không đúng') {
  const err = new Error(message);
  err.status = 401;
  err.code = 'UNAUTHORIZED';
  return err;
}

exports.register = async ({ name, email, password }) => {
  const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existingUsers.length > 0) {
    const err = new Error('Email đã được sử dụng');
    err.status = 400;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [insertResult] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  const [users] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [insertResult.insertId]
  );

  return users[0];
};

exports.login = async ({ email, password }) => {
  const [users] = await pool.query(
    'SELECT id, name, email, password, role, is_locked, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = users[0];
  if (!user) {
    throw buildUnauthorizedError();
  }

  if (user.is_locked) {
    const err = new Error('Tài khoản đã bị khóa');
    err.status = 403;
    err.code = 'ACCOUNT_LOCKED';
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw buildUnauthorizedError();
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
};

exports.findById = async (id) => {
  const [users] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
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
