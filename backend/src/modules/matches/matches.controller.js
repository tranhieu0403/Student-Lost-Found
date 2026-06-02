const service = require('./matches.service');

exports.getForPost = async (req, res, next) => {
  try {
    const data = await service.getMatchesForPost(req.params.postId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
