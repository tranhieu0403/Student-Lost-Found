const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { sendResetPasswordEmail } = require('../../utils/sendEmail');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const GENERIC_FORGOT_MESSAGE = 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn.';

function buildInvalidTokenError() {
  const err = new Error('Link đã hết hạn hoặc không hợp lệ');
  err.status = 400;
  err.code = 'TOKEN_INVALID';
  return err;
}

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

  if (Number(user.is_locked) === 1) {
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
    'SELECT id, name, email, role, is_locked, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  if (users.length === 0) {
    const err = new Error('Không tìm thấy người dùng');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (Number(users[0].is_locked) === 1) {
    const err = new Error('Tài khoản đã bị khóa');
    err.status = 403;
    err.code = 'ACCOUNT_LOCKED';
    throw err;
  }

  const { is_locked: _ignored, ...user } = users[0];
  return user;
};

exports.forgotPassword = async ({ email }) => {
  const [users] = await pool.query(
    'SELECT id, name FROM users WHERE email = ? AND is_locked = 0 LIMIT 1',
    [email]
  );

  const user = users[0];
  if (!user) {
    return { message: GENERIC_FORGOT_MESSAGE };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await pool.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
    [token, expiry, user.id]
  );

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  // Không await để response không bị block bởi SES
  sendResetPasswordEmail(email, user.name, resetUrl).catch((e) => {
    console.error('Gửi email reset thất bại:', e);
  });

  return { message: GENERIC_FORGOT_MESSAGE };
};

exports.verifyResetToken = async (token) => {
  const [users] = await pool.query(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_locked = 0 LIMIT 1',
    [token]
  );

  if (users.length === 0) {
    throw buildInvalidTokenError();
  }

  return { valid: true };
};

exports.resetPassword = async (token, { password }) => {
  const [users] = await pool.query(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_locked = 0 LIMIT 1',
    [token]
  );

  const user = users[0];
  if (!user) {
    throw buildInvalidTokenError();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  return { message: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.' };
};
