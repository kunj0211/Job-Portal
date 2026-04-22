import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import googleIcon from '../assets/icons/google-icon-logo-svgrepo-com.svg'
import { HiEye, HiEyeOff } from 'react-icons/hi'

import { useAppDispatch, useAppSelector, login, googleLogin } from '../store'

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const { loading } = useAppSelector((state) => state.auth)
	const [showPassword, setShowPassword] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	})

	const onSubmit = async (data: LoginFormValues) => {
		const resultAction = await dispatch(login(data))
		if (login.fulfilled.match(resultAction)) {
			toast.success('Login successful!')
			navigate('/dashboard')
		} else {
			toast.error((resultAction.payload as string) || 'Login failed')
		}
	}

	const handleGoogleSignIn = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider)
			const idToken = await result.user.getIdToken()
			const refreshToken = result.user.refreshToken

			const resultAction = await dispatch(
				googleLogin({ idToken, refreshToken }),
			)
			if (googleLogin.fulfilled.match(resultAction)) {
				toast.success('Google Sign-In successful!')
				navigate('/dashboard')
			} else {
				toast.error(
					(resultAction.payload as string) || 'Google Sign-In failed',
				)
			}
		} catch (error: any) {
			toast.error(error.message || 'Google Sign-In failed')
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-slate-50 p-4'>
			<div className='w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-sm shadow-emerald-100/20'>
				<div className='text-center mb-8'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4'>
						<svg
							className='w-8 h-8'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
							/>
						</svg>
					</div>
					<h2 className='text-3xl font-bold text-slate-900 mb-2'>
						Welcome Back
					</h2>
					<p className='text-slate-500'>
						Log in to your account to continue
					</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
						>
							Email Address
						</label>
						<input
							id='email'
							{...register('email')}
							autoComplete='email'
							className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400'
							placeholder='name@gmail.com'
						/>
						{errors.email && (
							<p className='mt-1.5 text-xs font-medium text-red-500 ml-1'>
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='password'
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
						>
							Password
						</label>
						<div className='relative'>
							<input
								id='password'
								type={showPassword ? 'text' : 'password'}
								{...register('password')}
								autoComplete='current-password'
								className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 pr-11'
								placeholder='••••••••'
								maxLength={15}
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer'
							>
								{showPassword ? (
									<HiEyeOff size={20} />
								) : (
									<HiEye size={20} />
								)}
							</button>
						</div>
						{errors.password && (
							<p className='mt-1.5 text-xs font-medium text-red-500 ml-1'>
								{errors.password.message}
							</p>
						)}
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 active:scale-[0.98] cursor-pointer'
					>
						{loading ? 'Login...' : 'Login'}
					</button>
				</form>

				<div className='mt-8 flex items-center justify-center space-x-4'>
					<div className='h-px flex-1 bg-slate-100'></div>
					<span className='text-slate-400 text-xs font-bold uppercase tracking-wider'>
						or join with
					</span>
					<div className='h-px flex-1 bg-slate-100'></div>
				</div>

				<button
					onClick={handleGoogleSignIn}
					disabled={loading}
					className='mt-6 w-full py-3.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center justify-center space-x-3 hover:shadow-md disabled:opacity-50 active:scale-[0.98] cursor-pointer'
				>
					<img src={googleIcon} alt='Google' className='w-5 h-5' />
					<span>Continue with Google</span>
				</button>

				<p className='mt-8 text-center text-slate-500 text-sm'>
					New here?{' '}
					<Link
						to='/signup'
						className='text-emerald-600 hover:text-emerald-700 font-bold transition-colors underline-offset-4 hover:underline'
					>
						Create an account
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Login
