import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { authService } from '../api/authService'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { HiOutlineDocumentText, HiOutlineCloudUpload } from 'react-icons/hi'

const Profile = () => {
	const { user } = useAppSelector((state) => state.auth)
	const [uploading, setUploading] = useState(false)
	const [resumeUrl, setResumeUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (user) {
			fetchProfile()
		}
	}, [user])

	const fetchProfile = async () => {
		try {
			setLoading(true)
			const profileData = await authService.checkAuth()
			setResumeUrl(profileData.user.resumeUrl || null)
		} catch (err) {
			console.error('Error fetching profile:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSaveProfile = async () => {
		try {
			setLoading(true)
			await authService.updateProfile({ resumeUrl })
			alert('Profile updated successfully!')
		} catch (err) {
			console.error('Error updating profile:', err)
			alert('Failed to update profile')
		} finally {
			setLoading(false)
		}
	}

	const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !user) return

		if (file.type !== 'application/pdf') {
			alert('Please upload a PDF file')
			return
		}

		try {
			setUploading(true)
			const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`)
			await uploadBytes(storageRef, file)
			const url = await getDownloadURL(storageRef)
			
			await authService.updateProfile({ resumeUrl: url })
			setResumeUrl(url)
			alert('Resume uploaded successfully!')
		} catch (err) {
			console.error('Resume upload error:', err)
			alert('Failed to upload resume')
		} finally {
			setUploading(false)
		}
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
								{user.displayName?.[0] || user.email?.[0].toUpperCase()}
							</div>
						</div>
						
						<div className='text-center mt-4 mb-8'>
							<h1 className='text-3xl font-bold text-slate-900'>
								{user.displayName || 'Candidate'}
							</h1>
							<p className='text-slate-500 font-medium'>{user.email}</p>
							<span className='inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase rounded-full'>
								{user.role}
							</span>
						</div>

						<div className='space-y-8'>
							<div className='pt-8 border-t border-slate-100'>
								<h3 className='text-lg font-bold text-slate-800 mb-4'>Resume Management</h3>
								<div className='flex justify-between items-center mb-2'>
									<label className='block text-sm font-semibold text-slate-700'>
										My Resume (PDF)
									</label>
									{resumeUrl && (
										<a 
											href={resumeUrl} 
											target='_blank' 
											rel='noreferrer'
											className='text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1'
										>
											View Current <HiOutlineDocumentText />
										</a>
									)}
								</div>

								<div className='space-y-4'>
									{/* Option 1: Upload */}
									<div className='relative'>
										<label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group'>
											<div className='flex flex-col items-center justify-center pt-5 pb-6'>
												{uploading ? (
													<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500'></div>
												) : (
													<>
														<HiOutlineCloudUpload className='text-slate-400 group-hover:text-emerald-500 transition-colors mb-2' size={32} />
														<p className='text-xs text-slate-500 group-hover:text-slate-600 font-medium'>
															Upload PDF Resume
														</p>
														<p className='text-[10px] text-slate-400 mt-1'>Max 2MB</p>
													</>
												)}
											</div>
											<input 
												type='file' 
												className='hidden' 
												accept='application/pdf' 
												onChange={handleResumeUpload}
												disabled={uploading}
											/>
										</label>
									</div>

									<div className='flex items-center gap-4 py-2'>
										<div className='h-px flex-1 bg-slate-100'></div>
										<span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>OR</span>
										<div className='h-px flex-1 bg-slate-100'></div>
									</div>

									{/* Option 2: External Link */}
									<div>
										<label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1'>
											Resume Link (Google Drive, Dropbox, etc.)
										</label>
										<div className='flex gap-2'>
											<input 
												type='url'
												placeholder='https://drive.google.com/...'
												value={resumeUrl || ''}
												onChange={(e) => setResumeUrl(e.target.value)}
												className='flex-1 px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none'
											/>
											<button
												onClick={handleSaveProfile}
												disabled={loading}
												className='px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95'
											>
												Save
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Profile
