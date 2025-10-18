import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminSidebar from './components/Layout/AdminSidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Guest/Dashboard';
import Restaurant from './pages/Guest/Restaurant';
import Services from './pages/Guest/Services';
import Activities from './pages/Guest/Activities';
import Chat from './pages/Guest/Chat';
import HotelMap from './pages/Guest/HotelMap';
import RoomControl from './pages/Guest/RoomControl';
import BeautyStore from './pages/Guest/BeautyStore';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminGuests from './pages/Admin/Guests';
import AdminReservations from './pages/Admin/Reservations';
import AdminStatistics from './pages/Admin/Statistics';
import AdminReports from './pages/Admin/Reports';
import { useAuth } from './contexts/AuthContext';
import AdminOrders from './pages/Admin/Orders';
import AdminServices from './pages/Admin/Services'; // ✅ ajout
import AdminSettings from "./pages/Admin/Settings"; // at the top


function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="App">
        <div className={isAdmin ? 'flex' : ''}>
          {/* Admin Sidebar */}
          {isAdmin && <AdminSidebar />}
          
          {/* Main Content */}
          <div className={isAdmin ? 'flex-1 ml-64' : 'w-full'}>
            <div className={isAdmin ? 'p-6' : ''}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              
              {/* Guest Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="guest">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/restaurant" element={
                <ProtectedRoute requiredRole="guest">
                  <Restaurant />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/services" element={
                <ProtectedRoute requiredRole="guest">
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/activities" element={
                <ProtectedRoute requiredRole="guest">
                  <Activities />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/chat" element={
                <ProtectedRoute requiredRole="guest">
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/hotel-map" element={
                <ProtectedRoute requiredRole="guest">
                  <HotelMap />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/room-control" element={
                <ProtectedRoute requiredRole="guest">
                  <RoomControl />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/beauty-store" element={
                <ProtectedRoute requiredRole="guest">
                  <BeautyStore />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>}  />

               <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} /> {/* ✅ ajout */}
              <Route path="/admin/orders" element={<AdminOrders />} />
<Route path="/admin/guests" element={<AdminGuests />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/guests" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminGuests />
                </ProtectedRoute>
              } />

              
              <Route path="/admin/reservations" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReservations />
                </ProtectedRoute>
              } />
              <Route path="/admin/statistics" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminStatistics />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </div>
          </div>
        </div>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'bg-white shadow-lg',
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
      </div>
    </Router>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;