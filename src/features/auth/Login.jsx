import React, { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // --- SIMULATED AUTHENTICATION (Module 1) ---
    // In a real app, you'd call your API here. 
    // For now, we manually set the data to unlock the ProtectedRoutes.
    
    const dummyUser = {
      email: credentials.email || 'manoj@helpdesk.com',
      role: 'Admin' // You can change this to 'Agent' or 'Customer' to test RBAC
    };

    // 1. Create the Local Storage entries
    localStorage.setItem('token', 'dummy-jwt-token-12345');
    localStorage.setItem('user', JSON.stringify(dummyUser));

    // 2. Redirect to dashboard
    // We use window.location.href to force a full refresh so the App 
    // detects the new localStorage data immediately.
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Helpdesk Pro</h2>
          <p className="text-slate-500 mt-2">Please sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@company.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;