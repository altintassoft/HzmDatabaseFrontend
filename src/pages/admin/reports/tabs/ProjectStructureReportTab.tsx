import { useState } from 'react';
import { FolderTree, Code } from 'lucide-react';
import FrontendStructureTab from './FrontendStructureTab';
import BackendStructureTab from './BackendStructureTab';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectStructureReportTab() {
  const [activeSubTab, setActiveSubTab] = useState<'frontend' | 'backend'>('frontend');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📁 Proje Yapısı</h2>
        <p className="text-gray-600">Frontend & Backend Dosya Ağacı Analizi - Cursor Kuralları Uyumluluğu</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-1">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Renk Kodları (Cursor Kuralları):</p>
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

      {/* Sub Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {/* Frontend Tab */}
          <button
            onClick={() => setActiveSubTab('frontend')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all ${
              activeSubTab === 'frontend'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FolderTree size={20} />
            <span>📦 Frontend</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              HzmVeriTabaniFrontend
            </span>
          </button>

          {/* Backend Tab */}
          <button
            onClick={() => setActiveSubTab('backend')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all ${
              activeSubTab === 'backend'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Code size={20} />
            <span>🗄️ Backend</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              HzmVeriTabaniBackend
            </span>
          </button>
        </div>

        {/* Sub Tab Content */}
        <div className="p-6">
          {activeSubTab === 'frontend' && <FrontendStructureTab />}
          {activeSubTab === 'backend' && <BackendStructureTab />}
        </div>
      </div>
    </div>
  );
}

