const service = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const data = await service.register(req.body);
    res.status(201).json({ success: true, data, message: 'Đăng ký thành công' });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await service.login(req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res, next) => {
  try {
    const data = await service.findById(req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { message } = await service.forgotPassword(req.body);
    res.json({ success: true, message });
  } catch (e) {
    next(e);
  }
};

exports.verifyResetToken = async (req, res, next) => {
  try {
    const data = await service.verifyResetToken(req.params.token);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { message } = await service.resetPassword(req.params.token, req.body);
    res.json({ success: true, message });
  } catch (e) {
    next(e);
  }
};
