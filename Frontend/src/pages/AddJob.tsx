import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, fetchRecruiterJobs, deleteJob, type Job } from '../store';
import JobModal from '../components/JobModal';
import DeleteJobModal from '../components/DeleteJobModal';
import Pagination from '../components/Pagination';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase } from 'react-icons/hi';
import { toast } from 'react-toastify';

const AddJob = () => {
  const { jobs, loading } = useAppSelector((state) => state.jobs);
  const dispatch = useAppDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    dispatch(fetchRecruiterJobs());
  }, [dispatch]);

  const handleEdit = (job: Job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteJobId(id);
  };

  const confirmDelete = async () => {
    if (!deleteJobId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteJob(deleteJobId)).unwrap();
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
      setDeleteJobId(null);
    }
  };

  const openNewJobModal = () => {
    setJobToEdit(null);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [jobs.length, currentPage, totalPages]);

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Jobs</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={openNewJobModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-sm hover:shadow-emerald-200"
          >
            <HiOutlinePlus size={20} />
            Post New Job
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Your Job Postings
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center p-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-100/50">
              <HiOutlineBriefcase className="text-emerald-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">No jobs posted yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first job posting to start receiving applicants and building your team.</p>
            <button 
              onClick={openNewJobModal}
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              Get Started <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <div key={job.id} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-100/50 shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-all duration-300 relative group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-800 line-clamp-1" title={job.title}>
                    {job.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-3 mb-5 grow">
                  <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                    <div className="p-1.5 text-emerald-600">Company :</div>
                    {job.company}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                    <div className="p-1.5 text-emerald-600">Location :</div>
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                    <div className="p-1.5 text-emerald-600">Job Type :</div>
                    <span>{job.jobType}</span>
                  </div>
                  {job.experience && (
                      <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                    <div className="p-1.5 text-emerald-600">Experience :</div>
                    <span>{job.experience}</span>
                  </div>
                   
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                      <div className="p-1.5 text-emerald-600">Salary Range :</div>
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => handleEdit(job)} 
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                  >
                    <HiOutlinePencil size={18} />
                    Edit
                  </button>
                  <button 
                    onClick={() => job.id && handleDeleteClick(job.id)} 
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                  >
                    <HiOutlineTrash size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            </div>
            
            {jobs.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
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
  );
};

export default AddJob;
