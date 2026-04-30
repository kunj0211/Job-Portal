import { useState, useEffect } from 'react'
import { HiX } from 'react-icons/hi'

interface RejectionModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (reason: string) => void
	candidateName?: string
}

const RejectionModal = ({
	isOpen,
	onClose,
	onConfirm,
	candidateName,
}: RejectionModalProps) => {
	const [reason, setReason] = useState('')

	useEffect(() => {
		if (isOpen) {
			setReason('')
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleConfirm = () => {
		if (reason.trim()) {
			onConfirm(reason.trim())
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
			<div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col'>
				<div className='px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/50'>
					<h2 className='text-lg font-bold text-red-800'>
						Reject Application
					</h2>
					<button
						onClick={onClose}
						className='text-slate-400 hover:text-red-500 transition-colors'
					>
						<HiX size={19} />
					</button>
				</div>

				<div className='p-6'>
					<p className='text-sm text-slate-600 mb-4'>
						Please provide a reason for rejecting{' '}
						<span className='font-bold text-slate-800'>
							{candidateName || 'this candidate'}
						</span>
					</p>

					<label className='block text-sm font-semibold text-slate-700 mb-2'>
						Rejection Reason
					</label>
					<textarea
						className='w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-2 resize-none bg-slate-50 transition-all'
						rows={4}
						placeholder="You didn't fit in as per our requirement"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					></textarea>
				</div>

				<div className='px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50'>
					<button
						onClick={onClose}
						className='px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer'
					>
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						disabled={!reason.trim()}
						className='px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm shadow-red-200'
					>
						Confirm Rejection
					</button>
				</div>
			</div>
		</div>
	)
}

export default RejectionModal
