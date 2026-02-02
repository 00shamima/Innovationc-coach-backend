const express = require('express');
const router = express.Router();
const postController = require('../Controllers/post.controller'); 
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');


router.post('/create', authMiddleware, upload.single('media'), postController.createPost);
router.get('/feed', authMiddleware, postController.getAllPosts); 
router.get('/my-stats', authMiddleware, postController.getMyStats);
router.get('/my-posts', authMiddleware, postController.getMyPosts);

module.exports = router;