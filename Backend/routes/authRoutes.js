const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a user using email and password
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login a user using email and password
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/google
// @desc    Verify Google Sign-In using Firebase idToken from frontend
// @access  Public
router.post('/google', authController.googleSignIn);

module.exports = router;
