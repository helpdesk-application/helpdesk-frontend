import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/api';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
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

        // Determine starting page based on role (mirroring Login logic)
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 mt-2">Join Helpdesk Pro</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
