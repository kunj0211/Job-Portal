import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
       navigate('/login');
       return;
    }

    try {
      const user = JSON.parse(userStr);
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      setAuthenticated(true);
    } catch (e) {
      console.error('Failed to parse user data');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="p-8">
      <p className="text-2xl font-bold mb-4">Hi, {userName}</p>
      <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
