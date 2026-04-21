import { useEffect, useState } from 'react'
import { jobService } from '../api/jobService'
import { HiOutlineUserCircle, HiCheckCircle } from 'react-icons/hi'

interface Applicant {
	applicationId: string
	candidateId: string
	name: string
	email: string
	appliedAt: any
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
												className='flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group'
											>
												<div className='flex-1 min-w-0'>
													<p className='text-sm font-bold text-slate-900 truncate'>
														{app.name}
													</p>
													<p className='text-xs text-slate-500 truncate'>
														{app.email}
													</p>
												</div>
												<HiCheckCircle
													size={20}
													className='text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity'
												/>
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
