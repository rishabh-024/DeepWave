import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const btn = "inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow hover:shadow-md transition active:scale-[.99]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by toast in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-[#0b1021] transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-white"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
      </button>
      
      <div className="w-full max-w-md mx-auto p-8 border border-slate-200 dark:border-white/10 bg-white/85 dark:bg-slate-800/50 rounded-2xl shadow-xl backdrop-blur">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-2">Create Your DeepWave Account</h2>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
          Build your personalized sound therapy experience.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-gray-300">Password (min. 6 characters)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="mt-1 block w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <button type="submit" disabled={isLoading} className={`${btn} bg-violet-600 hover:bg-violet-500 text-white`}>
              {isLoading ? 'Creating Account...' : 'Create Account'} <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
