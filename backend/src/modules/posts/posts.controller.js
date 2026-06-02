const service = require('./posts.service');

exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.query, req.user);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const data = await service.detail(req.params.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.user.id, req.body);
    res.status(201).json({ success: true, data, message: 'Đăng bài thành công' });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.user, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const data = await service.updateStatus(req.user.id, req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.user, req.params.id);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (e) { next(e); }
};
