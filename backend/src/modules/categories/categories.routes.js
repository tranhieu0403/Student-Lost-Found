const { Router } = require('express');
const controller = require('./categories.controller');

const router = Router();

router.get('/', controller.list);

module.exports = router;
