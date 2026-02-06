const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/pending-users', authMiddleware, adminMiddleware, adminController.getPendingUsers);
router.patch('/approve-user', authMiddleware, adminMiddleware, adminController.approveUser);
router.patch('/reject-user', authMiddleware, adminMiddleware, adminController.rejectUser); 
router.delete('/delete-user/:userId', authMiddleware, adminMiddleware, adminController.hardDeleteUser);

module.exports = router; 