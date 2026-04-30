import axios from 'axios'
const BASE_URL = import.meta.env.VITE_URL
const API_URL = `${BASE_URL}/api/jobs`

export const jobService = {
	getAllJobs: async (
		options: {
			keyword?: string
			location?: string
			signal?: AbortSignal
		} = {},
	) => {
		const { signal, ...params } = options
		const response = await axios.get(API_URL, {
			params,
			signal,
		})
		return response.data
	},

	createJob: async (jobData: any) => {
		const response = await axios.post(API_URL, jobData)
		return response.data
	},

	getRecruiterJobs: async () => {
		const response = await axios.get(`${API_URL}/me`)
		return response.data
	},

	updateJob: async (id: string, jobData: any) => {
		const response = await axios.put(`${API_URL}/${id}`, jobData)
		return response.data
	},

	deleteJob: async (id: string) => {
		const response = await axios.delete(`${API_URL}/${id}`)
		return response.data
	},

	applyForJob: async (id: string) => {
		const response = await axios.post(`${API_URL}/${id}/apply`)
		return response.data
	},

	getApplications: async () => {
		const response = await axios.get(`${API_URL}/applications`)
		return response.data
	},
	updateApplicationStatus: async (applicationId: string, status: string, rejectionReason?: string) => {
		const payload: any = { status }
		if (status === 'rejected' && rejectionReason) {
			payload.rejectionReason = rejectionReason
		}
		const response = await axios.put(
			`${API_URL}/applications/${applicationId}/status`,
			payload,
		)
		return response.data
	},
	getMyApplications: async () => {
		const response = await axios.get(`${API_URL}/my-applications`)
		return response.data
	},
	generateJobDescription: async (title: string, company?: string) => {
		const response = await axios.post(`${API_URL}/generate-description`, {
			title,
			company,
		})
		return response.data
	},
}
