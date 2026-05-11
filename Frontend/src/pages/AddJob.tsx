import { useEffect, useState } from 'react'
import {
	useGetRecruiterJobsQuery,
	useDeleteJobMutation,
	type Job,
} from '../api/jobApi'
import JobModal from '../components/JobModal'
import DeleteJobModal from '../components/DeleteJobModal'
import Pagination from '../components/Pagination'
import {
	HiOutlinePlus,
	HiOutlinePencil,
	HiOutlineTrash,
	HiOutlineBriefcase,
} from 'react-icons/hi'
import { toast } from 'react-toastify'

const AddJob = () => {
	const { data, isLoading: loading } = useGetRecruiterJobsQuery()
	const jobs: Job[] = data?.jobs || []
	const [deleteJob] = useDeleteJobMutation()

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [jobToEdit, setJobToEdit] = useState<Job | null>(null)
	const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(5)

	const handleEdit = (job: Job) => {
		setJobToEdit(job)
		setIsModalOpen(true)
	}

	const handleDeleteClick = (id: string) => {
		setDeleteJobId(id)
	}

	const confirmDelete = async () => {
		if (!deleteJobId) return
		setIsDeleting(true)
		try {
			await deleteJob(deleteJobId).unwrap()
			toast.success('Job deleted successfully')
		} catch (error) {
			toast.error('Failed to delete job')
		} finally {
			setIsDeleting(false)
			setDeleteJobId(null)
		}
	}

	const openNewJobModal = () => {
		setJobToEdit(null)
		setIsModalOpen(true)
	}

	const totalPages = Math.ceil(jobs.length / itemsPerPage)
	const paginatedJobs = jobs.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages)
		}
	}, [jobs.length, currentPage, totalPages])

	return (
		<div className='p-4 md:p-8 font-sans max-w-7xl mx-auto'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 pb-6 border-b border-slate-200 gap-4 sm:gap-0'>
				<div>
					<h1 className='text-2xl md:text-3xl font-bold text-slate-800 tracking-tight'>
						Manage Jobs
					</h1>
				</div>
				<div className='flex gap-4 w-full sm:w-auto'>
					<button
						onClick={openNewJobModal}
						className='flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-sm hover:shadow-emerald-200 w-full sm:w-auto'
					>
						<HiOutlinePlus size={20} />
						Post New Job
					</button>
				</div>
			</div>

			<div>
				<h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
					Your Job Postings
				</h2>

				{loading ? (
					<div className='flex justify-center p-12'>
						<div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				) : jobs.length === 0 ? (
					<div className='text-center p-8 sm:p-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-2 sm:mx-0'>
						<div className='w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-100/50'>
							<HiOutlineBriefcase
								className='text-emerald-400'
								size={36}
							/>
						</div>
						<h3 className='text-xl font-bold text-slate-800 mb-2 tracking-tight'>
							No jobs posted yet
						</h3>
						<p className='text-slate-500 mb-8 max-w-md mx-auto'>
							Create your first job posting to start receiving
							applicants and building your team.
						</p>
						<button
							onClick={openNewJobModal}
							className='text-emerald-600 font-bold hover:text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto'
						>
							Get Started <span aria-hidden='true'>&rarr;</span>
						</button>
					</div>
				) : (
					<>
						<div className='overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm -mx-4 sm:mx-0'>
							<table className='w-full min-w-225'>
								<thead>
									<tr className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 sticky top-0'>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Actions
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Role
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Company
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Location
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Job-type
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Salary
										</th>
										<th className='text-left text-xs font-bold text-slate-600 uppercase tracking-wider'>
											Experience
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-200'>
									{paginatedJobs.map((job) => (
										<tr
											key={job.id}
											className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-emerald-50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-colors'
										>
											<td className='flex items-center gap-2 '>
												<button
													onClick={() =>
														handleEdit(job)
													}
													className='p-1 text-slate-700 hover:text-emerald-400 hover:cursor-pointer transition-colors hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)]'
													title='Edit job'
												>
													<HiOutlinePencil
														size={18}
													/>
												</button>
												<button
													onClick={() =>
														job.id &&
														handleDeleteClick(
															job.id,
														)
													}
													className='p-1 text-slate-700 hover:text-red-500 hover:cursor-pointer transition-colors hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)]'
													title='Delete job'
												>
													<HiOutlineTrash size={18} />
												</button>
											</td>
											<td className='text-sm font-semibold text-slate-900 truncate'>
												{job.title}
											</td>
											<td className='text-sm truncate'>
												{job.company}
											</td>
											<td className='text-sm text-slate-700 truncate'>
												{job.location}
											</td>
											<td className='text-sm text-slate-700'>
												{job.jobType}
											</td>
											<td className='text-sm text-slate-700'>
												{job.salaryRange || 'N/A'}
											</td>
											<td className='text-sm text-slate-700'>
												{job.experience || 'N/A'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{jobs.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
								itemsPerPage={itemsPerPage}
								onItemsPerPageChange={(items) => {
									setItemsPerPage(items)
									setCurrentPage(1)
								}}
							/>
						)}
					</>
				)}
			</div>

			<JobModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				jobToEdit={jobToEdit}
			/>

			<DeleteJobModal
				isOpen={!!deleteJobId}
				onClose={() => !isDeleting && setDeleteJobId(null)}
				onConfirm={confirmDelete}
				isDeleting={isDeleting}
			/>
		</div>
	)
}

export default AddJob
