import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.jsx';
import AdminDashboard from '@/pages/dashboard/AdminDashboard.jsx';
import OfficerDashboard from '@/pages/dashboard/OfficerDashboard.jsx';
import LandlordDashboard from '@/pages/dashboard/LandlordDashboard.jsx';
import CollectorDashboard from '@/pages/dashboard/CollectorDashboard.jsx';
import ResidentDashboard from '@/pages/dashboard/ResidentDashboard.jsx';
import UsersPage from '@/pages/admin/UsersPage.jsx';
import ApartmentsPage from '@/pages/admin/ApartmentsPage.jsx';
import CollectionsPage from '@/pages/admin/CollectionsPage.jsx';
import ComplaintsPage from '@/pages/admin/ComplaintsPage.jsx';
import ReportsPage from '@/pages/reports/ReportsPage.jsx';
import VerificationPage from '@/pages/verification/VerificationPage.jsx';
import AnomaliesPage from '@/pages/anomalies/AnomaliesPage.jsx';
import MapViewPage from '@/pages/maps/MapViewPage.jsx';
import NotificationPage from '@/pages/notifications/NotificationPage.jsx';
import AuditLogsPage from '@/pages/audit/AuditLogsPage.jsx';
import MainLayout from '@/components/layout/MainLayout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

const App = () => {
  const { user } = useAuth();

  const RoleBasedDashboard = () => {
    if (!user) return <Navigate to="/auth/login" replace />;
    switch (user.role) {
      case 'county_admin':
        return <AdminDashboard />;
      case 'county_officer':
        return <OfficerDashboard />;
      case 'landlord':
        return <LandlordDashboard />;
      case 'waste_collector':
        return <CollectorDashboard />;
      case 'resident':
        return <ResidentDashboard />;
      default:
        return <Navigate to="/auth/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route path="/maps" element={<MainLayout><MapViewPage /></MainLayout>} />
      <Route path="/notifications" element={<MainLayout><NotificationPage /></MainLayout>} />
      <Route path="/dashboard/*" element={<MainLayout><RoleBasedDashboard /></MainLayout>} />
      
      {/* Management pages */}
      <Route path="/users" element={<MainLayout><UsersPage /></MainLayout>} />
      <Route path="/apartments" element={<MainLayout><ApartmentsPage /></MainLayout>} />
      <Route path="/collections" element={<MainLayout><CollectionsPage /></MainLayout>} />
      <Route path="/complaints" element={<MainLayout><ComplaintsPage /></MainLayout>} />
      <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
      <Route path="/verifications" element={<MainLayout><VerificationPage /></MainLayout>} />
      <Route path="/anomalies" element={<MainLayout><AnomaliesPage /></MainLayout>} />
      <Route path="/audit" element={<MainLayout><AuditLogsPage /></MainLayout>} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

export default App;
