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
			return res.status(400).json({
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
				return res.status(400).json({
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
		const { keyword } = req.query
		const jobsSnapshot = await db.collection('jobs').get()

		let jobs = []
		jobsSnapshot.forEach((doc) => {
			jobs.push({ id: doc.id, ...doc.data() })
		})

		if (keyword && typeof keyword === 'string') {
			const query = keyword.trim().toLowerCase()
			if (query) {
				jobs = jobs.filter((job) => {
					const title = (job.title || '').toLowerCase()
					const company = (job.company || '').toLowerCase()
					const location = (job.location || '').toLowerCase()
					const description = (job.description || '').toLowerCase()

					return (
						title.includes(query) ||
						company.includes(query) ||
						location.includes(query) ||
						description.includes(query)
					)
				})
			}
		}

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

// Apply for a job
exports.applyForJob = async (req, res) => {
	try {
		const { id } = req.params
		const candidateId = req.user.uid

		const jobRef = db.collection('jobs').doc(id)
		const jobDoc = await jobRef.get()

		if (!jobDoc.exists) {
			return res.status(404).json({ error: 'Job not found' })
		}

		if (req.user.role === 'recruiter') {
			return res
				.status(403)
				.json({ error: 'Recruiters cannot apply for jobs' })
		}

		const applicationsSnapshot = await db
			.collection('applications')
			.where('jobId', '==', id)
			.where('candidateId', '==', candidateId)
			.get()

		if (!applicationsSnapshot.empty) {
			return res
				.status(400)
				.json({ error: 'You have already applied for this job' })
		}

		const newApplication = {
			jobId: id,
			candidateId,
			appliedAt: admin.firestore.FieldValue.serverTimestamp(),
		}

		const docRef = await db.collection('applications').add(newApplication)

		res.status(201).json({
			message: 'Applied successfully',
			applicationId: docRef.id,
		})
	} catch (error) {
		console.error('Apply for job error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Get applications for recruiter's jobs
exports.getRecruiterApplications = async (req, res) => {
	try {
		const recruiterId = req.user.uid

		const jobsSnapshot = await db
			.collection('jobs')
			.where('recruiterId', '==', recruiterId)
			.get()

		if (jobsSnapshot.empty) {
			return res.status(200).json({ applications: [] })
		}

		const jobMap = {}
		const jobIds = []
		jobsSnapshot.forEach((doc) => {
			const data = doc.data()
			jobIds.push(doc.id)
			jobMap[doc.id] = {
				id: doc.id,
				title: data.title,
				company: data.company,
				applicants: [],
			}
		})

		const applicationsSnapshot = await db
			.collection('applications')
			.where('jobId', 'in', jobIds)
			.get()

		if (applicationsSnapshot.empty) {
			return res.status(200).json({ applications: Object.values(jobMap) })
		}

		const applications = []
		const candidateIds = new Set()
		applicationsSnapshot.forEach((doc) => {
			const data = doc.data()
			applications.push({ id: doc.id, ...data })
			candidateIds.add(data.candidateId)
		})

		const userIds = Array.from(candidateIds)
		const candidatesMap = {}

		for (let i = 0; i < userIds.length; i += 30) {
			const chunk = userIds.slice(i, i + 30)
			const userRefs = chunk.map((uid) => db.collection('users').doc(uid))

			const userDocs = await db.getAll(...userRefs)
			const missingFromFirestore = []

			userDocs.forEach((doc, index) => {
				if (doc.exists) {
					candidatesMap[doc.id] = doc.data()
				} else {
					missingFromFirestore.push(chunk[index])
				}
			})

			// Fallback to Firebase Auth if some users are missing from Firestore
			if (missingFromFirestore.length > 0) {
				console.log(
					`[Debug] ${missingFromFirestore.length} candidates missing from Firestore. Trying Auth fallback...`,
				)
				try {
					const identifiers = missingFromFirestore.map((uid) => ({
						uid,
					}))
					const authResults = await admin.auth().getUsers(identifiers)

					authResults.users.forEach((userRecord) => {
						console.log(
							`[Debug] Found user in Auth fallback: ${userRecord.email}`,
						)
						candidatesMap[userRecord.uid] = {
							displayName: userRecord.displayName,
							email: userRecord.email,
							uid: userRecord.uid,
						}
					})
				} catch (authErr) {
					console.error('[Debug] Auth fallback failed:', authErr)
				}
			}
		}

		applications.forEach((app) => {
			if (jobMap[app.jobId]) {
				const candidateDetail = candidatesMap[app.candidateId]
				jobMap[app.jobId].applicants.push({
					applicationId: app.id,
					candidateId: app.candidateId,
					name: candidateDetail?.displayName || 'Unknown Candidate',
					email: candidateDetail?.email || 'No email',
					appliedAt: app.appliedAt,
					status: app.status || 'pending',
				})
			}
		})

		res.status(200).json({ applications: Object.values(jobMap) })
	} catch (error) {
		console.error('Get recruiter applications error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Get applications for the logged-in candidate
exports.getCandidateApplications = async (req, res) => {
	try {
		const candidateId = req.user.uid

		const applicationsSnapshot = await db
			.collection('applications')
			.where('candidateId', '==', candidateId)
			.get()

		if (applicationsSnapshot.empty) {
			return res.status(200).json({ applications: [] })
		}

		const applications = []
		const jobIds = []
		applicationsSnapshot.forEach((doc) => {
			const data = doc.data()
			applications.push({ id: doc.id, ...data })
			jobIds.push(data.jobId)
		})

		// Fetch job details for each application
		const jobMap = {}
		for (let i = 0; i < jobIds.length; i += 30) {
			const chunk = jobIds.slice(i, i + 30)
			const jobRefs = chunk.map((id) => db.collection('jobs').doc(id))
			const jobDocs = await db.getAll(...jobRefs)
			jobDocs.forEach((doc) => {
				if (doc.exists) {
					jobMap[doc.id] = { id: doc.id, ...doc.data() }
				}
			})
		}

		const result = applications.map((app) => ({
			...app,
			job: jobMap[app.jobId] || {
				title: 'Unknown Position',
				company: 'Unknown Company',
			},
		}))

		// Sort by appliedAt descending
		result.sort((a, b) => {
			const timeA =
				a.appliedAt && typeof a.appliedAt.toDate === 'function'
					? a.appliedAt.toDate().getTime()
					: 0
			const timeB =
				b.appliedAt && typeof b.appliedAt.toDate === 'function'
					? b.appliedAt.toDate().getTime()
					: 0
			return timeB - timeA
		})

		res.status(200).json({ applications: result })
	} catch (error) {
		console.error('Get candidate applications error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Update application status (for recruiters)
exports.updateApplicationStatus = async (req, res) => {
	try {
		const { id } = req.params
		const { status } = req.body
		const recruiterId = req.user.uid

		if (!['pending', 'accepted', 'rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' })
		}

		const applicationRef = db.collection('applications').doc(id)
		const applicationDoc = await applicationRef.get()

		if (!applicationDoc.exists) {
			return res.status(404).json({ error: 'Application not found' })
		}

		// Verify the recruiter owns the job for this application
		const jobId = applicationDoc.data().jobId
		const jobDoc = await db.collection('jobs').doc(jobId).get()

		if (!jobDoc.exists || jobDoc.data().recruiterId !== recruiterId) {
			return res
				.status(403)
				.json({ error: 'Unauthorized to update this application' })
		}

		await applicationRef.update({
			status,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		})

		res.status(200).json({
			message: 'Application status updated successfully',
			status,
		})
	} catch (error) {
		console.error('Update application status error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
