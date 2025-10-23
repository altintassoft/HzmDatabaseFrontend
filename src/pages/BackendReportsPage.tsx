import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, Activity } from 'lucide-react';
import BackendTablesTab from './BackendTablesTab';
import BackendMigrationsTab from './BackendMigrationsTab';
import ArchitectureHealthTab from './ArchitectureHealthTab';

type TabType = 'tables' | 'migrations' | 'architecture';

const BackendReportsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('tables');

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
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tables' && <BackendTablesTab />}
            {activeTab === 'migrations' && <BackendMigrationsTab />}
            {activeTab === 'architecture' && <ArchitectureHealthTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendReportsPage;

