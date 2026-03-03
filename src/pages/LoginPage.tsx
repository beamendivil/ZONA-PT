import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect based on user role
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF4FA] flex items-center justify-center p-4">
      {/* Back to Home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-[#6B7C8D] hover:text-[#2F9BFF] flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl text-[#1A2D3D]">Zona PT</h1>
          <p className="text-[#6B7C8D] mt-2">Client Portal</p>
        </div>

        {/* Login Card */}
        <div className="info-card p-8">
          <h2 className="font-heading font-bold text-2xl text-[#1A2D3D] mb-2">
            Welcome Back
          </h2>
          <p className="text-[#6B7C8D] mb-6">
            Sign in to view your exercises and care plan
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2D3D] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C8D]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A2D3D] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C8D]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7C8D] hover:text-[#2F9BFF] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[#EAF4FA]">
            <p className="text-xs text-[#6B7C8D] mb-3 font-medium uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-[#EAF4FA] rounded-lg">
                <p className="font-medium text-[#1A2D3D]">Admin (PT)</p>
                <p className="text-[#6B7C8D]">admin@zonapt.com / admin123</p>
              </div>
              <div className="p-3 bg-[#EAF4FA] rounded-lg">
                <p className="font-medium text-[#1A2D3D]">Client</p>
                <p className="text-[#6B7C8D]">patient@example.com / patient123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
