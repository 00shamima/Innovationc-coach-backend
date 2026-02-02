const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.config');

router.get('/my-activity', authMiddleware, userController.getMyDashboardData);


router.get('/profile/:userId', authMiddleware, userController.getUserPublicProfile);


router.put('/update-profile', authMiddleware, upload.single('profilePic'), userController.updateUserProfile);


router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router;