import axios from 'axios'

const API_URL = '/api/jobs'

export const jobService = {
	getAllJobs: async (params?: {
		keyword?: string
		location?: string
		signal?: AbortSignal
	}) => {
		const { signal, ...queryParams } = params || {}
		const response = await axios.get(API_URL, {
			params: queryParams,
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
}
