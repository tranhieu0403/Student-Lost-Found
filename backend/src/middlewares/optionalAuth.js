const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    const err = new Error(error.message || 'Token khong hop le');
    err.status = 401;
    err.name = error.name;
    next(err);
  }
};
