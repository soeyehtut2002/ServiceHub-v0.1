import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home              from './pages/Home';
import Services          from './pages/Services';
import ServiceDetail     from './pages/ServiceDetail';
import Login             from './pages/Login';
import Register          from './pages/Register';
import ForgotPassword    from './pages/ForgotPassword';
import ResetPassword     from './pages/ResetPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard    from './pages/AdminDashboard';
import ProfilePage       from './pages/ProfilePage';
import ChatPage          from './pages/ChatPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/"             element={<Home />} />
            <Route path="/services"     element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />

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

            {/* Profile (all authenticated roles) */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Chat — conversation list */}
            <Route path="/chat" element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ChatPage />
              </ProtectedRoute>
            } />

            {/* Chat — specific conversation */}
            <Route path="/chat/:userId" element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ChatPage />
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
                background: '#141428',
                color: '#E8F8FF',
                border: '1px solid rgba(0,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,255,255,0.08)',
              },
              success: { iconTheme: { primary: '#00FFFF', secondary: '#141428' } },
              error:   { iconTheme: { primary: '#FF4757', secondary: '#141428' } },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
