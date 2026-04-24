import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector, logout } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
	HiOutlineBriefcase, 
	HiOutlineViewGrid, 
	HiOutlineSearch, 
	HiOutlineUserCircle, 
	HiOutlineLogout,
	HiMenu,
	HiX,
	HiChevronDown,
	HiOutlineOfficeBuilding,
	HiOutlineClipboardList
} from 'react-icons/hi'

const NavBar = () => {
	const { user } = useAppSelector((state) => state.auth)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	
	const [isOpen, setIsOpen] = useState(false)
	const [isProfileOpen, setIsProfileOpen] = useState(false)
	const [scrolled, setScrolled] = useState(false)

	// Close menus on navigation
	useEffect(() => {
		setIsOpen(false)
		setIsProfileOpen(false)
	}, [location])

	// Handle scroll for glassmorphism effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const handleLogout = async () => {
		await dispatch(logout())
		navigate('/login')
	}

	const navLinks = user?.role === 'recruiter' 
		? [
			{ name: 'Dashboard', path: '/recruiter/dashboard', icon: HiOutlineViewGrid },
			{ name: 'Manage Jobs', path: '/recruiter/jobs/manage', icon: HiOutlineOfficeBuilding },
			{ name: 'Applicants', path: '/recruiter/applications', icon: HiOutlineClipboardList },
		  ]
		: [
			{ name: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
			{ name: 'Browse Jobs', path: '/candidate/browseJobs', icon: HiOutlineSearch },
		  ]

	return (
		<nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
			scrolled 
				? 'bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm py-2' 
				: 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-4'
		}`}>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center'>
					{/* Logo */}
					<div 
						className='flex items-center gap-2 cursor-pointer group'
						onClick={() => navigate('/dashboard')}
					>
						<div className='w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300'>
							<HiOutlineBriefcase className='text-white text-xl' />
						</div>
						<span className='font-sans text-2xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight'>
							<span className='text-emerald-600'>Job Portal</span>
						</span>
					</div>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center gap-1'>
						{navLinks.map((link) => (
							<NavLink
								key={link.path}
								to={link.path}
								end={link.path === '/dashboard' || link.path === '/recruiter/dashboard'}
								className={({ isActive }) =>
									`relative px-4 py-2 text-sm font-bold transition-all flex items-center gap-2 rounded-xl group ${
										isActive
											? 'text-emerald-700 bg-emerald-50/50'
											: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
									}`
								}
							>
								{({ isActive }) => (
									<>
										<link.icon className={`text-lg transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
										{link.name}
										{isActive && (
											<motion.div 
												layoutId="nav-underline"
												className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full"
												transition={{ type: 'spring', stiffness: 380, damping: 30 }}
											/>
										)}
									</>
								)}
							</NavLink>
						))}

						{/* User Profile Dropdown */}
						{user && (
							<div className="relative ml-4 pl-4 border-l border-slate-200">
								<button
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group"
								>
									<div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
										{user.displayName?.charAt(0) || 'U'}
									</div>
									<div className="hidden lg:block text-left">
										<p className="text-xs font-black text-slate-900 leading-none">
											{user.displayName || 'User'}
										</p>
										<p className="text-[10px] font-bold text-slate-500 capitalize">
											{user.role}
										</p>
									</div>
									<HiChevronDown className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
								</button>

								<AnimatePresence>
									{isProfileOpen && (
										<motion.div
											initial={{ opacity: 0, y: 10, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 10, scale: 0.95 }}
											className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50"
										>
											<div className="px-4 py-3 border-b border-slate-50">
												<p className="text-sm font-black text-slate-900">{user.displayName}</p>
												<p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
											</div>
											<button
												onClick={() => navigate('/profile')}
												className="w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
											>
												<HiOutlineUserCircle className="text-lg text-slate-400" />
												My Profile
											</button>
											<button
												onClick={handleLogout}
												className="w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-left"
											>
												<HiOutlineLogout className="text-lg" />
												Sign Out
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						)}
					</div>

					{/* Mobile Menu Toggle */}
					<div className='md:hidden flex items-center gap-3'>
						{user && (
							<button 
								onClick={() => navigate('/profile')}
								className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs active:scale-90 transition-transform"
							>
								{user.displayName?.charAt(0) || 'U'}
							</button>
						)}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className='p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all'
						>
							{isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md overflow-hidden'
					>
						<div className='px-4 py-6 space-y-2'>
							{navLinks.map((link) => (
								<NavLink
									key={link.path}
									to={link.path}
									className={({ isActive }) =>
										`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
											isActive
												? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
												: 'text-slate-600 hover:bg-slate-100'
										}`
									}
								>
									<link.icon className='text-xl' />
									{link.name}
								</NavLink>
							))}
							
							{user && (
								<div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-1">
									<button
										onClick={() => navigate('/profile')}
										className='w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-slate-600 hover:bg-slate-100 transition-all'
									>
										<HiOutlineUserCircle className='text-xl' />
										My Profile
									</button>
									<button
										onClick={handleLogout}
										className='w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 transition-all'
									>
										<HiOutlineLogout className='text-xl' />
										Sign Out
									</button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	)
}

export default NavBar
