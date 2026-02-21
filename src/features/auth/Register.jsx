import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/api';
import { Ticket, ArrowRight, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    register({ email: formData.email, password: formData.password })
      .then(res => {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        const startPage = ['Admin', 'Super Admin', 'Manager'].includes(user.role)
          ? '/dashboard'
          : '/tickets';
        navigate(startPage, { replace: true });
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err.message || 'Registration failed';
        console.error('Registration failed', msg);
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

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

        {/* Benefits */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Start resolving issues <span className="gradient-text">faster today</span>
          </h2>
          <div className="space-y-4">
            {['Unlimited ticket management', 'Smart auto-routing & assignment', 'Real-time SLA tracking', 'Knowledge base & analytics'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-brand-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 Helpdesk Pro. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Register Form */}
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
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="text-slate-500 mt-2 text-sm">Get started with Helpdesk Pro for free</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                placeholder="you@company.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                placeholder="Min. 6 characters"
                onChange={handleChange}
              />
              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-3 animate-fade-in">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold ${passwordStrength.level <= 1 ? 'text-red-500' : passwordStrength.level <= 2 ? 'text-amber-500' : passwordStrength.level <= 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {passwordStrength.label} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm ${formData.confirmPassword
                  ? passwordsMatch ? 'border-emerald-300 focus:border-emerald-400' : 'border-red-300 focus:border-red-400'
                  : 'border-slate-200 focus:border-brand-500'
                  }`}
                placeholder="••••••••"
                onChange={handleChange}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
