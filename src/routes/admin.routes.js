const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/users', authMiddleware, adminController.getAllUsers);
router.get('/pending-users', authMiddleware, adminController.getPendingUsers);
router.patch('/approve-user', authMiddleware, adminController.approveUser);
router.patch('/reject-user', authMiddleware, adminController.rejectUser); // Soft Delete
router.delete('/delete-user/:userId', authMiddleware, adminController.hardDeleteUser); // Hard Delete

router.patch('/respond-post', authMiddleware, adminController.respondToPost);
router.patch('/mark-read', authMiddleware, adminController.markAsRead);

module.exports = router;