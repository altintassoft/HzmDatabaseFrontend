import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Filter,
  BookOpen
} from 'lucide-react';
import api from '../../../../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface PhaseFeature {
  phase: number;
  category: string;
  feature: string;
  backend: 'done' | 'progress' | 'todo';
  frontend: 'done' | 'progress' | 'todo' | 'n/a';
  status: 'done' | 'progress' | 'todo';
  percentage: number;
  description: string;
}

interface PhaseStats {
  phase: number;
  title: string;
  description: string;
  total: number;
  done: number;
  progress: number;
  todo: number;
  percentage: number;
}

interface PhaseProgressData {
  summary: {
    currentPhase: number;
    overallProgress: number;
    totalFeatures: number;
    completedFeatures: number;
  };
  phases: PhaseStats[];
  features: PhaseFeature[];
  timestamp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PhaseProgressTab() {
  const [data, setData] = useState<PhaseProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'progress' | 'todo'>('all');
  const [phaseFilter, setPhaseFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database?type=phase-progress');
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
      console.error('Phase progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const configs = {
      done: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Tamamlandı' },
      progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🔄 Devam Ediyor' },
      todo: { bg: 'bg-gray-100', text: 'text-gray-600', label: '⏳ Bekliyor' },
      'n/a': { bg: 'bg-gray-50', text: 'text-gray-500', label: 'N/A' }
    };

    const config = configs[status as keyof typeof configs] || configs.todo;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPhaseColor = (phase: number) => {
    const colors = ['blue', 'green', 'orange', 'red'];
    return colors[phase - 1] || 'gray';
  };

  const filteredFeatures = data?.features.filter(f => {
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchPhase = phaseFilter === 'all' || f.phase === phaseFilter;
    return matchStatus && matchPhase;
  }) || [];

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Hata</h3>
        <p className="text-red-700">{error || 'Veri yüklenemedi'}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="text-3xl font-bold text-blue-900">{data.summary.overallProgress}%</span>
          </div>
          <div className="text-sm font-medium text-blue-900">Genel İlerleme</div>
          <div className="text-xs text-blue-700 mt-1">
            {data.summary.completedFeatures} / {data.summary.totalFeatures} özellik
          </div>
        </div>

        {data.phases.map((phase) => {
          const color = getPhaseColor(phase.phase);
          const bgClass = `bg-gradient-to-br from-${color}-50 to-${color}-100`;
          const borderClass = `border-${color}-300`;
          const textClass = `text-${color}-900`;
          const subTextClass = `text-${color}-700`;

          return (
            <div key={phase.phase} className={`${bgClass} border-2 ${borderClass} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <BookOpen className={`h-6 w-6 text-${color}-600`} />
                <span className={`text-3xl font-bold ${textClass}`}>{phase.percentage}%</span>
              </div>
              <div className={`text-sm font-medium ${textClass}`}>Phase {phase.phase}</div>
              <div className={`text-xs ${subTextClass} mt-1`}>
                {phase.done} / {phase.total} tamamlandı
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.phases.map((phase) => {
          const color = getPhaseColor(phase.phase);
          const bgClass = phase.phase === data.summary.currentPhase 
            ? `bg-${color}-50 border-${color}-500 border-2` 
            : `bg-white border-gray-200 border`;

          return (
            <div key={phase.phase} className={`${bgClass} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">📘 Phase {phase.phase}</h3>
                {phase.phase === data.summary.currentPhase && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Aktif</span>
                )}
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">{phase.title}</h4>
              <p className="text-xs text-gray-600 mb-3">{phase.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-700">✅ Tamamlanan</span>
                  <span className="font-semibold text-green-900">{phase.done}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-700">🔄 Devam Eden</span>
                  <span className="font-semibold text-yellow-900">{phase.progress}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">⏳ Bekleyen</span>
                  <span className="font-semibold text-gray-900">{phase.todo}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">İlerleme</span>
                  <span className="font-semibold text-gray-900">{phase.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${color}-600 h-2 rounded-full transition-all`}
                    style={{ width: `${phase.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
        <Filter className="h-5 w-5 text-gray-600" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Durum:</span>
          {(['all', 'done', 'progress', 'todo'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tümü' : status === 'done' ? 'Tamamlanan' : status === 'progress' ? 'Devam Eden' : 'Bekleyen'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium text-gray-700">Phase:</span>
          {(['all', 1, 2, 3, 4] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                phaseFilter === phase
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {phase === 'all' ? 'Tümü' : `Phase ${phase}`}
            </button>
          ))}
        </div>
      </div>

      {/* Features Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Özellik Detayları</h3>
          <p className="text-sm text-gray-600">Her özelliğin backend ve frontend durumunu görün</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Özellik</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Backend</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Frontend</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">İlerleme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFeatures.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-${getPhaseColor(feature.phase)}-100 text-${getPhaseColor(feature.phase)}-800`}>
                      Phase {feature.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{feature.category}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{feature.feature}</div>
                    <div className="text-xs text-gray-500">{feature.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(feature.backend)}
                      <span className="text-xs text-gray-600 capitalize">{feature.backend}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(feature.frontend)}
                      <span className="text-xs text-gray-600 capitalize">{feature.frontend}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(feature.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${feature.status === 'done' ? 'green' : feature.status === 'progress' ? 'yellow' : 'gray'}-600 h-2 rounded-full`}
                          style={{ width: `${feature.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{feature.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFeatures.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Seçilen filtreye uygun özellik bulunamadı</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Son güncelleme: {new Date(data.timestamp).toLocaleString('tr-TR')}
      </div>
    </div>
  );
}

