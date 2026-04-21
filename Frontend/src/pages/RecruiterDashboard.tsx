import { useAppSelector } from '../store';

const RecruiterDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-emerald-100 shadow-sm text-center mt-10">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-4">
          Hii Employer
        </h1>
        <p className="text-xl text-slate-500">
          Welcome back to your dashboard, {user.displayName}.
        </p>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
