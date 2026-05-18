import { useEffect, useState, useMemo } from 'react'
import { useGetAllJobsQuery } from '../api/jobApi'
import JobDetail from '../components/JobDetail'
import Pagination from '../components/Pagination'
import { HiSearch, HiOutlineBriefcase, HiOutlineEye } from 'react-icons/hi'

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
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [selectedJob, setSelectedJob] = useState<Job>()
	const [keyword, setKeyword] = useState<string>('')
	const [debouncedKeyword, setDebouncedKeyword] = useState<string>('')

	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(6)

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setDebouncedKeyword(keyword)
			setCurrentPage(1)
		}, 300)

		return () => clearTimeout(debounceTimer)
	}, [keyword])

	const {
		data,
		isLoading: loading,
		error: fetchError,
	} = useGetAllJobsQuery(
		debouncedKeyword ? { keyword: debouncedKeyword } : {},
	)
	const error = fetchError
		? (fetchError as any).data?.error || 'Failed to load jobs'
		: null

	const jobs = useMemo(() => {
		let filteredJobs: Job[] = data?.jobs || []
		const query = debouncedKeyword.trim().toLowerCase()
		if (query) {
			filteredJobs = filteredJobs.filter(
				(job: Job) =>
					(job.title || '').toLowerCase().includes(query) ||
					(job.company || '').toLowerCase().includes(query) ||
					(job.location || '').toLowerCase().includes(query),
			)
		}
		return filteredJobs
	}, [data, debouncedKeyword])

	const paginatedJobs = jobs?.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	const totalPages = jobs ? Math.ceil(jobs.length / itemsPerPage) : 0

	return (
		<>
			<div className='p-8 font-sans max-w-7xl mx-auto min-h-screen'>
				{/* Header Area */}
				<div className='flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-200 gap-4'>
					<div>
						<h1 className='text-3xl font-bold text-slate-800 tracking-tight'>
							Browse Jobs
						</h1>
						<p className='text-slate-500 mt-1'>
							Find your next career opportunity
						</p>
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
								<HiOutlineBriefcase
									className='text-emerald-400'
									size={36}
								/>
							</div>
							<h3 className='text-xl font-bold text-slate-800 mb-2 tracking-tight'>
								{keyword.trim()
									? 'No matching jobs found'
									: 'No jobs available'}
							</h3>
							<p className='text-slate-500 mb-4 max-w-md mx-auto'>
								{keyword.trim()
									? `We couldn't find any jobs matching "${keyword}". Try adjusting your search.`
									: 'Check back later for new career opportunities.'}
							</p>
						</div>
					) : (
						<>
							<div className='overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm -mx-4 sm:mx-0'>
								<table className='w-full min-w-[900px]'>
									<thead>
										<tr className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 sticky top-0'>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Actions
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Role
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Company
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Location
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Job-type
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Salary
											</th>
											<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
												Experience
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-slate-200'>
										{paginatedJobs?.map((job) => (
											<tr
												key={job.id}
												className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-emerald-50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-colors'
											>
												<td className='flex items-center gap-2 '>
													<button
														onClick={() => {
															setSelectedJob(job)
															setIsOpen(true)
														}}
														className='p-1.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg hover:cursor-pointer transition-colors shadow-sm'
														title='View Details'
													>
														<HiOutlineEye size={18} />
													</button>
												</td>
												<td className='text-sm font-semibold text-slate-900 truncate flex items-center'>
													{job.title}
												</td>
												<td className='text-sm truncate flex items-center'>
													{job.company}
												</td>
												<td className='text-sm text-slate-700 truncate flex items-center'>
													{job.location}
												</td>
												<td className='text-sm text-slate-700 flex items-center'>
													{job.jobType}
												</td>
												<td className='text-sm text-slate-700 flex items-center'>
													{job.salaryRange || 'N/A'}
												</td>
												<td className='text-sm text-slate-700 flex items-center'>
													{job.experience || 'N/A'}
												</td>
											</tr>
										))}
									</tbody>
								</table>
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
