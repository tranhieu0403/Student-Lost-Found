const { Router } = require('express');
const controller = require('./upload.controller');
const auth = require('../../middlewares/auth');

const router = Router();

router.post('/', auth, controller.uploadImages);

module.exports = router;
