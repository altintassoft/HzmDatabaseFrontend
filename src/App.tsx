import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DatabaseProvider } from './context/DatabaseContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SocialMediaDisplay from './components/SocialMediaDisplay';
import SEOHead from './components/SEOHead';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';
import ProjectList from './pages/ProjectList';
import ProjectManagement from './pages/ProjectManagement';
import ProjectDataView from './pages/ProjectDataView';
import DatabaseUsers from './pages/DatabaseUsers';
import DatabaseProjects from './pages/DatabaseProjects';
import DatabaseState from './pages/DatabaseState';
import DatabasePricing from './pages/DatabasePricing';
import UpgradePlanPage from './pages/UpgradePlanPage';
import BackendTablesPage from './pages/BackendTablesPage';
// CIO Module Import
import { CIODashboard } from './modules/cio';
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            
            <Route path="/backend-tables" element={
              <AdminRoute>
                <BackendTablesPage />
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
                <DatabaseUsers />
              </AdminRoute>
            } />
            
            <Route path="/database/projects" element={
              <AdminRoute>
                <DatabaseProjects />
              </AdminRoute>
            } />
            
            <Route path="/database/state" element={
              <AdminRoute>
                <DatabaseState />
              </AdminRoute>
            } />
            
            <Route path="/database/pricing" element={
              <AdminRoute>
                <DatabasePricing />
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
                <ProjectList />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:projectId" element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:projectId/data" element={
              <ProtectedRoute>
                <ProjectDataView />
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