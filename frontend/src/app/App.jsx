import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from '../features/home/HomePage'
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import UserProfile from '../user/UserProfile';
import ProtectedRoute from '../auth/ProtectedRoute';

function App() {
  return (
    <Router>
          <Routes>

            <Route path="/" element={<HomePage />} />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
    </Router>
  );
}

export default App;