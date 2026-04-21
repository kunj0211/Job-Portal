import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'
import JobDetail from '../components/JobDetail'
import { HiSearch } from 'react-icons/hi'

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
	const [keyword, setKeyword] = useState<string>('')
	const [abortController, setAbortController] = useState<AbortController | null>(null)

	const fetchJobs = async (searchParams?: { keyword?: string; location?: string }) => {
		// Abort any pending request
		if (abortController) {
			abortController.abort()
		}

		const controller = new AbortController()
		setAbortController(controller)

		try {
			setLoading(true)
			const data = await jobService.getAllJobs({
				...(searchParams || {}),
				signal: controller.signal
			})
			
			let filteredJobs = data.jobs || []
			
			// Frontend filtering fallback
			const query = (searchParams?.keyword || keyword || '').trim().toLowerCase()
			if (query) {
				filteredJobs = filteredJobs.filter((job: Job) => 
					(job.title || '').toLowerCase().includes(query) ||
					(job.company || '').toLowerCase().includes(query) ||
					(job.location || '').toLowerCase().includes(query) ||
					(job.description || '').toLowerCase().includes(query)
				)
			}

			setJobs(filteredJobs)
			setError(null)
		} catch (err: any) {
			if (err.name === 'CanceledError' || err.name === 'AbortError') {
				// Request was aborted, ignore error
				return
			}
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

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			fetchJobs({ keyword })
		}, 300) // 300ms debounce

		return () => clearTimeout(debounceTimer)
	}, [keyword])

	return (
		<>
			<div className='min-h-screen max-w-7xl mx-auto px-4 py-12'>
				<div className='mb-8 flex justify-end items-center'>
					<div className='relative w-full max-w-xs'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiSearch className='text-slate-400' size={18} />
						</div>
						<input
							type='text'
							placeholder='Search jobs...'
							className='block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 bg-white transition-all outline-none text-sm'
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
					</div>
				</div>
				<div className='flex flex-wrap gap-2 '>
					{loading && (
						<p className='text-lg text-slate-600'>
							Loading jobs...
						</p>
					)}
					{error && <p className='text-lg text-red-600'>{error}</p>}
					{!loading && !error && jobs?.length === 0 && (
						<p className='text-lg text-slate-600 px-4'>
							{keyword.trim() 
								? `No jobs found matching "${keyword}"`
								: 'No jobs available at the moment.'
							}
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
