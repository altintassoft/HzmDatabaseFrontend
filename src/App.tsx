import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DatabaseProvider } from './context/DatabaseContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute from './components/shared/AdminRoute';
import SocialMediaDisplay from './components/layout/SocialMediaDisplay';
import SEOHead from './components/shared/SEOHead';
// Common Pages
import HomePage from './pages/common/home/HomePage';
import LoginPage from './pages/common/login/LoginPage';
import RegisterPage from './pages/common/register/RegisterPage';

// Customer Pages
import DashboardPage from './pages/customer/dashboard/DashboardPage';
import DatabasePricingPage from './pages/customer/pricing/DatabasePricingPage';
import UserSettingsPage from './pages/customer/settings/UserSettingsPage';

// Project Pages
import ProjectsListPage from './pages/projects/list/ProjectsListPage';
import ProjectDetailPage from './pages/projects/detail/ProjectDetailPage';
import ProjectDataPage from './pages/projects/data/ProjectDataPage';

// Admin Pages
import AdminPage from './pages/admin/dashboard/AdminDashboardPage';
import DatabaseUsersPage from './pages/admin/database-users/DatabaseUsersPage';
import DatabaseProjectsPage from './pages/admin/database-projects/DatabaseProjectsPage';
import DatabaseStatePage from './pages/admin/database-state/DatabaseStatePage';
import UpgradePlanPage from './pages/admin/upgrade-plan/UpgradePlanPage';
import BackendReportsPage from './pages/admin/reports';

// Master Admin Pages
import SystemSettingsPage from './pages/master-admin/system-settings/SystemSettingsPage';

// Layout
import Layout from './components/layout/Layout';
// CIO Module Import
import { CIODashboard } from './pages/cio/dashboard';
import './App.css';

// Mock sosyal medya linkleri - gerçek uygulamada bu veriler state management'ten gelecek
const mockSocialLinks = [
  {
    id: '1',
    platform: 'facebook',
    url: 'https://facebook.com/hzmsoft',
    title: 'HZMSoft Facebook',
    icon: '📘',
    color: 'bg-blue-600',
    isActive: true,
    displayLocation: 'footer'
  },
  {
    id: '2',
    platform: 'instagram',
    url: 'https://instagram.com/hzmsoft',
    title: 'HZMSoft Instagram',
    icon: '📷',
    color: 'bg-pink-500',
    isActive: true,
    displayLocation: 'footer'
  },
  {
    id: '3',
    platform: 'twitter',
    url: 'https://twitter.com/hzmsoft',
    title: 'HZMSoft Twitter',
    icon: '🐦',
    color: 'bg-sky-500',
    isActive: true,
    displayLocation: 'header'
  }
];

function App() {
  return (
    <HelmetProvider>
      <DatabaseProvider>
        <BrowserRouter>
          {/* Global SEO Head */}
          <SEOHead />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <div>
                <HomePage />
                {/* Footer'da sosyal medya linklerini göster */}
                <footer className="bg-gray-800 text-white py-8">
                  <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="mb-4 md:mb-0">
                        <p className="text-gray-400">© 2025 HZMSoft. Tüm hakları saklıdır.</p>
                      </div>
                      <SocialMediaDisplay 
                        links={mockSocialLinks} 
                        location="footer"
                        className="mb-4 md:mb-0"
                      />
                    </div>
                  </div>
                </footer>
              </div>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/upgrade" element={
              <ProtectedRoute>
                <UpgradePlanPage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            
            <Route path="/backend-reports" element={
              <AdminRoute>
                <BackendReportsPage />
              </AdminRoute>
            } />
            
            <Route path="/master-admin/system-settings" element={
              <AdminRoute>
                <SystemSettingsPage />
              </AdminRoute>
            } />
            
            {/* CIO Module Route */}
            <Route path="/cio" element={
              <AdminRoute>
                <CIODashboard />
              </AdminRoute>
            } />
            
            {/* Database Management Routes */}
            <Route path="/database/users" element={
              <AdminRoute>
                <DatabaseUsersPage />
              </AdminRoute>
            } />
            
            <Route path="/database/projects" element={
              <AdminRoute>
                <DatabaseProjectsPage />
              </AdminRoute>
            } />
            
            <Route path="/database/state" element={
              <AdminRoute>
                <DatabaseStatePage />
              </AdminRoute>
            } />
            
            <Route path="/database/pricing" element={
              <AdminRoute>
                <DatabasePricingPage />
              </AdminRoute>
            } />
            
            <Route path="/workspace" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-slate-50">
                  <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
                    <div className="container mx-auto flex justify-between items-center">
                      <h1 className="text-2xl font-bold">Veri Tabanı Sistemi</h1>
                      {/* Header'da sosyal medya linklerini göster */}
                      <SocialMediaDisplay 
                        links={mockSocialLinks} 
                        location="header"
                      />
                    </div>
                  </header>
                  <main className="container mx-auto p-4">
                    <Layout />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsListPage />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:projectId" element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:projectId/data" element={
              <ProtectedRoute>
                <ProjectDataPage />
              </ProtectedRoute>
            } />
            
            {/* Redirect old routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DatabaseProvider>
    </HelmetProvider>
  );
}

export default App;