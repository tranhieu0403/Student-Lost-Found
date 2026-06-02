const { Router } = require('express');
const Joi = require('joi');
const controller = require('./posts.controller');
const auth = require('../../middlewares/auth');
const optionalAuth = require('../../middlewares/optionalAuth');
const validate = require('../../middlewares/validate');

const router = Router();

const createPostSchema = Joi.object({
  post_type: Joi.string().valid('lost', 'found').required(),
  title: Joi.string().min(5).required(),
  location: Joi.string().allow('', null),
  incident_date: Joi.date().iso().allow(null),
  category_id: Joi.number().integer().positive().allow(null),
  description: Joi.string().allow('', null),
  image_urls: Joi.array().items(Joi.string()).max(5).default([]),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('searching', 'resolved').required(),
});

router.get('/', optionalAuth, controller.list);
router.get('/:id', controller.detail);
router.post('/', auth, validate(createPostSchema), controller.create);
router.put('/:id', auth, validate(createPostSchema), controller.update);
router.patch('/:id/status', auth, validate(updateStatusSchema), controller.updateStatus);
router.delete('/:id', auth, controller.remove);

module.exports = router;
