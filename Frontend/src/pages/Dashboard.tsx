import { useEffect, useState } from 'react'
import { useAppSelector } from '../store'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../api/jobService'
import { motion } from 'framer-motion'
import {
	HiClock,
	HiOutlineBriefcase,
	HiOutlineSearch,
	HiOutlineTrendingUp,
	HiOutlineCheckCircle,
	HiOutlineXCircle,
	HiOutlineChevronRight,
} from 'react-icons/hi'
import { MdLocationPin, MdDashboard } from 'react-icons/md'

interface Application {
	id: string
	jobId: string
	status: string
	appliedAt: any
	resumeUrl: string
	job: {
		title: string
		company: string
		location: string
	}
}

const Dashboard = () => {
	const { user } = useAppSelector((state) => state.auth)
	const navigate = useNavigate()

	const [applications, setApplications] = useState<Application[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (user) {
			fetchData()
		}
	}, [user])

	const fetchData = async () => {
		try {
			setLoading(true)
			const appsData = await jobService.getMyApplications()
			setApplications(appsData.applications || [])
		} catch (err: any) {
			console.error('Error fetching dashboard data:', err)
			setError('Failed to load your applications')
		} finally {
			setLoading(false)
		}
	}

	if (!user) return null

	const stats = {
		total: applications.length,
		pending: applications.filter((a) => !a.status || a.status === 'pending')
			.length,
		accepted: applications.filter((a) => a.status === 'accepted').length,
		rejected: applications.filter((a) => a.status === 'rejected').length,
	}

	const calculateCompleteness = () => {
		let score = 0
		const totalFields = 5

		if (user.displayName) score++
		if (user.title) score++
		if (user.experience) score++
		if (user.skills && user.skills.length > 0) score++
		if (user.resumeUrl) score++

		return Math.round((score / totalFields) * 100)
	}

	const completeness = calculateCompleteness()

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1 },
	}

	return (
		<div className='p-8 font-sans max-w-7xl mx-auto bg-slate-50/50 min-h-screen'>
			{/* Header */}
			<div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3'>
						<MdDashboard className='text-emerald-500' />
						Job Seeker Dashboard
					</h1>
					<p className='text-slate-500 font-medium'>
						Welcome back,{' '}
						<span className='text-slate-800 font-bold'>
							{user.displayName || 'Candidate'}
						</span>
						. Track your applications and find your next opportunity.
					</p>
				</div>
				<div className='flex gap-3'>
					<button
						onClick={() => navigate('/candidate/browseJobs')}
						className='px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-emerald-200 flex items-center gap-2 cursor-pointer active:scale-95'
					>
						<HiOutlineSearch size={18} /> Browse New Jobs
					</button>
				</div>
			</div>

			{loading ? (
				<div className='flex justify-center items-center h-64'>
					<div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
				</div>
			) : (
				<motion.div
					variants={containerVariants}
					initial='hidden'
					animate='visible'
				>
					{/* Stats Grid */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
						{/* Total Applied */}
						<motion.div
							variants={itemVariants}
							className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group'
						>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineBriefcase size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.total}
								</h3>
								<p className='text-sm font-bold text-slate-500'>Applied Jobs</p>
							</div>
						</motion.div>

						{/* Pending Review */}
						<motion.div
							variants={itemVariants}
							className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group'
						>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiClock size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.pending}
								</h3>
								<p className='text-sm font-bold text-slate-500'>
									Pending Review
								</p>
							</div>
						</motion.div>

						{/* Accepted */}
						<motion.div
							variants={itemVariants}
							className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group'
						>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineCheckCircle size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.accepted}
								</h3>
								<p className='text-sm font-bold text-slate-500'>Accepted</p>
							</div>
						</motion.div>

						{/* Rejected */}
						<motion.div
							variants={itemVariants}
							className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group'
						>
							<div className='absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out'></div>
							<div className='relative z-10'>
								<div className='w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4'>
									<HiOutlineXCircle size={24} />
								</div>
								<h3 className='text-3xl font-black text-slate-900 mb-1'>
									{stats.rejected}
								</h3>
								<p className='text-sm font-bold text-slate-500'>Rejected</p>
							</div>
						</motion.div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Recent Applications Feed */}
						<motion.div
							variants={itemVariants}
							className='lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'
						>
							<div className='px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
								<h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
									<HiOutlineTrendingUp className='text-emerald-500' />
									Application Status
								</h2>
								<button
									onClick={() => navigate('/candidate/browseJobs')}
									className='link-theme text-sm flex items-center gap-1 hover:gap-2 transition-all'
								>
									Find More <HiOutlineChevronRight size={14} />
								</button>
							</div>

							<div className='divide-y divide-slate-100'>
								{error ? (
									<div className='p-12 text-center text-red-500 font-medium'>
										{error}
									</div>
								) : applications.length === 0 ? (
									<div className='p-12 text-center'>
										<p className='text-slate-400 italic mb-6'>
											You haven't applied for any jobs yet.
										</p>
										<button
											onClick={() => navigate('/candidate/browseJobs')}
											className='link-theme'
										>
											Browse Job Openings
										</button>
									</div>
								) : (
									applications.map((app) => (
										<div
											key={app.id}
											className='p-6 hover:bg-slate-50 transition-all flex items-center justify-between gap-4 group cursor-default'
										>
											<div className='flex items-center gap-4'>
												<div className='w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-sm border-2 border-white shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors'>
													{app.job.company.charAt(0).toUpperCase()}
												</div>
												<div>
													<p className='text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors'>
														{app.job.title}
													</p>
													<div className='flex items-center gap-3 mt-1'>
														<p className='text-sm font-bold text-slate-500'>
															{app.job.company}
														</p>
														<span className='w-1 h-1 bg-slate-300 rounded-full'></span>
														<p className='text-sm text-slate-400 flex items-center gap-1 font-medium'>
															<MdLocationPin className='text-slate-300' />
															{app.job.location}
														</p>
													</div>
												</div>
											</div>
											<div className='flex flex-col items-end gap-2'>
												<span
													className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
														app.status === 'accepted'
															? 'bg-emerald-100 text-emerald-700'
															: app.status === 'rejected'
																? 'bg-red-100 text-red-700'
																: 'bg-amber-100 text-amber-700'
													}`}
												>
													{app.status || 'Pending'}
												</span>
												<span className='text-[10px] font-bold text-slate-400'>
													{app.appliedAt
														? new Date(
																app.appliedAt._seconds * 1000,
															).toLocaleDateString()
														: 'Recent'}
												</span>
											</div>
										</div>
									))
								)}
							</div>
						</motion.div>

						{/* Sidebar / Profile Completeness */}
						<div className='space-y-6'>
							<motion.div
								variants={itemVariants}
								className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm'
							>
								<h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
									Profile Strength
								</h3>
								<div className='relative pt-1'>
									<div className='flex mb-2 items-center justify-between'>
										<div>
											<span className='text-[10px] font-black inline-block py-1 px-2 uppercase rounded-lg text-emerald-700 bg-emerald-100 tracking-wider'>
												{completeness === 100 ? 'Complete' : 'Professional'}
											</span>
										</div>
										<div className='text-right'>
											<span className='text-sm font-black text-emerald-600'>
												{completeness}%
											</span>
										</div>
									</div>
									<div className='overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-emerald-50 border border-emerald-100'>
										<motion.div
											initial={{ width: 0 }}
											animate={{
												width: `${completeness}%`,
											}}
											transition={{
												duration: 1,
												ease: 'easeOut',
											}}
											className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500'
										></motion.div>
									</div>
									<p className='text-xs text-slate-500 font-medium leading-relaxed'>
										{completeness === 100
											? 'Your profile is fully updated! You are ready to land your dream job.'
											: 'Adding a professional profile picture and updating your skills increases your chances of getting hired!'}
									</p>
									<button
										onClick={() => navigate('/profile')}
										className='mt-6 w-full py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95'
									>
										{completeness === 100 ? 'View Profile' : 'Complete Profile'}{' '}
										<HiOutlineChevronRight />
									</button>
								</div>
							</motion.div>


						</div>
					</div>
				</motion.div>
			)}
		</div>
	)
}

export default Dashboard
