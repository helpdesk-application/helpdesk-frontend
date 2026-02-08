import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/api';

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

    console.log('🔐 Login attempt started...');
    console.log('Credentials:', credentials);
    console.log('API baseURL:', 'http://localhost:3000/api');

    // Call real API login
    login(credentials)
      .then(res => {
        console.log('✅ Login API call succeeded!');
        console.log('Response status:', res.status);
        console.log('Response data:', res.data);

        const { token, user } = res.data;

        if (!token || !user) {
          throw new Error('Invalid response: missing token or user');
        }

        console.log('💾 Storing token and user in localStorage...');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('✅ Stored successfully');

        // Determine starting page based on role
        const startPage = ['Admin', 'Super Admin', 'Manager'].includes(user.role)
          ? '/dashboard'
          : '/tickets';

        console.log(`Redirecting to ${startPage}...`);

        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate(startPage, { replace: true });
        }, 100);
      })
      .catch(err => {
        console.error('❌ Login failed');
        console.error('Error object:', err);
        console.error('Response:', err?.response);
        console.error('Response data:', err?.response?.data);

        const msg = err?.response?.data?.message || err.message || 'Login failed';
        console.error('Error message:', msg);

        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Helpdesk Pro</h2>
          <p className="text-slate-500 mt-2">Please sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={credentials.email}
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              required
              value={credentials.password}
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up here
            </a>
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-slate-600">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Email: admin@example.com</p>
          <p>Password: password123</p>
        </div>

        <div className="mt-4 p-2 bg-yellow-50 rounded-lg text-xs text-slate-600 border border-yellow-200">
          <p className="font-semibold mb-1">🐛 Debug Info:</p>
          <p>API: http://localhost:3000/api</p>
          <p>Backend: http://localhost:3001</p>
          <p>Open DevTools (F12) → Console to see detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default Login;