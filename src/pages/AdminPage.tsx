import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Users, 
  Settings, 
  DollarSign, 
  ArrowLeft, 
  Shield, 
  Database,
  HardDrive,
  FileText,
  Crown,
  Activity,
  Megaphone,
  Server
} from 'lucide-react';

const AdminPage = () => {
  const { state, getAllUsers } = useDatabase();
  const navigate = useNavigate();
  const users = getAllUsers();

  // Check if user is admin
  if (!state.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    );
  }

  // Get all projects from localStorage
  const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 hover:bg-purple-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center">
            <Shield size={28} className="mr-3" />
            <h1 className="text-2xl font-bold">Admin Paneli</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <Activity className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Kullanıcı</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.subscriptionType !== 'free').length}
                </p>
              </div>
              <Crown className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fiyat Planı</p>
                <p className="text-3xl font-bold text-orange-600">{state.pricingPlans.length}</p>
              </div>
              <DollarSign className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        {/* Database Management Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div 
            onClick={() => navigate('/database/users')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="text-blue-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Kullanıcılar</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            </div>
            <p className="text-sm text-gray-600">Kullanıcı hesaplarını yönetin</p>
            <div className="mt-3 text-xs text-gray-500">
              Aktif: {users.filter(u => u.isActive).length} | 
              Pasif: {users.filter(u => !u.isActive).length}
            </div>
          </div>

          <div 
            onClick={() => navigate('/database/projects')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="text-green-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Projeler</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{allProjects.length}</div>
            </div>
            <p className="text-sm text-gray-600">Tüm projeleri görüntüleyin</p>
            <div className="mt-3 text-xs text-gray-500">
              Tablolar: {allProjects.reduce((total: number, project: any) => total + project.tables.length, 0)}
            </div>
          </div>

          <div 
            onClick={() => navigate('/database/state')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-indigo-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <HardDrive className="text-indigo-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Sistem Durumu</h3>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {(JSON.stringify({
                  users,
                  projects: allProjects,
                  state: state,
                  plans: state.pricingPlans
                }).length / 1024).toFixed(0)}KB
              </div>
            </div>
            <p className="text-sm text-gray-600">Uygulama durumunu yönetin</p>
            <div className="mt-3 text-xs text-gray-500">
              Veri yedekleme ve geri yükleme
            </div>
          </div>

          <div 
            onClick={() => navigate('/database/pricing')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="text-purple-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Fiyatlandırma</h3>
              </div>
              <div className="text-2xl font-bold text-purple-600">{state.pricingPlans.length}</div>
            </div>
            <p className="text-sm text-gray-600">Fiyat planlarını yönetin</p>
            <div className="mt-3 text-xs text-gray-500">
              Aktif: {state.pricingPlans.filter(p => p.isActive).length} plan
            </div>
          </div>

          {/* NEW: CIO Management Card */}
          <div 
            onClick={() => navigate('/cio')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-pink-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Megaphone className="text-pink-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Reklam CIO</h3>
              </div>
              <div className="text-2xl font-bold text-pink-600">🎯</div>
            </div>
            <p className="text-sm text-gray-600">Reklam kampanyalarını yönetin</p>
            <div className="mt-3 text-xs text-gray-500">
              Kampanya oluştur ve analiz et
            </div>
          </div>

          {/* NEW: Backend Reports Card */}
          <div 
            onClick={() => navigate('/backend-reports')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-cyan-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="text-cyan-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Backend Raporları</h3>
              </div>
              <div className="text-2xl font-bold text-cyan-600">🗄️</div>
            </div>
            <p className="text-sm text-gray-600">Railway tablo envanteri</p>
            <div className="mt-3 text-xs text-gray-500">
              core.users, core.tenants vs.
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/database/users')}
              className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Users size={20} className="mr-2" />
              Kullanıcı Ekle
            </button>
            <button
              onClick={() => navigate('/database/projects')}
              className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Database size={20} className="mr-2" />
              Projeleri Görüntüle
            </button>
            <button
              onClick={() => navigate('/database/pricing')}
              className="flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <DollarSign size={20} className="mr-2" />
              Plan Ekle
            </button>
            <button
              onClick={() => navigate('/database/state')}
              className="flex items-center justify-center px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Settings size={20} className="mr-2" />
              Sistem Ayarları
            </button>
            {/* NEW: CIO Quick Action */}
            <button
              onClick={() => navigate('/cio')}
              className="flex items-center justify-center px-4 py-3 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
            >
              <Megaphone size={20} className="mr-2" />
              Reklam Yönetimi
            </button>
            {/* NEW: Backend Reports Quick Action */}
            <button
              onClick={() => navigate('/backend-reports')}
              className="flex items-center justify-center px-4 py-3 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
            >
              <Server size={20} className="mr-2" />
              Backend Raporları
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;