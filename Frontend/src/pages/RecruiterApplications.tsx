import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'
import { toast } from 'react-toastify'
import {
	HiOutlineUserCircle,
	HiCheckCircle,
	HiOutlineDocumentText,
	HiXCircle,
} from 'react-icons/hi'

interface Applicant {
	applicationId: string
	candidateId: string
	name: string
	email: string
	resumeUrl?: string
	appliedAt: any
	status: string
}

interface JobWithApplicants {
	id: string
	title: string
	company: string
	applicants: Applicant[]
}

const RecruiterApplications = () => {
	const [data, setData] = useState<JobWithApplicants[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchApplications = async () => {
			try {
				setLoading(true)
				const response = await jobService.getApplications()
				setData(response.applications || [])
				setError(null)
			} catch (err: any) {
				console.error('Error fetching applications:', err)
				setError(
					err.response?.data?.error || 'Failed to load applications',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchApplications()
	}, [])

	const handleUpdateStatus = async (
		jobId: string,
		applicationId: string,
		status: string,
	) => {
		try {
			await jobService.updateApplicationStatus(applicationId, status)
			setData((prev) =>
				prev.map((job) => {
					if (job.id === jobId) {
						return {
							...job,
							applicants: job.applicants.map((app) =>
								app.applicationId === applicationId
									? { ...app, status }
									: app,
							),
						}
					}
					return job
				}),
			)
			toast.success(`Application marked as ${status}`)
		} catch (err: any) {
			toast.error(err.response?.data?.error || 'Failed to update status')
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-slate-50'>
				<div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-slate-50/50 py-12 px-4'>
			<div className='max-w-7xl mx-auto'>
				<header className='mb-10 text-center'>
					<h1 className='text-4xl font-black text-slate-900 tracking-tight mb-3'>
						Job Applications Overview
					</h1>
					<p className='text-slate-500 text-lg'>
						Manage candidates who have applied for your open roles.
					</p>
				</header>

				{error && (
					<div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8'>
						{error}
					</div>
				)}

				{!loading && data.length === 0 && (
					<div className='bg-white border border-slate-200 p-12 rounded-3xl text-center shadow-sm'>
						<div className='inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl mb-4'>
							<HiOutlineUserCircle size={32} />
						</div>
						<h3 className='text-xl font-bold text-slate-800 mb-2'>
							No Jobs Found
						</h3>
						<p className='text-slate-500'>
							You haven't posted any jobs yet.
						</p>
					</div>
				)}

				<div className='space-y-8'>
					{data.map((job) => (
						<section
							key={job.id}
							className='bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm'
						>
							<div className='bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center'>
								<div>
									<h2 className='text-xl font-bold text-slate-900'>
										{job.title}
									</h2>
									<p className='text-sm text-emerald-600 font-semibold'>
										{job.company}
									</p>
								</div>
								<div className='bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold'>
									{job.applicants.length} Applicants
								</div>
							</div>

							<div className='p-6'>
								{job.applicants.length === 0 ? (
									<p className='text-slate-400 italic text-center py-4'>
										No applications yet for this role.
									</p>
								) : (
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
										{job.applicants.map((app) => (
											<div
												key={app.applicationId}
												className='flex flex-col p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group'
											>
												<div className='flex items-center gap-4 mb-4'>
													<div className='flex-1 min-w-0'>
														<p className='text-sm font-bold text-slate-900 truncate'>
															{app.name}
														</p>
														<p className='text-xs text-slate-500 truncate'>
															{app.email}
														</p>
													</div>
													<div className='flex items-center gap-2'>
														{app.status ===
														'accepted' ? (
															<span className='px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
																Accepted
															</span>
														) : app.status ===
														  'rejected' ? (
															<span className='px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
																Rejected
															</span>
														) : (
															<span className='px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full'>
																Pending
															</span>
														)}
													</div>
												</div>

												{app.resumeUrl ? (
													<a
														href={app.resumeUrl}
														target='_blank'
														rel='noreferrer'
														className='w-full py-2 bg-white text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-center flex items-center justify-center gap-2'
													>
														<HiOutlineDocumentText
															size={16}
														/>
														View CV / Resume
													</a>
												) : (
													<div className='w-full py-2 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-xl border border-slate-100 text-center uppercase tracking-wider'>
														No CV /Resume provided
													</div>
												)}
												{app.status === 'pending' && (
													<div className='mt-3 flex gap-2'>
														<button
															onClick={() =>
																handleUpdateStatus(
																	job.id,
																	app.applicationId,
																	'accepted',
																)
															}
															className='flex-1 py-1.5 flex justify-center items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer'
														>
															<HiCheckCircle
																size={14}
															/>{' '}
															Accept
														</button>
														<button
															onClick={() =>
																handleUpdateStatus(
																	job.id,
																	app.applicationId,
																	'rejected',
																)
															}
															className='flex-1 py-1.5 flex justify-center items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 transition-colors cursor-pointer'
														>
															<HiXCircle
																size={14}
															/>{' '}
															Reject
														</button>
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	)
}

export default RecruiterApplications
