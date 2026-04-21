const express = require('express')
const router = express.Router()
const jobController = require('../controllers/jobController')
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware')

// Public route to get all jobs (for job seekers to browse)
router.get('/', jobController.getAllJobs)

// All routes below require the user to be authenticated and have the 'recruiter' role
router.use(verifyToken)

// POST /api/jobs -> Create a job
router.post('/', jobController.createJob)

// GET /api/jobs/me -> Get all jobs for the logged in recruiter
router.get('/me', jobController.getRecruiterJobs)

// PUT /api/jobs/:id -> Update a specific job
router.put('/:id', jobController.updateJob)

// DELETE /api/jobs/:id -> Delete a specific job
router.delete('/:id', jobController.deleteJob)

module.exports = router
