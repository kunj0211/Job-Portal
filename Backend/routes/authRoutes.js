const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verifyToken } = require('../middleware/authMiddleware')
const multer = require('multer')

// Limit to 700KB to ensure the encrypted base64 string fits within Firestore's 1MB document limit
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 700 * 1024 }, // 700 KB
})
// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/google-signin', authController.googleSignIn)

// Profile and Refresh routes
router.get('/me', verifyToken, authController.checkAuth)
router.put('/profile', verifyToken, authController.updateProfile)
router.post('/refresh', authController.refreshTokens)
router.post('/logout', authController.logout)

// Resume routes
router.post(
	'/resume/upload',
	verifyToken,
	upload.single('resume'),
	authController.uploadResume,
)
router.get('/resume/:userId', verifyToken, authController.viewResume)

module.exports = router
