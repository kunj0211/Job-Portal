import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	itemsPerPage: number
	onItemsPerPageChange: (items: number) => void
	options?: number[]
}

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	itemsPerPage,
	onItemsPerPageChange,
	options = [6, 12, 24],
}: PaginationProps) => {
	if (totalPages <= 1 && itemsPerPage === options[0]) return null

	const getPageNumbers = () => {
		const pages = []
		const maxVisiblePages = 5

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			let startPage = Math.max(1, currentPage - 2)
			let endPage = Math.min(totalPages, currentPage + 2)

			if (startPage === 1) {
				endPage = maxVisiblePages
			} else if (endPage === totalPages) {
				startPage = totalPages - maxVisiblePages + 1
			}

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i)
			}
		}
		return pages
	}

	return (
		<div className='mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl  '>
			<div className='flex items-center gap-2'>
				<label
					htmlFor='itemsPerPage'
					className='text-sm font-semibold text-slate-600'
				>
					Items per page:
				</label>
				<select
					id='itemsPerPage'
					value={itemsPerPage}
					onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
					className='px-3 py-1.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-700 transition-all cursor-pointer'
				>
					{options.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>

			<div className='flex items-center gap-4'>
				<span className='hidden md:inline text-sm font-semibold text-slate-600'>
					Page <span className='text-slate-900'>{currentPage}</span> of{' '}
					<span className='text-slate-900'>{Math.max(1, totalPages)}</span>
				</span>

				<div className='flex gap-2'>
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className='w-22 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed'
						aria-label='Previous Page'
					>
						Previous
					</button>

					{getPageNumbers().map((page) => (
						<button
							key={page}
							onClick={() => onPageChange(page)}
							className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
								currentPage === page
									? 'bg-emerald-500 text-white border-emerald-500 font-semibold shadow-sm shadow-emerald-200'
									: 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
							}`}
							aria-label={`Page ${page}`}
						>
							{page}
						</button>
					))}

					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className='w-22 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed'
						aria-label='Next Page'
					>
						Next
					</button>
				</div>
			</div>
		</div>
	)
}

export default Pagination
