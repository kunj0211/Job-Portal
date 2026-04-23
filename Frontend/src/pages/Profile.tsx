import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppSelector, useAppDispatch, checkAuth } from '../store'
import { authService } from '../api/authService'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { toast } from 'react-toastify'

const profileSchema = z.object({
	displayName: z.string().min(2, 'Name must be at least 2 characters'),
	resumeUrl: z
		.string()
		.url('Invalid URL')
		.or(z.literal(''))
		.optional()
		.nullable(),
	title: z.string().optional(),
	experience: z.string().optional(),
	skills: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const Profile = () => {
	const { user } = useAppSelector((state) => state.auth)
	const dispatch = useAppDispatch()
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(
		null,
	)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
	})

	useEffect(() => {
		if (user) {
			fetchProfile()
		}
	}, [user?.uid])

	const fetchProfile = async () => {
		try {
			setLoading(true)
			const profileData = await authService.checkAuth()
			const u = profileData.user

			const initialValues = {
				displayName: u.displayName || '',
				resumeUrl: u.resumeUrl || '',
				title: u.title || '',
				experience: u.experience || '',
				skills: u.skills?.join(', ') || '',
			}

			reset(initialValues)
			setCurrentResumeUrl(u.resumeUrl || null)
		} catch (err) {
			console.error('Error fetching profile:', err)
			toast.error('Failed to load profile data')
		} finally {
			setLoading(false)
		}
	}

	const onSubmit = async (data: ProfileFormValues) => {
		try {
			const normalizedSkills = data.skills
				? data.skills
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s !== '')
				: []

			await authService.updateProfile({
				displayName: data.displayName,
				resumeUrl: data.resumeUrl || undefined,
				title: data.title,
				experience: data.experience,
				skills: normalizedSkills,
			})

			await dispatch(checkAuth()).unwrap()
			setCurrentResumeUrl(data.resumeUrl || null)
			setIsEditing(false)
			toast.success('Profile updated successfully!')
		} catch (err) {
			console.error('Error updating profile:', err)
			toast.error('Failed to update profile')
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-slate-50 flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
			</div>
		)
	}

	if (!user) return null

	return (
		<div className='min-h-screen bg-slate-50 py-12'>
			<div className='max-w-3xl mx-auto px-4'>
				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
					<div className='bg-emerald-600 h-32 w-full'></div>
					<div className='px-8 pb-8'>
						<div className='relative flex justify-center'>
							<div className='-mt-16 w-32 h-32 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-black text-emerald-600 overflow-hidden'>
								{user.displayName?.[0] ||
									user.email?.[0].toUpperCase()}
							</div>
						</div>

						<form onSubmit={handleSubmit(onSubmit)}>
							<div className='text-center mt-4 mb-8 flex flex-col items-center'>
								{isEditing ? (
									<div className='mb-2 w-full max-w-xs'>
										<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
											Full Name
										</label>
										<input
											{...register('displayName')}
											type='text'
											className={`text-2xl font-bold text-slate-900 text-center border-b-2 bg-transparent outline-none pb-1 w-full ${errors.displayName ? 'border-red-400' : 'border-emerald-500'}`}
											autoFocus
										/>
										{errors.displayName && (
											<p className='text-[10px] text-red-500 mt-1 font-bold'>
												{errors.displayName.message}
											</p>
										)}
									</div>
								) : (
									<h1 className='text-3xl font-bold text-slate-900'>
										{user.displayName || 'Candidate'}
									</h1>
								)}
								<p className='text-slate-500 font-medium'>
									{user.email}
								</p>
								<span className='inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase rounded-full'>
									{user.role}
								</span>
							</div>

							<div className='space-y-8'>
								<div className='pt-8 border-t border-slate-100'>
									<h3 className='text-lg font-bold text-slate-800 mb-4'>
										Resume Management
									</h3>
									<div className='flex justify-between items-center mb-2'>
										<label className='block text-sm font-semibold text-slate-700'>
											My Resume
										</label>
										{currentResumeUrl && (
											<a
												href={currentResumeUrl}
												target='_blank'
												rel='noreferrer'
												className='text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1'
											>
												View Current{' '}
												<HiOutlineDocumentText />
											</a>
										)}
									</div>

									<div className='space-y-4'>
										<div>
											<label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1'>
												Resume Link (Google Drive,
												Dropbox, etc.)
											</label>
											<div className='flex flex-col gap-1'>
												{isEditing ? (
													<input
														{...register(
															'resumeUrl',
														)}
														type='url'
														placeholder='https://drive.google.com/...'
														className={`w-full px-4 py-2 text-sm rounded-xl bg-slate-50 border focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none ${errors.resumeUrl ? 'border-red-400' : 'border-slate-200 focus:border-emerald-500'}`}
													/>
												) : (
													<p className='text-sm text-slate-600 px-1 truncate'>
														{currentResumeUrl ||
															'No resume link provided'}
													</p>
												)}
												{errors.resumeUrl && (
													<p className='text-[10px] text-red-500 ml-1 font-bold'>
														{
															errors.resumeUrl
																.message
														}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className='pt-8 border-t border-slate-100'>
									<h3 className='text-lg font-bold text-slate-800 mb-4'>
										Professional Information
									</h3>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1'>
												Professional Title
											</label>
											{isEditing ? (
												<input
													{...register('title')}
													type='text'
													placeholder='Full Stack Developer'
													className='w-full px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none'
												/>
											) : (
												<p className='text-sm text-slate-700 font-medium px-1'>
													{user.title ||
														'Not specified'}
												</p>
											)}
										</div>
										<div>
											<label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1'>
												Experience (Years)
											</label>
											{isEditing ? (
												<input
													{...register('experience')}
													type='text'
													placeholder='3+ Years'
													className='w-full px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none'
												/>
											) : (
												<p className='text-sm text-slate-700 font-medium px-1'>
													{user.experience ||
														'Not specified'}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className='pt-8 border-t border-slate-100'>
									<h3 className='text-lg font-bold text-slate-800 mb-4'>
										Skills & Expertise
									</h3>
									<div className='space-y-4'>
										<div>
											<label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1'>
												Skills
											</label>
											{isEditing ? (
												<input
													{...register('skills')}
													type='text'
													placeholder='React, Node.js, TypeScript...'
													className='w-full px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none'
												/>
											) : (
												<div className='flex flex-wrap gap-2 px-1'>
													{user.skills &&
													user.skills.length > 0 ? (
														user.skills.map(
															(skill, index) => (
																<span
																	key={index}
																	className='px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg'
																>
																	{skill.trim()}
																</span>
															),
														)
													) : (
														<p className='text-sm text-slate-500 italic'>
															No skills listed
														</p>
													)}
												</div>
											)}
										</div>
									</div>
								</div>

								<div className='pt-8 flex justify-end gap-3'>
									{!isEditing ? (
										<button
											type='button'
											onClick={() => setIsEditing(true)}
											className='px-8 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200'
										>
											Edit Profile
										</button>
									) : (
										<>
											<button
												type='button'
												onClick={() => {
													setIsEditing(false)
													fetchProfile() // Reset changes
												}}
												className='px-8 py-3 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95'
											>
												Cancel
											</button>
											<button
												type='submit'
												disabled={isSubmitting}
												className='px-8 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50'
											>
												{isSubmitting
													? 'Saving...'
													: 'Save Profile Changes'}
											</button>
										</>
									)}
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Profile
