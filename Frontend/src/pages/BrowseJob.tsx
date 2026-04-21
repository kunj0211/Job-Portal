import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'
import JobDetail from '../components/JobDetail'

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
	const [jobs, setJobs] = useState<Job[]>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [selectedJob, setSelectedJob] = useState<Job>()

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
		<>
			<div className='min-h-screen max-w-7xl mx-auto px-4 py-12'>
				<div className='flex flex-wrap gap-2 '>
					{loading && (
						<p className='text-lg text-slate-600'>
							Loading jobs...
						</p>
					)}
					{error && <p className='text-lg text-red-600'>{error}</p>}
					{!loading && !error && jobs?.length === 0 && (
						<p className='text-lg text-slate-600'>
							No jobs available at the moment.
						</p>
					)}
					<div className='flex flex-wrap gap-4 w-full m-3'>
						{!loading &&
							!error &&
							jobs?.map((job) => (
								<div
									key={job.id}
									className='bg-white rounded-lg shadow-md p-6 border border-slate-200 w-full md:w-[48%] lg:w-[31%] cursor-pointer transition duration-300 ease-in-out hover:shadow-lg hover:-translate-y-3'
									onClick={() => {
										setSelectedJob(job)
										setIsOpen(true)
									}}
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
			<JobDetail
				job={selectedJob || ({} as Job)}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	)
}

export default BrowseJob
