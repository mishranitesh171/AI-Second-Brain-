import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import AI from './pages/AI';
import Trash from './pages/Trash';
import Settings from './pages/Settings';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper (redirect to home if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/new" element={<NoteEditor />} />
        <Route path="notes/:id" element={<NoteEditor />} />
        <Route path="ai" element={<AI />} />
        <Route path="trash" element={<Trash />} />
        <Route path="settings" element={<Settings />} />
        <Route path="collections" element={<Notes />} />
        <Route path="tags" element={<Notes />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'toast-custom',
              style: {
                padding: '12px 16px',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
