import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Layers } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, error, clearError, isLoading, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, redirect, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all credentials fields.');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {}
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 relative">
      {/* Background neon blur shapes */}
      <div className="absolute w-[260px] h-[260px] rounded-full bg-purple-650/10 blur-[80px] -top-12 -left-12 pointer-events-none" />
      <div className="absolute w-[260px] h-[260px] rounded-full bg-indigo-650/10 blur-[80px] -bottom-12 -right-12 pointer-events-none" />

      <div className="w-full max-w-md glass rounded-3xl p-8 space-y-8 relative z-10 shadow-2xl">
        
        {/* Brand Banner Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-2">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">Welcome Back</h2>
          <p className="text-xs text-gray-500">Sign in to access your dashboard and saved carts.</p>
        </div>

        {/* Error notification banner */}
        {(localError || error) && (
          <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 flex items-start gap-3">
            <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-400 font-medium leading-relaxed">{localError || error}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rehan@domain.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Password</label>
              <a href="#" className="text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" isLoading={isLoading} className="w-full py-4 uppercase font-bold tracking-wider">
            Sign In Account
          </Button>

        </form>

        {/* Footer Redirect link */}
        <div className="text-center pt-4 border-t border-white/5 text-xs text-gray-500">
          <span>New to our platform? </span>
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-purple-400 hover:text-purple-300 font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
