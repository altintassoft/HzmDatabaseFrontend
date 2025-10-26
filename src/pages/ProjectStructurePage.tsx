import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderTree, RefreshCw } from 'lucide-react';
import FrontendStructureTab from './FrontendStructureTab';
import BackendStructureTab from './BackendStructureTab';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectStructurePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Geri</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <FolderTree className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📁 Proje Yapısı</h1>
                <p className="text-gray-600">Frontend & Backend Dosya Ağacı Analizi</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Yenile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {/* Frontend Tab */}
            <button
              onClick={() => setActiveTab('frontend')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === 'frontend'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderTree size={20} />
              <span>📦 FRONTEND</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                HzmVeriTabaniFrontend
              </span>
            </button>

            {/* Backend Tab */}
            <button
              onClick={() => setActiveTab('backend')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === 'backend'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderTree size={20} />
              <span>🗄️ BACKEND</span>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                HzmVeriTabaniBackend
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'frontend' && <FrontendStructureTab key={`frontend-${refreshKey}`} />}
            {activeTab === 'backend' && <BackendStructureTab key={`backend-${refreshKey}`} />}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Renk Kodları:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>0-300 satır (İyi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span>300-450 satır (Dikkat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">🔴</span>
                  <span>450-800 satır (Bölünmeli)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">🔥</span>
                  <span>800+ satır (ACİL)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

