const { Router } = require('express');
const controller = require('./admin.controller');
const auth = require('../../middlewares/auth');
const isAdmin = require('../../middlewares/isAdmin');

const router = Router();

router.use(auth, isAdmin);

router.get('/stats', controller.stats);
router.get('/users', controller.listUsers);
router.patch('/users/:id/lock', controller.lockUser);
router.patch('/users/:id/unlock', controller.unlockUser);
router.get('/posts', controller.listPosts);
router.delete('/posts/:id', controller.removePost);

module.exports = router;
