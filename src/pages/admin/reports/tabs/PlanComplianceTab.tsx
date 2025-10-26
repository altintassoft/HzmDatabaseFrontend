import { useState } from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import EndpointComplianceTab from './EndpointComplianceTab';
import PhaseProgressTab from './PhaseProgressTab';
import WrongProgressTab from './WrongProgressTab';

// ============================================================================
// MAIN WRAPPER COMPONENT
// ============================================================================

export const PlanComplianceTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<'endpoint' | 'phase' | 'wrong'>('endpoint');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">📊 Plan & İlerleme Raporu</h2>
            <p className="text-blue-100 mt-1">
              Endpoint Uyumu • Phase İlerleme • Mimari Kalite Kontrolü
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {/* Endpoint Uyumu */}
          <button
            onClick={() => setActiveSubTab('endpoint')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSubTab === 'endpoint'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Target className="h-5 w-5" />
            <span>🎯 Endpoint Uyumu</span>
          </button>

          {/* Phase İlerleme */}
          <button
            onClick={() => setActiveSubTab('phase')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSubTab === 'phase'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>📈 Phase İlerleme</span>
          </button>

          {/* Yanlış İlerlemeler */}
          <button
            onClick={() => setActiveSubTab('wrong')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSubTab === 'wrong'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
            <span>⚠️ Yanlış İlerlemeler</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeSubTab === 'endpoint' && <EndpointComplianceTab />}
          {activeSubTab === 'phase' && <PhaseProgressTab />}
          {activeSubTab === 'wrong' && <WrongProgressTab />}
        </div>
      </div>
    </div>
  );
};
