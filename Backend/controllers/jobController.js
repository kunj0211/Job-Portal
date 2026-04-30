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

		// Fetch candidate profile to get resumeUrl
		const userDoc = await db.collection('users').doc(candidateId).get()
		const resumeUrl = userDoc.exists ? userDoc.data().resumeUrl : null

		const newApplication = {
			jobId: id,
			candidateId,
			resumeUrl: resumeUrl || null,
			appliedAt: admin.firestore.FieldValue.serverTimestamp(),
			status: 'pending', // Add status field
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
					resumeUrl: app.resumeUrl || null,
					appliedAt: app.appliedAt,
					status: app.status || 'pending',
					rejectionReason: app.rejectionReason || null,
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
		const { status, rejectionReason } = req.body
		const recruiterId = req.user.uid

		if (!['pending', 'accepted', 'rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' })
		}

		if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
			return res.status(400).json({ error: 'Rejection reason is required' })
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

		const updateData = {
			status,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		}

		if (status === 'rejected') {
			updateData.rejectionReason = rejectionReason.trim()
		} else {
			updateData.rejectionReason = admin.firestore.FieldValue.delete()
		}

		await applicationRef.update(updateData)

		res.status(200).json({
			message: 'Application status updated successfully',
			status,
		})
	} catch (error) {
		console.error('Update application status error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Generate a professional job description using AI (Gemini)
exports.generateDescription = async (req, res) => {
	try {
		const { title, company } = req.body

		if (!title) {
			return res.status(400).json({ error: 'Job title is required for generation' })
		}

		const rawKey = process.env.GEMINI_API_KEY
		if (!rawKey || rawKey === 'YOUR_GEMINI_API_KEY_HERE') {
			return res.status(400).json({ 
				error: 'AI Generation is not configured. Please add GEMINI_API_KEY to your .env file.' 
			})
		}

		// Clean the API key (handle quotes if present)
		const apiKey = rawKey.trim().replace(/^["']|["']$/g, '')

		const prompt = `
      Write a professional and detailed job description for a "${title}" position${company ? ` at "${company}"` : ''}.
      
      DO NOT include the Job Title, Company Name, Location, or a "Role Summary" header in your response. 
      Start directly with the compelling summary of the role itself.
      
      The description should include:
      1. A compelling summary of the role (no header).
      2. Key responsibilities (bullet points).
      3. Required qualifications and skills (bullet points).
      4. A brief mention of why a candidate should join.
      
      Keep the tone professional, engaging, and clear. Do not include placeholders like "[Your Name]".
    `

		const apiBody = {
			contents: [
				{
					parts: [
						{ text: prompt }
					]
				}
			],
			generationConfig: {
				temperature: 0.7,
				topP: 0.95,
				topK: 40,
				maxOutputTokens: 2048,
			}
		}

		const apiResponse = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(apiBody),
			}
		)

		if (!apiResponse.ok) {
			const errorText = await apiResponse.text()
			console.error(`Gemini API Error (${apiResponse.status}):`, errorText)
			throw new Error(`Google API returned ${apiResponse.status}`)
		}

		const result = await apiResponse.json()

		if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
			throw new Error('Invalid response structure from AI')
		}

		const description = result.candidates[0].content.parts[0].text.trim()
		res.status(200).json({ description })
	} catch (error) {
		console.error('AI Generation error:', error.message)
		res.status(500).json({ error: 'Failed to generate job description: ' + error.message })
	}
}
