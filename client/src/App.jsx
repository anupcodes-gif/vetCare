import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import PetHistory from './pages/PetHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

const ProtectedRoute = ({ children, isAdmin = false, userOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (isAdmin && user.role !== 'Admin') return <Navigate to="/dashboard" />;
  if (userOnly && user.role === 'Admin') return <Navigate to="/admin" />;
  return children;
};

function App() {
  return (
    <ModalProvider>
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            
            <Route path="/dashboard" element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>} />
            <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute userOnly><Shop /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute userOnly><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/pet-history/:id" element={<ProtectedRoute><PetHistory /></ProtectedRoute>} />

            
            <Route path="/admin" element={<ProtectedRoute isAdmin={true}><AdminDashboard /></ProtectedRoute>} />

            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
    </ModalProvider>
  );
}

export default App;
