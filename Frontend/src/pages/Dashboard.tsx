import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, logout } from '../store';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Hii Job Seeker</h1>
      <button 
        onClick={handleLogout} 
        className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl transition-all hover:bg-emerald-500 hover:text-white active:scale-95 cursor-pointer shadow-sm hover:shadow-emerald-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
