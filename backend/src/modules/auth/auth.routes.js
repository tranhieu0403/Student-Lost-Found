const { Router } = require('express');
const Joi = require('joi');
const controller = require('./auth.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const router = Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
});

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', auth, controller.me);

router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.get('/reset-password/:token', controller.verifyResetToken);
router.post('/reset-password/:token', validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
