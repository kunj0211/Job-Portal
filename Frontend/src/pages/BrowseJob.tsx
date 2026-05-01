import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'
import JobDetail from '../components/JobDetail'
import Pagination from '../components/Pagination'
import { HiSearch, HiOutlineBriefcase } from 'react-icons/hi'

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
	
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(9)

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
			setCurrentPage(1)
		}, 300) // 300ms debounce

		return () => clearTimeout(debounceTimer)
	}, [keyword])

	const paginatedJobs = jobs?.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	)
	
	const totalPages = jobs ? Math.ceil(jobs.length / itemsPerPage) : 0

	return (
		<>
			<div className='p-8 font-sans max-w-7xl mx-auto min-h-screen'>
				{/* Header Area */}
				<div className='flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-200 gap-4'>
					<div>
						<h1 className='text-3xl font-bold text-slate-800 tracking-tight'>Browse Jobs</h1>
						<p className='text-slate-500 mt-1'>Find your next career opportunity</p>
					</div>
					<div className='relative w-full max-w-xs'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiSearch className='text-slate-400' size={18} />
						</div>
						<input
							type='text'
							placeholder='Search jobs, companies...'
							className='block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 bg-white transition-all outline-none text-sm shadow-sm'
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
					</div>
				</div>

				{/* Main Content Area */}
				<div>
					<h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
						Available Positions
					</h2>

					{loading ? (
						<div className='flex justify-center p-12'>
							<div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
						</div>
					) : error ? (
						<div className='bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center'>
							{error}
						</div>
					) : jobs?.length === 0 ? (
						<div className='text-center p-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'>
							<div className='w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-100/50'>
								<HiOutlineBriefcase className='text-emerald-400' size={36} />
							</div>
							<h3 className='text-xl font-bold text-slate-800 mb-2 tracking-tight'>
								{keyword.trim() ? 'No matching jobs found' : 'No jobs available'}
							</h3>
							<p className='text-slate-500 mb-4 max-w-md mx-auto'>
								{keyword.trim() 
									? `We couldn't find any jobs matching "${keyword}". Try adjusting your search.`
									: 'Check back later for new career opportunities.'}
							</p>
						</div>
					) : (
						<>
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
								{paginatedJobs?.map((job) => (
									<div
										key={job.id}
									className='bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-100/50 shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-all duration-300 relative group flex flex-col h-full cursor-pointer'
									onClick={() => {
										setSelectedJob(job)
										setIsOpen(true)
									}}
								>
									<div className='flex justify-between items-start mb-4'>
										<h3 className='font-bold text-xl text-slate-800 line-clamp-1' title={job.title}>
											{job.title}
										</h3>
									</div>

									<div className='flex flex-col gap-3 mb-5 grow'>
										<div className='flex items-center gap-2.5 text-sm font-medium text-slate-600'>
											<div className='p-1.5 text-emerald-600'>Company :</div>
											{job.company}
										</div>
										<div className='flex items-center gap-2.5 text-sm font-medium text-slate-600'>
											<div className='p-1.5 text-emerald-600'>Location :</div>
											{job.location}
										</div>
										<div className='flex items-center gap-2.5 text-sm font-medium text-slate-600'>
											<div className='p-1.5 text-emerald-600'>Job Type :</div>
											<span>{job.jobType}</span>
										</div>
										{job.experience && (
											<div className='flex items-center gap-2.5 text-sm font-medium text-slate-600'>
												<div className='p-1.5 text-emerald-600'>Experience :</div>
												<span>{job.experience}</span>
											</div>
										)}
										{job.salaryRange && (
											<div className='flex items-center gap-2.5 text-sm font-medium text-slate-600'>
												<div className='p-1.5 text-emerald-600'>Salary Range :</div>
												<span>{job.salaryRange}</span>
											</div>
										)}
									</div>

									<div className='w-full'>
										<button
											className='w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-emerald-200'
											onClick={(e) => {
												e.stopPropagation();
												setSelectedJob(job);
												setIsOpen(true);
											}}
										>
											View Details & Apply
										</button>
									</div>
									</div>
								))}
							</div>
							
							{jobs && jobs.length > 0 && (
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
									itemsPerPage={itemsPerPage}
									onItemsPerPageChange={(items) => {
										setItemsPerPage(items)
										setCurrentPage(1)
									}}
								/>
							)}
						</>
					)}
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
