const jwt = require('jsonwebtoken');

module.exports = function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Chưa đăng nhập');
    err.status = 401;
    return next(err);
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    const err = new Error(error.message || 'Token không hợp lệ');
    err.status = 401;
    err.name = error.name;
    next(err);
  }
};
