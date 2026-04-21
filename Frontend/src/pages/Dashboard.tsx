import { useAppDispatch, useAppSelector, logout } from '../store'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
	const { user } = useAppSelector((state) => state.auth)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await dispatch(logout())
		navigate('/login')
	}

	if (!user) return null

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100'>
			<div className='max-w-4xl mx-auto px-4 py-12'>
				<div className='bg-white rounded-lg shadow-lg p-8 border border-slate-200'>
					<h1 className='text-4xl font-bold text-slate-900 mb-2'>
						Welcome
					</h1>
					<button
						onClick={handleLogout}
						className='px-6 py-2.5 border-2 border-red-500 text-red-600 font-bold rounded-xl transition-all hover:bg-red-50 active:scale-95 cursor-pointer'
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
