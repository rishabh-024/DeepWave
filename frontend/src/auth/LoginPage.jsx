import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const btn = "inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow hover:shadow-md transition active:scale-[.99]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/'); 
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#0b1021]">
      <div className="w-full max-w-md mx-auto p-8 border border-white/10 bg-slate-800/50 rounded-2xl shadow-xl backdrop-blur">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">DeepWave</h2>
        <h3 className="text-2xl font-medium text-center text-white mb-6">Login</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          
          {error && <p className="text-red-400 text-center text-sm">{error}</p>}

          <div>
            <button type="submit" disabled={isLoading} className={`${btn} bg-violet-600 hover:bg-violet-500 text-white`}>
              {isLoading ? 'Signing in...' : 'Login'} <LogIn className="h-4 w-4"/>
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-violet-400 hover:underline">
            Create One
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;