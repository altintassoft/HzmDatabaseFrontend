import { useState, useEffect } from 'react';
import { Zap, RefreshCw, Search, Filter, Copy } from 'lucide-react';
import api from '../../../../services/api';

interface Endpoint {
  module: string;
  method: string;
  path: string;
  authType: string;
  status: 'active' | 'disabled';
  strategyCompliant: boolean;
  namingCompliant: boolean;
  authCompliant: boolean;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
}

interface EndpointData {
  summary: {
    total: number;
    byModule: Record<string, number>;
    byMethod: Record<string, number>;
    byAuth: Record<string, number>;
    activeCount: number;
  };
  endpoints: Endpoint[];
}

export default function ApiEndpointsTab() {
  const [data, setData] = useState<EndpointData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = forceRefresh 
        ? '/admin/database?type=api-endpoints&force=true'
        : '/admin/database?type=api-endpoints';
      
      const response = await api.get(url);
      
      console.log('📊 API Endpoints Response:', response);
      console.log('💾 Cached:', response?.cached);
      
      if (response && response.endpoints) {
        setData(response);
      } else {
        setError('Endpoint listesi alınamadı');
      }
    } catch (err: any) {
      console.error('Failed to fetch endpoints:', err);
      setError(err.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'GET': 'bg-blue-100 text-blue-700',
      'POST': 'bg-green-100 text-green-700',
      'PUT': 'bg-yellow-100 text-yellow-700',
      'DELETE': 'bg-red-100 text-red-700',
      'PATCH': 'bg-purple-100 text-purple-700'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getAuthBadge = (authType: string) => {
    if (authType.includes('Master Admin')) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (authType.includes('Admin')) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (authType.includes('JWT')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (authType.includes('API Key')) return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-600 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={32} className="animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600 font-medium">API endpoints taranıyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-2">❌ {error}</p>
        <button
          onClick={fetchEndpoints}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) return null;

  const filteredEndpoints = data.endpoints.filter(endpoint => {
    const matchesModule = filterModule === 'all' || endpoint.module === filterModule;
    const matchesMethod = filterMethod === 'all' || endpoint.method === filterMethod;
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">📡 API Endpoints</h2>
              <p className="text-blue-100 mt-1">
                Backend API Dokümantasyonu ({data.summary.total} Endpoint)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!data) return;
                
                // Generate table text
                let tableText = 'API ENDPOINTS RAPORU\n';
                tableText += '='.repeat(120) + '\n\n';
                tableText += `Toplam: ${data.summary.total} endpoint\n`;
                tableText += `Modül: ${Object.keys(data.summary.byModule).length}\n`;
                tableText += `Aktif: ${data.summary.activeCount}\n\n`;
                tableText += '='.repeat(120) + '\n\n';
                
                // Table header
                tableText += 'Modül'.padEnd(12) + '│ ';
                tableText += 'Method'.padEnd(8) + '│ ';
                tableText += 'Endpoint'.padEnd(45) + '│ ';
                tableText += 'Auth'.padEnd(18) + '│ ';
                tableText += 'Strategy │ Naming │ Skor │ Durum\n';
                tableText += '─'.repeat(120) + '\n';
                
                // Table rows
                filteredEndpoints.forEach(endpoint => {
                  tableText += endpoint.module.padEnd(12) + '│ ';
                  tableText += endpoint.method.padEnd(8) + '│ ';
                  tableText += endpoint.path.padEnd(45) + '│ ';
                  tableText += endpoint.authType.padEnd(18) + '│ ';
                  tableText += (endpoint.strategyCompliant ? '   ✅    ' : '   ❌    ') + '│ ';
                  tableText += (endpoint.namingCompliant ? '   ✅   ' : '   ❌   ') + '│ ';
                  tableText += (endpoint.complianceScore + '%').padEnd(6) + '│ ';
                  tableText += endpoint.status === 'active' ? '✅ Aktif' : '⏸️ Pasif';
                  tableText += '\n';
                });
                
                tableText += '\n' + '='.repeat(120) + '\n\n';
                
                // Module distribution
                tableText += 'MODÜL DAĞILIMI:\n\n';
                Object.entries(data.summary.byModule).forEach(([module, count]) => {
                  tableText += `${module.padEnd(15)}: ${count} endpoint\n`;
                });
                
                // Copy to clipboard
                navigator.clipboard.writeText(tableText).then(() => {
                  alert('✅ API Endpoints raporu kopyalandı!');
                }).catch(err => {
                  console.error('Kopyalama hatası:', err);
                  alert('❌ Kopyalama başarısız!');
                });
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy size={18} />
              <span>Raporu Kopyala</span>
            </button>
            <button
              onClick={() => fetchEndpoints(false)}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
              title="Cache'den yükle (hızlı)"
            >
              <RefreshCw size={18} />
              <span>Yenile</span>
            </button>
            <button
              onClick={() => fetchEndpoints(true)}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-white"
              title="GitHub'dan yeniden tara (yavaş)"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>GitHub'dan Tara</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Toplam Endpoint</span>
            <Zap size={20} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.summary.total}</div>
          <div className="text-xs text-gray-500 mt-1">{data.summary.activeCount} aktif</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Modül Sayısı</div>
          <div className="text-3xl font-bold text-gray-900">{Object.keys(data.summary.byModule).length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">HTTP Method</div>
          <div className="text-3xl font-bold text-gray-900">{Object.keys(data.summary.byMethod).length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Auth Tipi</div>
          <div className="text-3xl font-bold text-gray-900">{Object.keys(data.summary.byAuth).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-2" />
              Arama
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Endpoint veya modül ara..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-2" />
              Modül
            </label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tümü</option>
              {Object.keys(data.summary.byModule).map(mod => (
                <option key={mod} value={mod}>{mod} ({data.summary.byModule[mod]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tümü</option>
              {Object.keys(data.summary.byMethod).map(method => (
                <option key={method} value={method}>{method} ({data.summary.byMethod[method]})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Modül</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Endpoint</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Auth</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Strategy</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Naming</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Skor</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEndpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-indigo-600">
                      {endpoint.module}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodBadge(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getAuthBadge(endpoint.authType)}`}>
                      {endpoint.authType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {endpoint.strategyCompliant ? (
                      <span className="text-green-600 text-lg">✅</span>
                    ) : (
                      <span className="text-red-600 text-lg">❌</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {endpoint.namingCompliant ? (
                      <span className="text-green-600 text-lg">✅</span>
                    ) : (
                      <span className="text-red-600 text-lg">❌</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.complianceScore === 100 ? 'bg-green-100 text-green-700' :
                      endpoint.complianceScore >= 75 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.complianceScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {endpoint.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✅ Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        ⏸️ Pasif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Filtre ile eşleşen endpoint bulunamadı
          </div>
        )}
      </div>

      {/* Module Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Modül Dağılımı</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.summary.byModule).map(([module, count]) => (
            <div key={module} className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="text-sm text-indigo-700 font-medium">{module}</div>
              <div className="text-2xl font-bold text-indigo-900">{count}</div>
              <div className="text-xs text-indigo-600">endpoint</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

