module.exports = function isAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    const err = new Error('Không có quyền');
    err.status = 403;
    return next(err);
  }
  next();
};
