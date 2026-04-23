import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector, fetchRecruiterJobs } from '../store'
import { jobService } from '../api/jobService'
import { useNavigate } from 'react-router-dom'
import {
	HiOutlineBriefcase,
	HiOutlineUserGroup,
	HiOutlineClock,
	HiOutlinePlus,
	HiOutlineClipboardList,
} from 'react-icons/hi'
import { MdOutlineDashboard } from 'react-icons/md'

interface DashboardStats {
	totalJobs: number
	totalApplications: number
	pendingApplications: number
	acceptedApplications: number
	rejectedApplications: number
}

interface RecentApplicant {
	applicationId: string
	candidateName: string
	jobTitle: string
	appliedAt: any
	status: string
}

const RecruiterDashboard = () => {
	const { user } = useAppSelector((state) => state.auth)
	const { jobs } = useAppSelector((state) => state.jobs)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const [stats, setStats] = useState<DashboardStats>({
		totalJobs: 0,
		totalApplications: 0,
		pendingApplications: 0,
		acceptedApplications: 0,
		rejectedApplications: 0,
	})
	const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>(
		[],
	)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		dispatch(fetchRecruiterJobs())

		const fetchDashboardData = async () => {
			try {
				setLoading(true)
				const appsData = await jobService.getApplications()

				let totalApps = 0
				let pending = 0
				let accepted = 0
				let rejected = 0
				const allApplicants: RecentApplicant[] = []

				if (appsData && appsData.applications) {
					appsData.applications.forEach((job: any) => {
						if (job.applicants) {
							totalApps += job.applicants.length
							job.applicants.forEach((app: any) => {
								if (app.status === 'accepted') accepted++
								else if (app.status === 'rejected') rejected++
								else pending++

								allApplicants.push({
									applicationId: app.applicationId,
									candidateName: app.name,
									jobTitle: job.title,
									appliedAt: app.appliedAt,
									status: app.status || 'pending',
								})
							})
						}
					})
				}

				// Sort by appliedAt descending
				allApplicants.sort((a, b) => {
					const timeA =
						a.appliedAt && typeof a.appliedAt.toDate === 'function'
							? a.appliedAt.toDate().getTime()
							: 0
					const timeB =
						b.appliedAt && typeof b.appliedAt.toDate === 'function'
							? b.appliedAt.toDate().getTime()
							: 0
					return timeB - timeA
				})

				setStats({
					totalJobs: appsData?.applications?.length || 0, // Or use Redux jobs.length
					totalApplications: totalApps,
					pendingApplications: pending,
					acceptedApplications: accepted,
					rejectedApplications: rejected,
				})

				setRecentApplicants(allApplicants.slice(0, 5))
			} catch (error) {
				console.error('Failed to fetch dashboard data', error)
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [dispatch])

	// Sync total jobs with Redux state for better accuracy if they add a job without refreshing
	useEffect(() => {
		setStats((prev) => ({ ...prev, totalJobs: jobs.length }))
	}, [jobs.length])

	if (!user) return null

	return (
		<div className='p-8 font-sans max-w-7xl mx-auto bg-slate-50/50 min-h-screen'>
			{/* Header */}
			<div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3'>
						<MdOutlineDashboard className='text-emerald-500' />
						Recruiter Dashboard
					</h1>
					<p className='text-slate-500 font-medium'>
						Welcome back,{' '}
						<span className='text-slate-800 font-bold'>
							{user.displayName}
						</span>
						. Here's what's happening with your job postings.
					</p>
				</div>
				<div className='flex gap-3'>
					<button
						onClick={() => navigate('/recruiter/jobs/manage')}
						className='px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-emerald-200 flex items-center gap-2 cursor-pointer'
					>
						<HiOutlinePlus size={18} /> Post New Job
					</button>
				</div>
			</div>

			{loading ? (
				<div className='flex justify-center items-center h-64'>
					<div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
						{/* Total Jobs */}
						<div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group'>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineBriefcase size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.totalJobs}
								</h3>
								<p className='text-sm font-bold text-slate-500'>
									Active Job Postings
								</p>
							</div>
						</div>

						{/* Total Applications */}
						<div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group'>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineUserGroup size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.totalApplications}
								</h3>
								<p className='text-sm font-bold text-slate-500'>
									Total Applications
								</p>
							</div>
						</div>

						{/* Pending Applications */}
						<div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group'>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineClock size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.pendingApplications}
								</h3>
								<p className='text-sm font-bold text-slate-500'>
									Pending Review
								</p>
							</div>
						</div>

						{/* Accepted Applications */}
						<div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group'>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineClipboardList size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.acceptedApplications}
								</h3>
								<p className='text-sm font-bold text-slate-500'>
									Candidates Accepted
								</p>
							</div>
						</div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Recent Applications Feed */}
						<div className='lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
							<div className='px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
								<h2 className='text-lg font-bold text-slate-800'>
									Recent Applications
								</h2>
								<button
									onClick={() =>
										navigate('/recruiter/applications')
									}
									className='text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer'
								>
									View All
								</button>
							</div>

							<div className='divide-y divide-slate-100'>
								{recentApplicants.length === 0 ? (
									<div className='p-8 text-center text-slate-500 italic'>
										No applications received yet.
									</div>
								) : (
									recentApplicants.map((app) => (
										<div
											key={app.applicationId}
											className='p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4'
										>
											<div className='flex items-center gap-4'>
												<div className='w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm'>
													{app.candidateName
														.charAt(0)
														.toUpperCase()}
												</div>
												<div>
													<p className='text-sm font-bold text-slate-900'>
														{app.candidateName}
													</p>
													<p className='text-xs font-medium text-emerald-600'>
														{app.jobTitle}
													</p>
												</div>
											</div>
											<div className='flex flex-col items-end gap-1.5'>
												{app.status === 'accepted' ? (
													<span className='px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
														Accepted
													</span>
												) : app.status ===
												  'rejected' ? (
													<span className='px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
														Rejected
													</span>
												) : (
													<span className='px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
														Pending
													</span>
												)}
												<span className='text-[10px] font-bold text-slate-400'>
													{app.appliedAt
														? new Date(
																app.appliedAt
																	._seconds *
																	1000,
															).toLocaleDateString()
														: 'Recent'}
												</span>
											</div>
										</div>
									))
								)}
							</div>
						</div>

						{/* Quick Actions & Tips */}
						<div className='space-y-6'>
							<div className='bg-linear-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden'>
								<div className='absolute right-10 top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl'></div>
								<h3 className='text-xl font-bold mb-2 relative z-10'>
									Need more candidates?
								</h3>
								<p className='text-emerald-100 text-sm font-medium mb-6 relative z-10 leading-relaxed'>
									Make sure your job descriptions are detailed
									and highlight the benefits of working at
									your company.
								</p>
								<button
									onClick={() =>
										navigate('/recruiter/jobs/manage')
									}
									className='w-full py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-bold rounded-xl transition-colors relative z-10 shadow-sm cursor-pointer '
								>
									Review Job Postings
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default RecruiterDashboard
