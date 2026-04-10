import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';

import HomePage from '../features/home/HomePage'
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import CommunityPage from '../features/community/CommunityPage';
import UserProfile from '../user/UserProfile';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminPage from '../admin/AdminPage';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<Navigate to="/#library" replace />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;
