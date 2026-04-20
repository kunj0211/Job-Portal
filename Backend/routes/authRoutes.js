const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-signin', authController.googleSignIn);

// Profile and Refresh routes
router.get('/me', verifyToken, authController.checkAuth);
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authController.logout);

module.exports = router;
