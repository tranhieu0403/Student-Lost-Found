const service = require('./admin.service');

exports.stats = async (_req, res, next) => {
  try { res.json({ success: true, data: await service.stats() }); }
  catch (e) { next(e); }
};

exports.listUsers = async (_req, res, next) => {
  try { res.json({ success: true, data: await service.listUsers(_req.query) }); }
  catch (e) { next(e); }
};

exports.lockUser = async (req, res, next) => {
  try { res.json({ success: true, data: await service.setUserLockStatus(req.params.id, true) }); }
  catch (e) { next(e); }
};

exports.unlockUser = async (req, res, next) => {
  try { res.json({ success: true, data: await service.setUserLockStatus(req.params.id, false) }); }
  catch (e) { next(e); }
};

exports.listPosts = async (req, res, next) => {
  try { res.json({ success: true, data: await service.listPosts(req.query) }); }
  catch (e) { next(e); }
};

exports.removePost = async (req, res, next) => {
  try { await service.removePost(req.params.id); res.json({ success: true }); }
  catch (e) { next(e); }
};
