import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar     from './components/Navbar';
import BoardPage  from './pages/BoardPage';
import LoginPage  from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage  from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/login"  element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />}
        />
        <Route path="/"            element={<BoardPage slug="default" />} />
        <Route path="/:boardSlug"  element={<BoardPage />} />
      </Routes>
    </div>
  );
}
