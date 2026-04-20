import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Hii Employer</h1>
      <button 
        onClick={handleLogout} 
        className="px-6 py-2.5 border-2 border-indigo-500 text-indigo-600 font-bold rounded-xl transition-all hover:bg-indigo-500 hover:text-white active:scale-95 cursor-pointer shadow-sm hover:shadow-indigo-200"
      >
        Logout
      </button>
    </div>
  );
};

export default RecruiterDashboard;
