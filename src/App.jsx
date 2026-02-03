import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KnowledgeBase from './features/knowledge-base/KnowledgeBase';

// 1. Import Security & Layout
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// 2. Import Feature Modules
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import TicketList from './features/tickets/TicketList';
import StatsDashboard from './features/analytics/StatsDashboard';
import UserManagement from './features/users/UserManagement';
import UserProfile from './features/users/UserProfile';
import AccountSettings from './features/users/AccountSettings';
import TicketDetail from './features/tickets/TicketDetail';

// 3. Unauthorized Access Page
const Unauthorized = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-extrabold text-red-500">403</h1>
      <p className="text-2xl font-semibold mt-4 text-gray-800">Access Denied</p>
      <p className="text-gray-500 mt-2">Your role does not have permission to view this page.</p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect base URL to login if not authenticated, else dashboard */}
        <Route
          path="/"
          element={
            localStorage.getItem('token')
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* --- Protected Module Routes --- */}

        {/* Module 8: Analytics Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;