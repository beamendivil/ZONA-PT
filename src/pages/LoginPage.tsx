import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { env } from '@/config/env';
import { SignIn } from '@clerk/react';

export default function LoginPage() {
  if (env.clerkPublishableKey) {
    return <main className="grid min-h-screen place-items-center bg-[#F7F9FC] p-4"><SignIn routing="hash" /></main>;
  }
  return <DemoLoginPage />;
}

function DemoLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' && location.pathname !== '/admin') {
        navigate('/admin');
      } else if (user.role !== 'admin' && !['/dashboard', '/onboarding', '/consent'].includes(location.pathname)) {
        navigate('/onboarding');
      }
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4">
      {/* Back to Home */}
      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
      >
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#2459D3] font-bold text-white">Z</span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">Zona PT</h1>
          <p className="mt-1 text-sm text-slate-500">Patient and clinician portal</p>
        </div>

        {/* Login Card */}
        <div className="surface-card p-8">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">
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
              <label htmlFor="email" className="block text-sm font-medium text-[#1A2D3D] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C8D]" />
                <input
                  id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-[#1A2D3D] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C8D]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {import.meta.env.DEV && env.demoAuthEnabled ? (
          <div className="mt-6 pt-6 border-t border-[#EAF4FA]">
            <p className="text-xs text-[#6B7C8D] mb-3 font-medium uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-[#EAF4FA] rounded-lg">
                <p className="font-medium text-[#1A2D3D]">Clinician (PT)</p>
                <p className="text-[#6B7C8D]">admin@zonapt.com / admin123</p>
              </div>
              <div className="p-3 bg-[#EAF4FA] rounded-lg">
                <p className="font-medium text-[#1A2D3D]">Client</p>
                <p className="text-[#6B7C8D]">patient@example.com / patient123</p>
              </div>
            </div>
          </div>
          ) : (
            <p className="mt-6 border-t border-[#EAF4FA] pt-6 text-sm text-[#6B7C8D]">
              Secure account authentication is not configured yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
