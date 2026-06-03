const service = require('./chat.service');

exports.getConversations = async (req, res, next) => {
  try {
    const data = await service.getConversations(req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const data = await service.getMessages(
      req.user.id,
      Number(req.params.partnerId)
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const data = await service.sendMessage(
      req.user.id,
      Number(req.body.receiverId),
      req.body.content,
      req.body.postId
    );
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const data = await service.markAsRead(req.user.id, Number(req.params.partnerId));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
