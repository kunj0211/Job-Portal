import { useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, useAppDispatch, useAppSelector } from './store'
import { checkAuth } from './store'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AddJob from './pages/AddJob'
import NavBar from './components/NavBar'
import BrowseJob from './pages/BrowseJob'
import RecruiterApplications from './pages/RecruiterApplications'
import Profile from './pages/Profile'

const ProtectedRoute = ({
	children,
	requiredRole,
}: {
	children: ReactNode
	requiredRole?: 'candidate' | 'recruiter'
}) => {
	const { user, loading } = useAppSelector((state) => state.auth)

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-slate-50'>
				<div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
			</div>
		)
	}

	if (!user) {
		return <Navigate to='/login' replace />
	}

	if (requiredRole && user.role !== requiredRole) {
		return <Navigate to='/dashboard' replace />
	}

	return <>{children}</>
}

const DashboardRedirector = () => {
	const { user } = useAppSelector((state) => state.auth)

	if (user?.role === 'recruiter') {
		return <Navigate to='/recruiter/dashboard' replace />
	}

	return <Dashboard />
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div>
			<NavBar />
			<div className='content'>{children}</div>
		</div>
	)
}

const AppContent = () => {
	const dispatch = useAppDispatch()

	useEffect(() => {
		dispatch(checkAuth())
	}, [dispatch])

	return (
		<Routes>
			{/* Public Routes */}
			<Route path='/login' element={<Login />} />
			<Route path='/signup' element={<Signup />} />

			{/* Protected Dashboard Routes */}
			<Route
				path='/dashboard'
				element={
					<ProtectedRoute>
						<DashboardLayout>
							<DashboardRedirector />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path='/candidate/browseJobs'
				element={
					<ProtectedRoute>
						<DashboardLayout>
							<BrowseJob />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path='/candidate/profile'
				element={
					<ProtectedRoute>
						<DashboardLayout>
							<Profile />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path='/recruiter/dashboard'
				element={
					<ProtectedRoute requiredRole='recruiter'>
						<DashboardLayout>
							<RecruiterDashboard />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>

			<Route
				path='/recruiter/jobs/manage'
				element={
					<ProtectedRoute requiredRole='recruiter'>
						<DashboardLayout>
							<AddJob />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>

			<Route
				path='/recruiter/applications'
				element={
					<ProtectedRoute requiredRole='recruiter'>
						<DashboardLayout>
							<RecruiterApplications />
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>

			<Route path='/' element={<Navigate to='/dashboard' replace />} />

			<Route path='*' element={<Navigate to='/dashboard' replace />} />
		</Routes>
	)
}

function App() {
	return (
		<Provider store={store}>
			<AppContent />
		</Provider>
	)
}

export default App
