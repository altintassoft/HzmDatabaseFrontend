import { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Filter,
  FileCode,
  Shield,
  Code
} from 'lucide-react';
import api from '../../../../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface Issue {
  priority: 'P0' | 'P1' | 'P2';
  category: string;
  file: string;
  issue: string;
  suggestion: string;
  action: string;
  line?: number;
}

interface WrongProgressData {
  summary: {
    p0: number;
    p1: number;
    p2: number;
    clean: number;
    score: number;
  };
  issues: Issue[];
  categories: {
    [key: string]: number;
  };
  timestamp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WrongProgressTab() {
  const [data, setData] = useState<WrongProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database?type=wrong-progress');
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
      console.error('Wrong progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getPriorityBadge = (priority: string): JSX.Element => {
    const configs = {
      P0: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: '🔴 Kritik' },
      P1: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle, label: '🟠 Önemli' },
      P2: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: '🟡 İyileştir' }
    };

    const config = configs[priority as keyof typeof configs] || configs.P2;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('endpoint')) return <FileCode className="h-4 w-4" />;
    if (category.toLowerCase().includes('mimari')) return <Shield className="h-4 w-4" />;
    return <Code className="h-4 w-4" />;
  };

  const filteredIssues = data?.issues.filter(issue => {
    const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    return matchPriority && matchCategory;
  }) || [];

  const categories = data ? ['all', ...Object.keys(data.categories)] : ['all'];

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
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-6 w-6 text-red-600" />
            <span className="text-3xl font-bold text-red-900">{data.summary.p0}</span>
          </div>
          <div className="text-sm font-medium text-red-900">🔴 Kritik</div>
          <div className="text-xs text-red-700 mt-1">Acil düzeltilmeli</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <span className="text-3xl font-bold text-orange-900">{data.summary.p1}</span>
          </div>
          <div className="text-sm font-medium text-orange-900">🟠 Önemli</div>
          <div className="text-xs text-orange-700 mt-1">Yakında düzeltilmeli</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-900">{data.summary.p2}</span>
          </div>
          <div className="text-sm font-medium text-yellow-900">🟡 İyileştir</div>
          <div className="text-xs text-yellow-700 mt-1">İyileştirme önerisi</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-3xl font-bold text-green-900">{data.summary.clean}</span>
          </div>
          <div className="text-sm font-medium text-green-900">✅ Temiz</div>
          <div className="text-xs text-green-700 mt-1">Sorun yok</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-3xl font-bold text-blue-900">{data.summary.score}%</span>
          </div>
          <div className="text-sm font-medium text-blue-900">Skor</div>
          <div className="text-xs text-blue-700 mt-1">Mimari kalite</div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori İstatistikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.categories).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </div>
              <span className="text-lg font-bold text-gray-700">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
        <Filter className="h-5 w-5 text-gray-600" />
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Kritiklik:</span>
          {(['all', 'P0', 'P1', 'P2'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                priorityFilter === priority
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {priority === 'all' ? 'Tümü' : priority}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Kategori:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Tümü' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Sorun Detayları</h3>
          <p className="text-sm text-gray-600">Plan dışı değişiklikler ve mimari ihlaller</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kritiklik</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dosya/Endpoint</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sorun</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Öneri</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {getPriorityBadge(issue.priority)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(issue.category)}
                      <span className="text-sm text-gray-900">{issue.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {issue.file}
                    </code>
                    {issue.line && (
                      <div className="text-xs text-gray-500 mt-1">Line {issue.line}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">{issue.issue}</td>
                  <td className="px-4 py-3 text-sm text-blue-700 max-w-xs">{issue.suggestion}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      issue.action === 'REFACTOR' ? 'bg-purple-100 text-purple-800' :
                      issue.action === 'FIX' ? 'bg-red-100 text-red-800' :
                      issue.action === 'DEPRECATE' ? 'bg-orange-100 text-orange-800' :
                      issue.action === 'IMPROVE' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredIssues.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-semibold text-green-700">Harika! Hiç sorun yok! 🎉</p>
            <p className="text-sm mt-1">Seçilen filtreye uygun sorun bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Action Suggestions */}
      {data.summary.p0 > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-red-900 mb-2">⚠️ Acil Dikkat Gerekiyor!</h4>
              <p className="text-sm text-red-800 mb-3">
                {data.summary.p0} adet kritik (P0) sorun tespit edildi. Bu sorunlar:
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Sistemin temel mimarisini bozuyor</li>
                <li>Gelecekteki genişlemeleri zorlaştırıyor</li>
                <li>Teknik borç oluşturuyor</li>
              </ul>
              <div className="mt-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  🔨 Hemen Düzelt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Son güncelleme: {new Date(data.timestamp).toLocaleString('tr-TR')}
      </div>
    </div>
  );
}

