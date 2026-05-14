import axios from 'axios'

const BASE_URL = import.meta.env.VITE_URL
const API_URL = `${BASE_URL}/api/auth`

// Request interceptor to attach the access token to headers
axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('accessToken')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

// Response interceptor to handle token expiration and automatic refreshing
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// If error is 401 and not a retry, attempt to refresh tokens
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes('/refresh')
		) {
			originalRequest._retry = true
			const refreshToken = localStorage.getItem('refreshToken')

			if (!refreshToken) {
				// No refresh token available, user needs to login
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				return Promise.reject(error)
			}

			try {
				// Attempt to call the refresh endpoint
				const response = await axios.post(`${API_URL}/refresh`, {
					refreshToken,
				})

				const { accessToken, refreshToken: newRefreshToken } =
					response.data

				if (accessToken) {
					localStorage.setItem('accessToken', accessToken)
				}
				if (newRefreshToken) {
					localStorage.setItem('refreshToken', newRefreshToken)
				}

				// Update the authorization header for the original request and retry
				originalRequest.headers.Authorization = `Bearer ${accessToken}`
				return axios(originalRequest)
			} catch (refreshError) {
				// If refresh fails, the session is invalid
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	},
)

export const authService = {
	register: async (userData: any) => {
		const response = await axios.post(`${API_URL}/register`, userData)
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken)
			localStorage.setItem('refreshToken', response.data.refreshToken)
		}
		return response.data
	},
	login: async (credentials: any) => {
		const response = await axios.post(`${API_URL}/login`, credentials)
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken)
			localStorage.setItem('refreshToken', response.data.refreshToken)
		}
		return response.data
	},
	verifyGoogleAuth: async (idToken: string, refreshToken: string) => {
		const response = await axios.post(`${API_URL}/google-signin`, {
			idToken,
			refreshToken,
		})
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken)
			localStorage.setItem('refreshToken', response.data.refreshToken)
		}
		return response.data
	},
	logout: async () => {
		try {
			await axios.post(`${API_URL}/logout`)
		} finally {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
		}
		return { message: 'Logged out successfully' }
	},
	checkAuth: async () => {
		const response = await axios.get(`${API_URL}/me`)
		return response.data
	},
	updateProfile: async (profileData: {
		displayName?: string
		resumeUrl?: string
		title?: string
		experience?: string
		skills?: string[]
	}) => {
		const response = await axios.put(`${API_URL}/profile`, profileData)
		return response.data
	},
	uploadResume: async (file: File) => {
		const formData = new FormData()
		formData.append('resume', file)
		const response = await axios.post(
			`${API_URL}/resume/upload`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		)
		return response.data
	},
	viewResume: async (userId: string) => {
		const response = await axios.get(`${API_URL}/resume/${userId}`, {
			responseType: 'blob',
		})
		const blob = new Blob([response.data], { type: 'application/pdf' })
		return URL.createObjectURL(blob)
	},
}
