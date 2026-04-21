import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'

interface Job {
	id: string
	title: string
	company: string
	location: string
	jobType: string
	description: string
	salaryRange?: string
	experience?: string
	createdAt?: any
}

const BrowseJob = () => {
	const [jobs, setJobs] = useState<Job[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchJobs = async () => {
			try {
				setLoading(true)
				const data = await jobService.getAllJobs()
				setJobs(data.jobs || [])
				setError(null)
			} catch (err: any) {
				console.error('Error fetching jobs:', err)
				const errorMessage =
					err.response?.data?.error ||
					err.message ||
					'Failed to load jobs'
				setError(errorMessage)
				setJobs([])
			} finally {
				setLoading(false)
			}
		}

		fetchJobs()
	}, [])

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
			<div className='flex flex-wrap gap-2 '>
				{loading && (
					<p className='text-lg text-slate-600'>Loading jobs...</p>
				)}
				{error && <p className='text-lg text-red-600'>{error}</p>}
				{!loading && !error && jobs.length === 0 && (
					<p className='text-lg text-slate-600'>
						No jobs available at the moment.
					</p>
				)}
				<div className='flex flex-wrap gap-4 w-full m-3'>
					{!loading &&
						!error &&
						jobs.map((job) => (
							<div
								key={job.id}
								className='bg-white rounded-lg shadow-md p-6 border border-slate-200 w-full md:w-[48%] lg:w-[31%]'
							>
								<div className='mb-4'>
									<h3 className='text-xl font-bold text-slate-900 mb-1'>
										{job.title}
									</h3>
									<div className='flex items-center gap-2 mt-2'>
										<p className='text-lg text-slate-600'>
											{job.company}
										</p>
									</div>
									<div className='flex items-center gap-2 mt-2'>
										<p className='text-sm text-slate-600'>
											<span className='font-medium text-emerald-600'>
												Salary Range:&nbsp;
											</span>
											{job.salaryRange}
										</p>
									</div>
									<div className='flex items-center gap-2 mt-2'>
										<p className='text-md text-slate-600'>
											<span className='font-medium text-emerald-600'>
												Location:&nbsp;
											</span>
											{job.location}
										</p>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<p className='text-sm text-slate-600'>
										<span className='font-medium text-emerald-600'>
											Job Type:
										</span>{' '}
										{job.jobType}
									</p>
									{job.experience && (
										<p className='text-sm text-slate-600'>
											<span className='font-medium text-emerald-600'>
												Experience:
											</span>{' '}
											{job.experience}
										</p>
									)}
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	)
}

export default BrowseJob
