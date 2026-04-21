import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector, logout } from '../store'

const NavBar = () => {
	const { user } = useAppSelector((state) => state.auth)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await dispatch(logout())
		navigate('/login')
	}

	return (
		<nav className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					<div className='flex items-center'>
						<span className='font-sans text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight'>
							JobPortal
						</span>
					</div>
					<div></div>

					<div className='hidden md:flex items-center space-x-2'>
						<NavLink
							to={
								user?.role === 'recruiter'
									? '/recruiter/dashboard'
									: '/dashboard'
							}
							className={({ isActive }) =>
								`px-4 py-2 text-sm font-bold transition-all ${
									isActive
										? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50'
										: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
								}`
							}
						>
							Dashboard
						</NavLink>

						{user?.role === 'recruiter' && (
							<>
								<NavLink
									to='/recruiter/jobs/manage'
									className={({ isActive }) =>
										`px-4 py-2 text-sm font-bold transition-all ${
											isActive
												? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50'
												: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
										}`
									}
								>
									Add / Manage Jobs
								</NavLink>
								<NavLink
									to='/recruiter/applications'
									className={({ isActive }) =>
										`px-4 py-2 text-sm font-bold transition-all ${
											isActive
												? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50'
												: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
										}`
									}
								>
									Applicants
								</NavLink>
							</>
						)}

						{user?.role !== 'recruiter' && (
							<NavLink
								to='/candidate/browseJobs'
								className={({ isActive }) =>
									`px-4 py-2 text-sm font-bold transition-all ${
										isActive
											? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50'
											: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
									}`
								}
							>
								Browse Jobs
							</NavLink>
						)}

						{user && (
							<button
								onClick={handleLogout}
								className='ml-4 px-5 py-2 border-2 border-red-100 text-red-600 font-bold text-sm rounded-xl transition-all hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer'
							>
								Logout
							</button>
						)}
					</div>
				</div>
			</div>
		</nav>
	)
}

export default NavBar
