const { admin, db } = require('../config/firebase')

// Create a new job listing
exports.createJob = async (req, res) => {
	try {
		const {
			title,
			company,
			location,
			jobType,
			description,
			salaryRange,
			experience,
		} = req.body
		const recruiterId = req.user.uid

		if (!title || !company || !location || !jobType || !description) {
			return res.status(400).json({ error: 'Missing required fields' })
		}

		const validJobTypes = ['Full-time', 'Part-time', 'Internship']
		if (!validJobTypes.includes(jobType)) {
			return res
				.status(400)
				.json({
					error: "Invalid job type. Must be 'Full-time', 'Part-time', or 'Internship'.",
				})
		}

		const newJob = {
			title,
			company,
			location,
			jobType,
			description,
			salaryRange: salaryRange || null,
			experience: experience || null,
			recruiterId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		}

		const docRef = await db.collection('jobs').add(newJob)

		// Fetch the added document to return it immediately (with timestamps if needed)
		const savedDoc = await docRef.get()

		res.status(201).json({
			message: 'Job created successfully',
			job: { id: savedDoc.id, ...savedDoc.data() },
		})
	} catch (error) {
		console.error('Create job error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Get all jobs for the authenticated recruiter
exports.getRecruiterJobs = async (req, res) => {
	try {
		const recruiterId = req.user.uid
		const jobsSnapshot = await db
			.collection('jobs')
			.where('recruiterId', '==', recruiterId)
			.get()

		const jobs = []
		jobsSnapshot.forEach((doc) => {
			jobs.push({ id: doc.id, ...doc.data() })
		})

		// Sort jobs by createdAt descending in memory to avoid Firestore index requirement
		jobs.sort((a, b) => {
			const timeA =
				a.createdAt && typeof a.createdAt.toDate === 'function'
					? a.createdAt.toDate().getTime()
					: 0
			const timeB =
				b.createdAt && typeof b.createdAt.toDate === 'function'
					? b.createdAt.toDate().getTime()
					: 0
			return timeB - timeA
		})

		res.status(200).json({ jobs })
	} catch (error) {
		console.error('Get recruiter jobs error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Update a specific job
exports.updateJob = async (req, res) => {
	try {
		const { id } = req.params
		const recruiterId = req.user.uid
		const updates = req.body

		const jobRef = db.collection('jobs').doc(id)
		const jobDoc = await jobRef.get()

		if (!jobDoc.exists) {
			return res.status(404).json({ error: 'Job not found' })
		}

		if (jobDoc.data().recruiterId !== recruiterId) {
			return res
				.status(403)
				.json({ error: 'Unauthorized to update this job' })
		}

		if (updates.jobType) {
			const validJobTypes = ['Full-time', 'Part-time', 'Internship']
			if (!validJobTypes.includes(updates.jobType)) {
				return res
					.status(400)
					.json({
						error: "Invalid job type. Must be 'Full-time', 'Part-time', or 'Internship'.",
					})
			}
		}

		const {
			id: _ignoreId,
			recruiterId: _ignoreRecruiter,
			createdAt: _ignoreCreated,
			...safeUpdates
		} = updates

		await jobRef.update({
			...safeUpdates,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		})

		const updatedDoc = await jobRef.get()

		res.status(200).json({
			message: 'Job updated successfully',
			job: { id: updatedDoc.id, ...updatedDoc.data() },
		})
	} catch (error) {
		console.error('Update job error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Delete a specific job
exports.deleteJob = async (req, res) => {
	try {
		const { id } = req.params
		const recruiterId = req.user.uid

		const jobRef = db.collection('jobs').doc(id)
		const jobDoc = await jobRef.get()

		if (!jobDoc.exists) {
			return res.status(404).json({ error: 'Job not found' })
		}

		if (jobDoc.data().recruiterId !== recruiterId) {
			return res
				.status(403)
				.json({ error: 'Unauthorized to delete this job' })
		}

		await jobRef.delete()

		res.status(200).json({ message: 'Job deleted successfully', id })
	} catch (error) {
		console.error('Delete job error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Get all jobs for job seekers to browse (public endpoint)
exports.getAllJobs = async (req, res) => {
	try {
		const jobsSnapshot = await db.collection('jobs').get()

		const jobs = []
		jobsSnapshot.forEach((doc) => {
			jobs.push({ id: doc.id, ...doc.data() })
		})

		// Sort jobs by createdAt descending
		jobs.sort((a, b) => {
			const timeA =
				a.createdAt && typeof a.createdAt.toDate === 'function'
					? a.createdAt.toDate().getTime()
					: 0
			const timeB =
				b.createdAt && typeof b.createdAt.toDate === 'function'
					? b.createdAt.toDate().getTime()
					: 0
			return timeB - timeA
		})

		res.status(200).json({ jobs })
	} catch (error) {
		console.error('Get all jobs error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
