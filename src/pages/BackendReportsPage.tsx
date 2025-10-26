import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, Activity, GitCompare, Target } from 'lucide-react';
import BackendTablesTab from './BackendTablesTab';
import MigrationSchemaTab from './MigrationSchemaTab';
import ArchitectureComplianceTab from './ArchitectureComplianceTab';
import { PlanComplianceTab } from './PlanComplianceTab';

type TabType = 'tables' | 'migration-schema' | 'architecture' | 'plan';

const BackendReportsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('tables');
  const [userRole, setUserRole] = useState<string>('user');

  // Get user role from session storage (JWT token)
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token'); // ✅ FIXED: was 'token', should be 'auth_token'
    console.log('🔍 Token:', token ? 'Var (auth_token)' : 'Yok');
    
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
      console.warn('⚠️  Token not found in sessionStorage (looking for auth_token)');
      setUserRole('user');
    }
    
    console.log('✅ User Role Set:', userRole);
  }, []);

  // 🔒 ROLE-BASED TAB VISIBILITY: Migration/Schema, Architecture, Plan tab'ları sadece admin ve master_admin için
  const showMigrationSchemaTab = ['admin', 'master_admin'].includes(userRole);
  const showArchitectureTab = ['admin', 'master_admin'].includes(userRole);
  const showPlanTab = ['admin', 'master_admin'].includes(userRole);
  
  console.log('🎭 Current User Role:', userRole);
  console.log('📊 Show Migration/Schema Tab:', showMigrationSchemaTab);
  console.log('🏗️  Show Architecture Tab:', showArchitectureTab);
  console.log('🎯 Show Plan Tab:', showPlanTab);

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

            {/* Migration & Schema - Sadece admin ve master_admin */}
            {showMigrationSchemaTab && (
              <button
                onClick={() => setActiveTab('migration-schema')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === 'migration-schema'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <GitCompare size={20} />
                <span>📋 Migration & Schema</span>
              </button>
            )}

            {/* Mimari Uyumluluk - Sadece admin ve master_admin */}
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
                <span>🏗️ Mimari Uyumluluk</span>
              </button>
            )}

            {/* Plan Compliance - Sadece admin ve master_admin */}
            {showPlanTab && (
              <button
                onClick={() => setActiveTab('plan')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === 'plan'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Target size={20} />
                <span>🎯 Plan Uyumu</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tables' && <BackendTablesTab />}
            {activeTab === 'migration-schema' && showMigrationSchemaTab && <MigrationSchemaTab />}
            {activeTab === 'architecture' && showArchitectureTab && <ArchitectureComplianceTab />}
            {activeTab === 'plan' && showPlanTab && <PlanComplianceTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendReportsPage;

