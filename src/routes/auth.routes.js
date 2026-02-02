const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    googleLogin, 
    forgotPassword, 
    resetPassword, 
    checkStatus 
} = require('../Controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/check-status/:email', checkStatus);

module.exports = router;