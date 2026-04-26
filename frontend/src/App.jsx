import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home             from './pages/Home';
import Services         from './pages/Services';
import ServiceDetail    from './pages/ServiceDetail';
import Login            from './pages/Login';
import Register         from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard   from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/"             element={<Home />} />
          <Route path="/services"     element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />

          {/* Customer Routes */}
          <Route path="/dashboard/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />

          {/* Provider Routes */}
          <Route path="/dashboard/provider" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1A1A2E',
              color: '#F0F0FF',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#00D4AA', secondary: '#0A0A14' } },
            error:   { iconTheme: { primary: '#FF4757', secondary: '#0A0A14' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
