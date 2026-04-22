import axios from 'axios'

const API_URL = '/api/auth'

// Configure axios defaults for cookie support
axios.defaults.withCredentials = true

// Response interceptor to handle token expiration and automatic refreshing
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// If error is 401 and not a retry, attempt to refresh tokens
		// IMPORTANT: Ensure we don't try to refresh if the refresh request itself failed with 401
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes('/refresh')
		) {
			originalRequest._retry = true

			try {
				// Attempt to call the refresh endpoint
				await axios.post(`${API_URL}/refresh`)
				// If successful, retry the original request
				return axios(originalRequest)
			} catch (refreshError) {
				// If refresh fails, the session is invalid - let the app handle redirection
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	},
)

export const authService = {
	register: async (userData: any) => {
		const response = await axios.post(`${API_URL}/register`, userData)
		return response.data
	},
	login: async (credentials: any) => {
		const response = await axios.post(`${API_URL}/login`, credentials)
		return response.data
	},
	verifyGoogleAuth: async (idToken: string, refreshToken: string) => {
		const response = await axios.post(`${API_URL}/google-signin`, {
			idToken,
			refreshToken,
		})
		return response.data
	},
	logout: async () => {
		const response = await axios.post(`${API_URL}/logout`)
		return response.data
	},
	checkAuth: async () => {
		const response = await axios.get(`${API_URL}/me`)
		return response.data
	},
	updateProfile: async (profileData: { displayName?: string; resumeUrl?: string }) => {
		const response = await axios.put(`${API_URL}/profile`, profileData)
		return response.data
	},
}
