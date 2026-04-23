import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppDispatch } from '../store'
import { createJob, updateJob, type Job } from '../store'
import { toast } from 'react-toastify'
import { HiX } from 'react-icons/hi'

const jobSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters'),
	company: z.string().min(2, 'Company name must be at least 2 characters'),
	location: z.string().min(2, 'Location is required'),
	jobType: z.enum(['Full-time', 'Part-time', 'Internship']),
	salaryRange: z.string().optional(),
	experience: z.string().min(1, 'Experience is required'),
	description: z
		.string()
		.min(10, 'Description must be at least 10 characters'),
})

type JobFormValues = z.infer<typeof jobSchema>

interface JobModalProps {
	isOpen: boolean
	onClose: () => void
	jobToEdit?: Job | null
}

const JobModal = ({ isOpen, onClose, jobToEdit }: JobModalProps) => {
	const dispatch = useAppDispatch()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<JobFormValues>({
		resolver: zodResolver(jobSchema),
		defaultValues: {
			jobType: 'Full-time',
		},
	})

	useEffect(() => {
		if (jobToEdit) {
			reset({
				title: jobToEdit.title,
				company: jobToEdit.company,
				location: jobToEdit.location,
				jobType: jobToEdit.jobType,
				salaryRange: jobToEdit.salaryRange || '',
				experience: jobToEdit.experience || '',
				description: jobToEdit.description,
			})
		} else {
			reset({ jobType: 'Full-time' })
		}
	}, [jobToEdit, reset, isOpen])

	if (!isOpen) return null

	const onSubmit = async (data: JobFormValues) => {
		try {
			if (jobToEdit && jobToEdit.id) {
				await dispatch(
					updateJob({ id: jobToEdit.id, jobData: data }),
				).unwrap()
				toast.success('Job updated successfully!')
			} else {
				await dispatch(createJob(data as Job)).unwrap()
				toast.success('Job posted successfully!')
			}
			onClose()
			reset()
		} catch (error: any) {
			toast.error(error || 'An error occurred')
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
			<div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]'>
				<div className='px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
					<h2 className='text-xl font-bold text-slate-800'>
						{jobToEdit ? 'Edit Job Posting' : 'Post a New Job'}
					</h2>
					<button
						onClick={() => {
							onClose()
							reset()
						}}
						className=' text-slate-400 hover:text-red-500 transition-colors'
					>
						<HiX size={19} />
					</button>
				</div>

				<div className='p-6 overflow-y-auto'>
					<form
						id='jobForm'
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-5'
					>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Job Title
								</label>
								<input
									{...register('title')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
									placeholder='Frontend Developer'
								/>
								{errors.title && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.title.message}
									</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Company
								</label>
								<input
									{...register('company')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
									placeholder='Tech Corp'
								/>
								{errors.company && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.company.message}
									</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Location
								</label>
								<input
									{...register('location')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
									placeholder='Remote or On-Site or Hybrid'
								/>
								{errors.location && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.location.message}
									</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Job Type
								</label>
								<select
									{...register('jobType')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
								>
									<option value='Full-time'>Full-time</option>
									<option value='Part-time'>Part-time</option>
									<option value='Internship'>
										Internship
									</option>
								</select>
								{errors.jobType && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.jobType.message}
									</p>
								)}
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Salary Range (Optional)
								</label>
								<input
									{...register('salaryRange')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
									placeholder='2 lakh - 4 lakh'
								/>
								{errors.salaryRange && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.salaryRange.message}
									</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-semibold text-slate-700 mb-1'>
									Experience
								</label>
								<input
									{...register('experience')}
									className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
									placeholder='2-3 years, or Fresher'
								/>
								{errors.experience && (
									<p className='mt-1 text-xs text-red-500 text-left'>
										{errors.experience.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<label className='block text-sm font-semibold text-slate-700 mb-1'>
								Job Description
							</label>
							<textarea
								{...register('description')}
								rows={5}
								className='w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none'
								placeholder='Describe the role, responsibilities, and requirements...'
							></textarea>
							{errors.description && (
								<p className='mt-1 text-xs text-red-500 text-left'>
									{errors.description.message}
								</p>
							)}
						</div>
					</form>
				</div>

				<div className='px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50'>
					<button
						type='button'
						onClick={() => {
							onClose()
							reset()
						}}
						className='px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer '
					>
						Cancel
					</button>
					<button
						type='submit'
						form='jobForm'
						disabled={isSubmitting}
						className='px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-emerald-200'
					>
						{isSubmitting
							? 'Saving...'
							: jobToEdit
								? 'Save Changes'
								: 'Post Job'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default JobModal
