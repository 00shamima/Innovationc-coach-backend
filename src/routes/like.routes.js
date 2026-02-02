const express = require('express');
const router = express.Router();
const likeController = require('../Controllers/like.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/toggle/:postId', authMiddleware, likeController.toggleLike);

module.exports = router;