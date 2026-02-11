import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import KnowledgeBase from './features/07-kb/KnowledgeBase';

// 1. Import Security & Layout
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// 2. Import Feature Modules
import Login from './features/01-auth/Login';
import Register from './features/01-auth/Register';
import TicketList from './features/03-tickets/TicketList';
import StatsDashboard from './features/08-reports/StatsDashboard';
import UserManagement from './features/02-users/UserManagement';
import UserProfile from './features/02-users/UserProfile';
import AccountSettings from './features/02-users/AccountSettings';
import NotificationList from './features/06-notifications/NotificationList';
import TicketDetail from './features/03-tickets/TicketDetail';

// 3. Lazy Load Auth Features
const ForgotPassword = lazy(() => import('./features/01-auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/01-auth/ResetPassword'));

// 3. Dynamic Redirection Helper
const getDefaultRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return '/login';
  // Admin, Super Admin, and Manager go to Dashboard
  if (['Admin', 'Super Admin', 'Manager'].includes(user.role)) return '/dashboard';
  // Agents and Customers go to Tickets
  return '/tickets';
};

// 4. Unauthorized Access Page
const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-red-500">403</h1>
        <p className="text-2xl font-semibold mt-4 text-gray-800">Access Denied</p>
        <p className="text-gray-500 mt-2">Your role does not have permission to view this page.</p>
        <button
          onClick={() => navigate(getDefaultRoute())}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/reset-password" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
          </Suspense>
        } />

        {/* Redirect base URL to login if not authenticated, else dynamic landing */}
        <Route
          path="/"
          element={
            localStorage.getItem('token')
              ? <Navigate to={getDefaultRoute()} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* --- Protected Module Routes --- */}

        {/* Module 8: Analytics Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}>
              <MainLayout>
                <StatsDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Module 3: Ticket Management */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TicketList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TicketDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Module 2: Admin User Management (Role-Restricted) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Module 4: Knowledge Base */}
        <Route
          path="/kb"
          element={
            <ProtectedRoute>
              <MainLayout>
                <KnowledgeBase />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Phase 4: Extras - Profile & Settings */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotificationList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AccountSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Error Handling */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
}

export default App;