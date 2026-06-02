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
