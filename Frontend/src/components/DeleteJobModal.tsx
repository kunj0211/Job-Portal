import { HiX } from 'react-icons/hi'

interface DeleteJobModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	isDeleting?: boolean
}

const DeleteJobModal = ({
	isOpen,
	onClose,
	onConfirm,
	isDeleting,
}: DeleteJobModalProps) => {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity'>
			<div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transform transition-all'>
				<div className='px-6 py-4 border-b border-slate-100 flex  items-center bg-slate-50/50'>
					<h2 className='text-xl font-bold text-slate-800 flex gap-2 text-center justify-center items-center w-full'>
						Confirm Deletion
					</h2>
					<button
						onClick={onClose}
						disabled={isDeleting}
						className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 rounded-full '
					>
						<HiX size={24} />
					</button>
				</div>

				<div className='p-6'>
					<div className='flex items-start gap-4'>
						<div className='pt-1'>
							<h3 className='text-lg font-semibold text-slate-800 mb-1 text-center'>
								Delete Job Posting
							</h3>
							<p className='text-slate-600 text-sm leading-relaxed'>
								Are you sure you want to delete this job
								posting? This action cannot be undone.
							</p>
						</div>
					</div>
				</div>
				<div className='px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50'>
					<button
						type='button'
						onClick={onClose}
						disabled={isDeleting}
						className='px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50'
					>
						Cancel
					</button>
					<button
						type='button'
						onClick={onConfirm}
						disabled={isDeleting}
						className='px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-red-200 flex items-center gap-2 justify-center min-w-30'
					>
						{isDeleting ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Deleting...
							</>
						) : (
							'Delete Job'
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default DeleteJobModal
