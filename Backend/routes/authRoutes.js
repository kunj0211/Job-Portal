const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a user using email and password
// @access  Public
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleSignIn);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token cookie
// @access  Public (depends on cookie)
router.post('/refresh', authController.refreshTokens);

// @route   POST /api/auth/logout
// @desc    Clear auth cookies
// @access  Public
router.post('/logout', authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
const { verifyToken } = require('../middleware/authMiddleware');
router.get('/me', verifyToken, authController.checkAuth);

module.exports = router;
