import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/api';
import { Ticket, ArrowRight, Shield, Zap, HeadphonesIcon } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    login(credentials)
      .then(res => {
        const { token, user } = res.data;
        if (!token || !user) throw new Error('Invalid response: missing token or user');

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        const startPage = ['Admin', 'Super Admin', 'Manager'].includes(user.role)
          ? '/dashboard'
          : '/tickets';

        setTimeout(() => {
          navigate(startPage, { replace: true });
        }, 100);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand / Illustration */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-400/5 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Ticket size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Helpdesk Pro</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium ml-[52px]">Support Dashboard</p>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Lightning-Fast Resolution</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Resolve tickets 3× faster with smart routing and AI-powered suggestions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Enterprise Security</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Role-based access control with complete audit trails for compliance.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Multi-Channel Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Manage email, chat, and phone support from a single unified inbox.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 Helpdesk Pro. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Ticket size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Helpdesk Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={credentials.email}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                placeholder="you@company.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                value={credentials.password}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;