import { useState } from 'react';
import { FolderTree } from 'lucide-react';
import BackendStructureTab from './BackendStructureTab';
import FrontendStructureTab from './FrontendStructureTab';

type SubTabType = 'backend' | 'frontend';

const ProjectStructureTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('backend');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <FolderTree size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">📁 Proje Yapısı</h2>
            <p className="text-purple-100 mt-1">
              Backend & Frontend Dosya Tree Analizi
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {/* Backend Tab */}
          <button
            onClick={() => setActiveSubTab('backend')}
            className={`flex items-center gap-2 px-8 py-4 font-medium transition-all ${
              activeSubTab === 'backend'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FolderTree size={20} />
            <span>Backend Yapısı</span>
          </button>

          {/* Frontend Tab */}
          <button
            onClick={() => setActiveSubTab('frontend')}
            className={`flex items-center gap-2 px-8 py-4 font-medium transition-all ${
              activeSubTab === 'frontend'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FolderTree size={20} />
            <span>Frontend Yapısı</span>
          </button>
        </div>

        {/* Sub-Tab Content */}
        <div className="p-6">
          {/* Backend Tab - Always mounted, hidden with CSS */}
          <div className={activeSubTab === 'backend' ? 'block' : 'hidden'}>
            <BackendStructureTab />
          </div>
          
          {/* Frontend Tab - Always mounted, hidden with CSS */}
          <div className={activeSubTab === 'frontend' ? 'block' : 'hidden'}>
            <FrontendStructureTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStructureTab;

