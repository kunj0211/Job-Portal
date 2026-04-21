import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { authService } from '../api/authService'
import googleIcon from '../assets/icons/google-icon-logo-svgrepo-com.svg'
import { HiEye, HiEyeOff } from 'react-icons/hi'

import { useAppDispatch, useAppSelector, googleLogin } from '../store'

const signupSchema = z
	.object({
		displayName: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z
			.string()
			.min(6, 'Confirm password must be at least 6 characters'),
		role: z.enum(['candidate', 'recruiter'], {
			message: 'Please select your role',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

type SignupFormValues = z.infer<typeof signupSchema>

const Signup = () => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const { loading: authLoading } = useAppSelector((state) => state.auth)
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			role: 'candidate',
		},
	})

	const onSubmit = async (data: SignupFormValues) => {
		try {
			setLoading(true)
			await authService.register(data)
			toast.success('Registration successful! Please log in.')
			navigate('/login')
		} catch (error: any) {
			toast.error(error.response?.data?.error || 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true)
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
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12'>
			<div className='w-full max-w-lg p-8 rounded-3xl bg-white border border-slate-200 shadow-sm shadow-emerald-100/20'>
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
								d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
							/>
						</svg>
					</div>
					<h2 className='text-3xl font-bold text-slate-900 mb-2'>
						Create Account
					</h2>
					<p className='text-slate-500'>
						Join our community to start your journey
					</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
					<div className='grid grid-cols-2 gap-4 mb-6 p-1 bg-slate-50 rounded-2xl border border-slate-100'>
						<label
							className={`
                flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-all
                ${errors.role ? 'border-red-200' : 'border-slate-100'}
                hover:border-emerald-200 hover:bg-emerald-50/50
                has-checked:border-emerald-500 has-checked:bg-emerald-50
              `}
						>
							<input
								type='radio'
								value='candidate'
								{...register('role')}
								className='sr-only'
							/>
							<span className='text-sm font-bold text-slate-700'>
								Job Seeker
							</span>
						</label>
						<label
							className={`
                flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-all
                ${errors.role ? 'border-red-200' : 'border-slate-100'}
                hover:border-emerald-200 hover:bg-emerald-50/50
                has-checked:border-emerald-500 has-checked:bg-emerald-50
              `}
						>
							<input
								type='radio'
								value='recruiter'
								{...register('role')}
								className='sr-only'
							/>
							<span className='text-sm font-bold text-slate-700'>
								Employer
							</span>
						</label>
					</div>
					{errors.role && (
						<p className='text-center -mt-4 mb-4 text-xs font-medium text-red-500'>
							{errors.role.message}
						</p>
					)}

					<div>
						<label
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
							htmlFor='fullName'
						>
							Full Name
						</label>
						<input
							id='fullName'
							{...register('displayName')}
							autoComplete='name'
							className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400'
							placeholder='Kunj Patel'
							maxLength={20}
						/>
						{errors.displayName && (
							<p className='mt-1.5 text-xs font-medium text-red-500 ml-1'>
								{errors.displayName.message}
							</p>
						)}
					</div>

					<div>
						<label
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
							htmlFor='email'
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
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
							htmlFor='password'
						>
							Password
						</label>
						<div className='relative'>
							<input
								id='password'
								type={showPassword ? 'text' : 'password'}
								{...register('password')}
								autoComplete='new-password'
								className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 pr-11'
								placeholder='••••••••'
								maxLength={15}
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1'
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

					<div>
						<label
							className='block text-sm font-semibold text-slate-700 mb-1.5 ml-1'
							htmlFor='confirmPassword'
						>
							Confirm Password
						</label>
						<div className='relative'>
							<input
								id='confirmPassword'
								type={showConfirmPassword ? 'text' : 'password'}
								{...register('confirmPassword')}
								autoComplete='new-password'
								className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 pr-11'
								placeholder='••••••••'
								maxLength={15}
							/>
							<button
								type='button'
								onClick={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1'
							>
								{showConfirmPassword ? (
									<HiEyeOff size={20} />
								) : (
									<HiEye size={20} />
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className='mt-1.5 text-xs font-medium text-red-500 ml-1'>
								{errors.confirmPassword.message}
							</p>
						)}
					</div>

					<button
						type='submit'
						disabled={loading || authLoading}
						className='w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 active:scale-[0.98]'
					>
						{loading || authLoading
							? 'Creating account...'
							: 'Create Account'}
					</button>
				</form>

				<div className='mt-8 flex items-center justify-center space-x-4'>
					<div className='h-px flex-1 bg-slate-100'></div>
					<span className='text-slate-400 text-xs font-bold uppercase tracking-wider'>
						or sign up with
					</span>
					<div className='h-px flex-1 bg-slate-100'></div>
				</div>

				<button
					onClick={handleGoogleSignIn}
					disabled={loading || authLoading}
					className='mt-6 w-full py-3.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center justify-center space-x-3 hover:shadow-md disabled:opacity-50 active:scale-[0.98]'
				>
					<img src={googleIcon} alt='Google' className='w-5 h-5' />
					<span>Continue with Google</span>
				</button>

				<p className='mt-8 text-center text-slate-500 text-sm font-medium'>
					Already have an account?{' '}
					<Link
						to='/login'
						className='text-emerald-600 hover:text-emerald-700 font-bold transition-colors underline-offset-4 hover:underline'
					>
						Log in
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Signup
