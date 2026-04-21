import { HiX } from 'react-icons/hi'
import { MdLocationPin } from 'react-icons/md'
import { LuClock8, LuUser } from 'react-icons/lu'
import { FaWallet } from 'react-icons/fa'
import { MdOutlineDescription } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { jobService } from '../api/jobService'
interface Job {
	id: string
	title: string
	company: string
	location: string
	jobType: string
	description: string
	salaryRange?: string
	experience?: string
	createdAt?: any
}

const JobDetail = ({
	job,
	isOpen,
	onClose,
}: {
	job: Job
	isOpen: boolean
	onClose: () => void
}) => {
	const { user } = useAppSelector((state) => state.auth)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	// Reset state when a different job is selected or the modal is opened/closed
	useEffect(() => {
		setMessage(null)
		setLoading(false)
	}, [job?.id, isOpen])

	if (!isOpen || !job) return null

	const handleApply = async () => {
		try {
			setLoading(true)
			setMessage(null)
			const response = await jobService.applyForJob(job.id)
			setMessage({
				type: 'success',
				text: response.message || 'Applied successfully!',
			})
		} catch (err: any) {
			console.error('Error applying for job:', err)
			const errorMessage =
				err.response?.data?.error ||
				err.message ||
				'Failed to apply for job'
			setMessage({ type: 'error', text: errorMessage })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
			<div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]'>
				<div className='px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
					<h2 className='text-xl font-bold text-slate-800'>
						{job.title}
					</h2>
					<button
						onClick={onClose}
						className=' hover:text-red-500 transition-colors'
					>
						<HiX size={19} />
					</button>
				</div>

				<div className='p-6 overflow-y-auto'>
					{message && (
						<div
							className={`mb-4 p-3 rounded-lg text-sm font-medium ${
								message.type === 'success'
									? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
									: 'bg-red-50 text-red-700 border border-red-100'
							}`}
						>
							{message.text}
						</div>
					)}
					<div className='space-y-4'>
						<div>
							<p className='text-lg text-slate-600 flex items-center gap-2'>
								{job.company}
							</p>
						</div>
						<div>
							<p className='text-md text-slate-600 flex items-center gap-2'>
								<MdLocationPin
									className='inline-block mr-1'
									size={16}
								/>
								<span className='font-medium text-emerald-600'>
									Location:
								</span>
								{job.location}
							</p>
						</div>
						<div>
							<p className='text-md text-slate-600 flex items-center gap-2'>
								<LuClock8
									className='inline-block mr-1'
									size={16}
								/>
								<span className='font-medium text-emerald-600'>
									Job Type:
								</span>{' '}
								{job.jobType}
							</p>
						</div>
						{job.salaryRange && (
							<div>
								<p className='text-md text-slate-600 flex items-center gap-2'>
									<FaWallet
										className='inline-block mr-1'
										size={16}
									/>
									<span className='font-medium text-emerald-600'>
										Salary Range:
									</span>{' '}
									{job.salaryRange}
								</p>
							</div>
						)}
						{job.experience && (
							<div>
								<p className='text-md text-slate-600 flex items-center gap-2'>
									<LuUser
										className='inline-block mr-1'
										size={16}
									/>
									<span className='font-medium text-emerald-600'>
										Experience:
									</span>{' '}
									{job.experience}
								</p>
							</div>
						)}
						<p className='text-md text-slate-600flex items-center gap-2'>
							<MdOutlineDescription
								className='inline-block mr-1'
								size={16}
							/>

							<span className='font-medium text-emerald-600'>
								Description:
							</span>
						</p>
						{job.description && (
							<div>
								<p className='text-md text-slate-600 whitespace-pre-line'>
									{job.description}
								</p>
							</div>
						)}
					</div>
				</div>

				{user?.role !== 'recruiter' && (
					<div className='px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end'>
						<button
							onClick={handleApply}
							disabled={loading || message?.type === 'success'}
							className={`px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
								loading || message?.type === 'success'
									? 'bg-slate-400 cursor-not-allowed'
									: 'bg-emerald-600 hover:bg-emerald-700'
							}`}
						>
							{loading
								? 'Applying...'
								: message?.type === 'success'
									? 'Applied'
									: 'Apply Now'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default JobDetail
