import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, Activity } from 'lucide-react';
import BackendTablesTab from './BackendTablesTab';
import BackendMigrationsTab from './BackendMigrationsTab';
import ArchitectureHealthTab from './ArchitectureHealthTab';

type TabType = 'tables' | 'migrations' | 'architecture';

const BackendReportsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('tables');
  const [userRole, setUserRole] = useState<string>('user');

  // Get user role from session storage (JWT token)
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('🔍 Token:', token ? 'Var' : 'Yok');
    
    if (token) {
      try {
        // JWT token format: header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🎫 JWT Payload:', payload);
        console.log('👤 User Role:', payload.role);
        setUserRole(payload.role || 'user');
      } catch (error) {
        console.error('❌ Failed to parse token:', error);
        setUserRole('user');
      }
    } else {
      console.warn('⚠️  Token not found in sessionStorage');
      setUserRole('user');
    }
    
    console.log('✅ User Role Set:', userRole);
  }, []);

  // 🔒 ROLE-BASED TAB VISIBILITY: Migration ve Architecture tab'ları sadece admin ve master_admin için
  const showMigrationTab = ['admin', 'master_admin'].includes(userRole);
  const showArchitectureTab = ['admin', 'master_admin'].includes(userRole);
  
  console.log('🎭 Current User Role:', userRole);
  console.log('📊 Show Migration Tab:', showMigrationTab);
  console.log('🏗️  Show Architecture Tab:', showArchitectureTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Geri</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Database className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Backend Raporları</h1>
              <p className="text-gray-600">Railway PostgreSQL Veritabanı Kontrol Paneli</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {/* Backend Tabloları - Herkes görebilir */}
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === 'tables'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Database size={20} />
              <span>Backend Tabloları</span>
            </button>

            {/* Migration Raporu - Sadece admin ve master_admin */}
            {showMigrationTab && (
              <button
                onClick={() => setActiveTab('migrations')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === 'migrations'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText size={20} />
                <span>Migration Raporu</span>
              </button>
            )}

            {/* Mimari Sağlık - Sadece admin ve master_admin */}
            {showArchitectureTab && (
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === 'architecture'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Activity size={20} />
                <span>🏗️ Mimari Sağlık</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tables' && <BackendTablesTab />}
            {activeTab === 'migrations' && showMigrationTab && <BackendMigrationsTab />}
            {activeTab === 'architecture' && showArchitectureTab && <ArchitectureHealthTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendReportsPage;

