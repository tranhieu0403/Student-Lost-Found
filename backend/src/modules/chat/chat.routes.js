const { Router } = require('express');
const Joi = require('joi');
const controller = require('./chat.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const router = Router();

const sendMessageSchema = Joi.object({
  receiverId: Joi.number().integer().positive().required(),
  content: Joi.string().min(1).required(),
  postId: Joi.number().integer().positive().allow(null),
});

// GET /api/chat/conversations
router.get('/conversations', auth, controller.getConversations);

// GET /api/chat/messages/:partnerId
router.get('/messages/:partnerId', auth, controller.getMessages);

// POST /api/chat/messages
router.post('/messages', auth, validate(sendMessageSchema), controller.sendMessage);

// PATCH /api/chat/messages/:partnerId/read
router.patch('/messages/:partnerId/read', auth, controller.markAsRead);

module.exports = router;
