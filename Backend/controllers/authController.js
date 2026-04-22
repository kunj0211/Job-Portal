const { admin, db } = require('../config/firebase')

// Utility to get the Firebase API Key
const getApiKey = () => process.env.FIREBASE_API_KEY

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	maxAge: 3600000, // 1 hour for access token cookie
}

const refreshTokenOptions = {
	...cookieOptions,
	maxAge: 30 * 24 * 3600000, // 30 days for refresh token cookie
}

// Helper to set auth cookies
const setAuthCookies = (res, idToken, refreshToken) => {
	res.cookie('token', idToken, cookieOptions)
	if (refreshToken) {
		res.cookie('refreshToken', refreshToken, refreshTokenOptions)
	}
}

// Register a new user with email and password
exports.register = async (req, res) => {
	const { email, password, displayName, role } = req.body

	if (!email || !password || !role) {
		return res
			.status(400)
			.json({ error: 'Email, password, and role are required' })
	}

	try {
		const apiKey = getApiKey()
		if (!apiKey) {
			return res.status(500).json({
				error: 'Server misconfiguration: FIREBASE_API_KEY is missing',
			})
		}

		// 1. Create the user in Firebase Auth via REST API
		const response = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					returnSecureToken: true,
				}),
			},
		)

		const data = await response.json()

		if (!response.ok) {
			console.error(
				'Firebase Auth registration error details:',
				data.error,
			)
			const errorMessage = data.error?.message || 'Registration failed'
			return res.status(response.status).json({ error: errorMessage })
		}

		// 2. Set Custom Claims (Role)
		await admin.auth().setCustomUserClaims(data.localId, { role })

		// 3. Update user's display name using Firebase Admin
		if (displayName) {
			await admin.auth().updateUser(data.localId, { displayName })
		}

		// 4. Save User to Firestore
		const userDoc = {
			uid: data.localId,
			email: data.email,
			displayName: displayName || null,
			role,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			lastLogin: admin.firestore.FieldValue.serverTimestamp(),
		}
		await db.collection('users').doc(data.localId).set(userDoc)

		// 5. Set Cookies
		setAuthCookies(res, data.idToken, data.refreshToken)

		// Return the user data (no token in body)
		res.status(201).json({
			message: 'User registered successfully',
			user: {
				uid: data.localId,
				email: data.email,
				displayName: displayName || null,
				role,
			},
		})
	} catch (error) {
		console.error('Registration error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Login an existing user with email and password
exports.login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		return res
			.status(400)
			.json({ error: 'Email and password are required' })
	}

	try {
		const apiKey = getApiKey()
		if (!apiKey) {
			return res.status(500).json({
				error: 'Server misconfiguration: FIREBASE_API_KEY is missing',
			})
		}

		// Call Firebase Auth REST API to sign in the user
		const response = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					returnSecureToken: true,
				}),
			},
		)

		const data = await response.json()

		if (!response.ok) {
			return res
				.status(response.status)
				.json({ error: data.error.message || 'Login failed' })
		}

		// Update lastLogin in Firestore (and create document if missing)
		const userRef = db.collection('users').doc(data.localId)
		const userDoc = await userRef.get()

		// Fetch user record to get custom claims (role)
		const userRecord = await admin.auth().getUser(data.localId)
		let role = userRecord.customClaims?.role || 'candidate'

		if (!userDoc.exists) {
			console.log(`[Auth] Creating missing Firestore document for user ${data.localId}`)
			await userRef.set({
				uid: data.localId,
				email: data.email,
				displayName: data.displayName || null,
				role,
				createdAt: admin.firestore.FieldValue.serverTimestamp(),
				lastLogin: admin.firestore.FieldValue.serverTimestamp(),
			})
		} else {
			await userRef.update({
				lastLogin: admin.firestore.FieldValue.serverTimestamp()
			})
			role = userDoc.data().role || role
		}

		// Set Cookies
		setAuthCookies(res, data.idToken, data.refreshToken)

		res.status(200).json({
			message: 'Login successful',
			user: {
				uid: data.localId,
				email: data.email,
				displayName: data.displayName,
				role,
				resumeUrl: userDoc.exists ? userDoc.data().resumeUrl : undefined,
				title: userDoc.exists ? userDoc.data().title : undefined,
				experience: userDoc.exists ? userDoc.data().experience : undefined,
				skills: userDoc.exists ? userDoc.data().skills : undefined,
			},
		})
	} catch (error) {
		console.error('Login error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Google Sign-In Verification Endpoint
exports.googleSignIn = async (req, res) => {
	const { idToken, refreshToken } = req.body

	if (!idToken) {
		return res.status(400).json({ error: 'idToken is required' })
	}

	try {
		// Verify the identity of the user
		const decodedToken = await admin.auth().verifyIdToken(idToken)
		const { uid, email, name, picture } = decodedToken

		// Sync with Firestore
		const userRef = db.collection('users').doc(uid)
		const userDoc = await userRef.get()

		let role = decodedToken.role

		if (!userDoc.exists) {
			// First-time Google login - we don't know the role yet
			role = req.body.role || 'candidate' 
			
			await admin.auth().setCustomUserClaims(uid, { role })
			
			await userRef.set({
				uid,
				email,
				displayName: name || null,
				role,
				createdAt: admin.firestore.FieldValue.serverTimestamp(),
				lastLogin: admin.firestore.FieldValue.serverTimestamp(),
			})
		} else {
			// Existing user - update lastLogin
			role = userDoc.data().role
			await userRef.update({
				lastLogin: admin.firestore.FieldValue.serverTimestamp()
			})
		}

		// Set Cookies (both access and refresh)
		setAuthCookies(res, idToken, refreshToken)

		res.status(200).json({
			message: 'Google Sign-In successful',
			user: {
				uid,
				email,
				displayName: name,
				picture,
				role,
				resumeUrl: userDoc.exists ? userDoc.data().resumeUrl : undefined,
				title: userDoc.exists ? userDoc.data().title : undefined,
				experience: userDoc.exists ? userDoc.data().experience : undefined,
				skills: userDoc.exists ? userDoc.data().skills : undefined,
			},
		})
	} catch (error) {
		console.error('Google Sign-In error:', error)
		res.status(401).json({ error: 'Invalid or expired token' })
	}
}

// Refresh Token Endpoint
exports.refreshTokens = async (req, res) => {
	const refreshToken = req.cookies.refreshToken

	if (!refreshToken) {
		return res.status(401).json({ error: 'No refresh token provided' })
	}

	try {
		const apiKey = getApiKey()
		const response = await fetch(
			`https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
				}),
			},
		)

		const data = await response.json()

		if (!response.ok) {
			return res.status(401).json({ error: 'Invalid refresh token' })
		}

		// Update cookies with new ID Token
		res.cookie('token', data.id_token, cookieOptions)

		res.status(200).json({ message: 'Token refreshed' })
	} catch (error) {
		console.error('Refresh token error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Logout Endpoint
exports.logout = (req, res) => {
	res.clearCookie('token')
	res.clearCookie('refreshToken')
	res.status(200).json({ message: 'Logged out successfully' })
}

// Check Auth state and return user data
exports.checkAuth = async (req, res) => {
	try {
		// verifyToken middleware already populated req.user
		const { uid } = req.user
		const userRecord = await admin.auth().getUser(uid)
		let role = userRecord.customClaims?.role
		let resumeUrl = undefined

		const userDoc = await db.collection('users').doc(uid).get()
		if (userDoc.exists) {
			if (!role) {
				role = userDoc.data().role
			}
			resumeUrl = userDoc.data().resumeUrl
		}
		
		res.status(200).json({
			user: {
				uid: userRecord.uid,
				email: userRecord.email,
				displayName: userRecord.displayName,
				role: role || 'candidate', // Default to candidate if still missing
				resumeUrl,
				title: userDoc.exists ? userDoc.data().title : undefined,
				experience: userDoc.exists ? userDoc.data().experience : undefined,
				skills: userDoc.exists ? userDoc.data().skills : undefined,
			}
		})
	} catch (error) {
		console.error('Check Auth error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Update User Profile
exports.updateProfile = async (req, res) => {
	try {
		const { uid } = req.user
		const { displayName, resumeUrl, title, experience, skills } = req.body

		const userRef = db.collection('users').doc(uid)
		const userDoc = await userRef.get()

		if (!userDoc.exists) {
			return res.status(404).json({ error: 'User not found' })
		}

		const updates = {}
		if (displayName !== undefined) updates.displayName = displayName
		if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl
		if (title !== undefined) updates.title = title
		if (experience !== undefined) updates.experience = experience
		if (skills !== undefined) updates.skills = skills

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ error: 'No fields to update' })
		}

		// Update Auth display name if provided
		if (displayName) {
			await admin.auth().updateUser(uid, { displayName })
		}

		await userRef.update({
			...updates,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		})

		const updatedDoc = await userRef.get()

		res.status(200).json({
			message: 'Profile updated successfully',
			user: {
				id: updatedDoc.id,
				...updatedDoc.data(),
			},
		})
	} catch (error) {
		console.error('Update profile error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
