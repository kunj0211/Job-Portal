import { createApi } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'

import './authService'

const BASE_URL = import.meta.env.VITE_URL
const API_URL = `${BASE_URL}/api/jobs`

export interface Job {
	id?: string
	title: string
	company: string
	location: string
	jobType: 'Full-time' | 'Part-time' | 'Internship'
	description: string
	salaryRange?: string
	experience?: string
	recruiterId?: string
	createdAt?: string
	updatedAt?: string
}

const axiosBaseQuery =
	(
		{ baseUrl }: { baseUrl: string } = { baseUrl: '' },
	): BaseQueryFn<
		{
			url: string
			method: AxiosRequestConfig['method']
			data?: AxiosRequestConfig['data']
			params?: AxiosRequestConfig['params']
		},
		unknown,
		unknown
	> =>
	async ({ url, method, data, params }) => {
		try {
			const result = await axios({
				url: baseUrl + url,
				method,
				data,
				params,
			})
			return { data: result.data }
		} catch (axiosError) {
			const err = axiosError as AxiosError
			return {
				error: {
					status: err.response?.status,
					data: err.response?.data || err.message,
				},
			}
		}
	}

export const jobApi = createApi({
	reducerPath: 'jobApi',
	baseQuery: axiosBaseQuery({ baseUrl: API_URL }),
	tagTypes: ['Job', 'Application'],
	endpoints: (builder) => ({
		getAllJobs: builder.query<
			any,
			{
				keyword?: string
				location?: string
				page?: number
				limit?: number
			}
		>({
			query: (params) => ({
				url: '',
				method: 'GET',
				params,
			}),
			providesTags: ['Job'],
		}),
		getRecruiterJobs: builder.query<{ jobs: Job[] }, void>({
			query: () => ({
				url: '/me',
				method: 'GET',
			}),
			providesTags: ['Job'],
		}),
		createJob: builder.mutation<{ job: Job }, any>({
			query: (jobData) => ({
				url: '',
				method: 'POST',
				data: jobData,
			}),
			invalidatesTags: ['Job'],
		}),
		updateJob: builder.mutation<{ job: Job }, { id: string; jobData: any }>(
			{
				query: ({ id, jobData }) => ({
					url: `/${id}`,
					method: 'PUT',
					data: jobData,
				}),
				invalidatesTags: ['Job'],
			},
		),
		deleteJob: builder.mutation<any, string>({
			query: (id) => ({
				url: `/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Job'],
		}),
		applyForJob: builder.mutation<any, string>({
			query: (id) => ({
				url: `/${id}/apply`,
				method: 'POST',
			}),
			invalidatesTags: ['Application'],
		}),
		getApplications: builder.query<any, void>({
			query: () => ({
				url: '/applications',
				method: 'GET',
			}),
			providesTags: ['Application'],
		}),
		updateApplicationStatus: builder.mutation<
			any,
			{ applicationId: string; status: string; rejectionReason?: string }
		>({
			query: ({ applicationId, status, rejectionReason }) => {
				const payload: any = { status }
				if (status === 'rejected' && rejectionReason) {
					payload.rejectionReason = rejectionReason
				}
				return {
					url: `/applications/${applicationId}/status`,
					method: 'PUT',
					data: payload,
				}
			},
			invalidatesTags: ['Application'],
		}),
		getMyApplications: builder.query<any, void>({
			query: () => ({
				url: '/my-applications',
				method: 'GET',
			}),
			providesTags: ['Application'],
		}),
		generateJobDescription: builder.mutation<
			any,
			{ title: string; company?: string }
		>({
			query: (data) => ({
				url: '/generate-description',
				method: 'POST',
				data,
			}),
		}),
	}),
})

export const {
	useGetAllJobsQuery,
	useGetRecruiterJobsQuery,
	useCreateJobMutation,
	useUpdateJobMutation,
	useDeleteJobMutation,
	useApplyForJobMutation,
	useGetApplicationsQuery,
	useUpdateApplicationStatusMutation,
	useGetMyApplicationsQuery,
	useGenerateJobDescriptionMutation,
} = jobApi
