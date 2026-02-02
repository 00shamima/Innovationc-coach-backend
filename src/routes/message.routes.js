const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/send', authMiddleware, messageController.sendMessage);

router.get('/history/:otherUserId', authMiddleware, messageController.getMessages);

router.get('/conversations', authMiddleware, messageController.getConversations);

module.exports = router;