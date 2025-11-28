
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import ContactPage from '@/pages/ContactPage';
import ProposPage from '@/pages/ProposPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminPropertiesPage from '@/pages/AdminPropertiesPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminMessagesPage from '@/pages/AdminMessagesPage';
import AdminSalesPage from '@/pages/AdminSalesPage';
import AdminStatsPage from '@/pages/AdminStatsPage';
import AdminVisitsPage from '@/pages/AdminVisitsPage';
import VisitsPage from '@/pages/VisitsPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import FavoritesPage from '@/pages/FavoritesPage';
import ServicesPage from '@/pages/ServicesPage';
import UserMessagesPage from '@/pages/UserMessagesPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  }

  if (userProfile && userProfile.role === 'admin') {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/propos" element={<ProposPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services" element={<ServicesPage />} />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account-settings" 
        element={
          <ProtectedRoute>
            <AccountSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <UserMessagesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/visits" 
        element={
          <ProtectedRoute>
            <VisitsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/properties" 
        element={
          <AdminRoute>
            <AdminPropertiesPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/messages" 
        element={
          <AdminRoute>
            <AdminMessagesPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/sales" 
        element={
          <AdminRoute>
            <AdminSalesPage />
          </AdminRoute>
        } 
      />
       <Route 
        path="/admin/stats" 
        element={
          <AdminRoute>
            <AdminStatsPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/visits" 
        element={
          <AdminRoute>
            <AdminVisitsPage />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>Nomad'immo - L'immobilier sans frontières</title>
          <meta name="description" content="Découvrez notre sélection exclusive de biens immobiliers. Achat, vente, location - nous vous accompagnons dans tous vos projets immobiliers à travers le monde." />
          <meta property="og:title" content="Nomad'immo - L'immobilier sans frontières" />
          <meta property="og:description" content="Découvrez notre sélection exclusive de biens immobiliers. Achat, vente, location - nous vous accompagnons dans tous vos projets immobiliers à travers le monde." />
        </Helmet>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
