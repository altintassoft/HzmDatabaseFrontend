import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { Database, LogOut, User, Plus, Eye, Settings, Shield, Server } from 'lucide-react';

const DashboardPage = () => {
  const { state, logout } = useDatabase();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateProject = () => {
    navigate('/projects');
  };

  const handleUpgradePlan = () => {
    navigate('/upgrade');
  };

  // Debug: Log user info to console
  console.log('Current user:', state.user);
  console.log('Is admin:', state.user?.isAdmin);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Database className="text-blue-600" size={32} />
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600 tracking-wider">HZMSoft</span>
              </div>
              <div className="text-sm text-gray-600 font-medium">DataBase Pro</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User size={20} />
              <span>{state.user?.name}</span>
              {state.user?.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium hover:bg-purple-200 transition-colors cursor-pointer ml-2"
                >
                  Admin
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ayarlar"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Hoş geldiniz, {state.user?.name}!
          </h2>
          <p className="text-gray-600">
            HZMSoft DataBase Pro ile projelerinizi yönetin ve yeni veritabanları oluşturun.
          </p>
          
          {/* Subscription Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Mevcut Plan: <span className="capitalize">{state.user?.subscriptionType === 'enterprise' ? 'Kurumsal' : state.user?.subscriptionType}</span>
                </p>
                <p className="text-xs text-blue-600">
                  Proje Limiti: {state.user?.maxProjects === -1 ? 'Sınırsız' : `${state.projects.length}/${state.user?.maxProjects}`} | 
                  Tablo Limiti: {state.user?.maxTables === -1 ? 'Sınırsız' : `${state.projects.reduce((total, project) => total + project.tables.length, 0)}/${state.user?.maxTables}`}
                </p>
              </div>
              {/* Show upgrade button for all users except enterprise */}
              {state.user?.subscriptionType !== 'enterprise' && (
                <button 
                  onClick={handleUpgradePlan}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Planı Yükselt
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
                <p className="text-3xl font-bold text-blue-600">{state.projects.length}</p>
              </div>
              <Database className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tablo</p>
                <p className="text-3xl font-bold text-green-600">
                  {state.projects.reduce((total, project) => total + project.tables.length, 0)}
                </p>
              </div>
              <Settings className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Proje</p>
                <p className="text-3xl font-bold text-purple-600">
                  {state.selectedProject ? 1 : 0}
                </p>
              </div>
              <Eye className="text-purple-600" size={40} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateProject}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Yeni Proje Oluştur
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye size={20} className="mr-2" />
              Projeleri Görüntüle
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings size={20} className="mr-2" />
              Ayarlar
            </button>
            {/* Show upgrade button for all users except enterprise */}
            {state.user?.subscriptionType !== 'enterprise' && (
              <button
                onClick={handleUpgradePlan}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Shield size={20} className="mr-2" />
                Planı Yükselt
              </button>
            )}
            {state.user?.isAdmin && (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Shield size={20} className="mr-2" />
                  Admin Paneli
                </button>
                <button
                  onClick={() => navigate('/backend-reports')}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Server size={20} className="mr-2" />
                  Backend Raporları
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Son Projeler</h3>
          {state.projects.length === 0 ? (
            <div className="text-center py-8">
              <Database className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-4">Henüz hiç projeniz yok</p>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                İlk Projenizi Oluşturun
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.projects.slice(0, 6).map(project => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{project.name}</h4>
                    <Database className="text-blue-600" size={20} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {project.tables.length} tablo
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HZMSoft Footer Branding */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold text-blue-600">HZMSoft</span> • Professional Database Solutions
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;