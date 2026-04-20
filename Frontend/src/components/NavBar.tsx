const NavBar = () => {
  return (
    <>
      <div className='flex justify-between bg-green-200 items-center h-12 shadow-sm shadow-emerald-100/20'>
            <div className='p-4 font-sans text-2xl font-bold text-slate-800'>
                Job Portal
            </div>
            <div className='p-2 font-sans text-sm text-slate-600'>
                <ul className='flex'>
                    <li className='inline-block mx-4 cursor-pointer text-green-900 hover:text-slate-800 transition-colors pt-1'>Home</li>
                    <li className='inline-block mx-4 cursor-pointer text-green-900 hover:text-slate-800 transition-colors pt-1'>Jobs</li>
                    <li className='inline-block mx-4 cursor-pointer text-green-900 hover:text-slate-800 transition-colors pt-1'>About</li>
                    <li className='inline-block mx-4 cursor-pointer text-green-900 hover:text-slate-800 transition-colors pt-1'>Contact</li>
                    
                </ul>
            </div>
      </div>
    </>
  )
}

export default NavBar
