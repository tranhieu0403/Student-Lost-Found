const { Router } = require('express');
const controller = require('./matches.controller');

const router = Router();

router.get('/:postId', controller.getForPost);

module.exports = router;
