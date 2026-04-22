import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector, logout } from '../store'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../api/jobService'
import { HiCheckCircle, HiClock } from 'react-icons/hi'
import { MdOutlineWorkOutline } from 'react-icons/md'

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
	const dispatch = useAppDispatch()
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

	const handleLogout = async () => {
		await dispatch(logout())
		navigate('/login')
	}

	if (!user) return null

	return (
		<div className='min-h-screen bg-slate-50 py-12'>
			<div className='max-w-6xl mx-auto px-4'>
				<div className='flex justify-between items-center mb-8'>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>Candidate Dashboard</h1>
						<p className='text-slate-500'>Welcome back, {user.displayName || 'Candidate'}</p>
					</div>
					<button
						onClick={handleLogout}
						className='px-6 py-2 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95'
					>
						Logout
					</button>
				</div>

				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
					<div className='px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white'>
						<h3 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
							<MdOutlineWorkOutline className='text-emerald-500' size={24} />
							My Applications
						</h3>
						<span className='px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full'>
							{applications.length} Total
						</span>
					</div>

					<div className='divide-y divide-slate-100'>
						{loading ? (
							<div className='p-12 text-center'>
								<div className='inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
								<p className='mt-4 text-slate-500'>Loading applications...</p>
							</div>
						) : error ? (
							<div className='p-12 text-center text-red-500'>{error}</div>
						) : applications.length === 0 ? (
							<div className='p-12 text-center'>
								<p className='text-slate-400 italic mb-4'>You haven't applied for any jobs yet.</p>
								<button
									onClick={() => navigate('/candidate/browseJobs')}
									className='px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200'
								>
									Find Jobs Now
								</button>
							</div>
						) : (
							applications.map((app) => (
								<div
									key={app.id}
									className='p-8 hover:bg-slate-50/50 transition-colors'
								>
									<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
										<div>
											<h4 className='text-lg font-bold text-slate-900 mb-1'>
												{app.job.title}
											</h4>
											<div className='flex flex-wrap gap-4 text-sm text-slate-600'>
												<span className='font-medium'>{app.job.company}</span>
												<span>•</span>
												<span>{app.job.location}</span>
												<span>•</span>
												<span className='flex items-center gap-1'>
													<HiClock className='text-slate-400' />
													{app.appliedAt
														? new Date(
																app.appliedAt._seconds * 1000
															).toLocaleDateString()
														: 'N/A'}
												</span>
											</div>
										</div>
										<div className='flex items-center gap-3'>
											<span
												className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
													app.status === 'accepted'
														? 'bg-emerald-100 text-emerald-700'
														: app.status === 'rejected'
															? 'bg-red-100 text-red-700'
															: 'bg-amber-100 text-amber-700'
												}`}
											>
												{app.status || 'Pending'}
											</span>
											{app.status === 'accepted' && (
												<HiCheckCircle
													className='text-emerald-500'
													size={24}
												/>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
