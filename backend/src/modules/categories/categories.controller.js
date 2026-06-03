const service = require('./categories.service');

exports.list = async (_req, res, next) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
