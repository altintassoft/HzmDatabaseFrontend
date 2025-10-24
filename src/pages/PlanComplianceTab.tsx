import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface PlanComplianceData {
  summary: {
    totalExpected: number;
    totalActual: number;
    totalMatched: number;
    totalMissing: number;
    extraCount: number;
    successRate: number;
  };
  categories: {
    [key: string]: {
      expected: Array<{ method: string; path: string; description: string }>;
      matched: Array<{ method: string; path: string; description: string; actualPath: string; file: string }>;
      missing: Array<{ method: string; path: string; description: string }>;
      status: 'complete' | 'partial' | 'missing';
    };
  };
  extraEndpoints: Array<{ method: string; path: string; file: string }>;
}

export const PlanComplianceTab: React.FC = () => {
  const [data, setData] = useState<PlanComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database?type=plan-compliance');
      console.log('📊 Plan Compliance Data:', response.data);
      setData(response.data);
    } catch (err: any) {
      console.error('❌ Plan Compliance Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch plan compliance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ Hata: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">⚠️ Veri bulunamadı</p>
      </div>
    );
  }

  const categoryNames: { [key: string]: string } = {
    authentication: 'Authentication',
    generic_data: 'Generic Data (EN ÖNEMLİ!)',
    admin: 'Admin',
    settings: 'Settings',
    compute: 'Compute',
    health: 'Health'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'missing':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'missing':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">📊 Plan vs Backend Karşılaştırması</h2>
        <p className="text-blue-100">SMART_ENDPOINT_STRATEGY_V2 ile Backend Uyum Raporu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalExpected}</div>
          <div className="text-sm text-gray-600">Plan'da Olması Gereken</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalActual}</div>
          <div className="text-sm text-gray-600">Backend'de Var</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-700">{data.summary.totalMatched}</div>
          <div className="text-sm text-green-600">✅ Uyumlu</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-700">{data.summary.totalMissing}</div>
          <div className="text-sm text-red-600">🔴 EKSİK</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-700">{data.summary.extraCount}</div>
          <div className="text-sm text-yellow-600">⚠️ FAZLADAN</div>
        </div>

        <div className={`rounded-lg p-4 shadow-sm ${
          data.summary.successRate >= 80 ? 'bg-green-50 border border-green-200' :
          data.summary.successRate >= 50 ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className={`text-2xl font-bold ${
            data.summary.successRate >= 80 ? 'text-green-700' :
            data.summary.successRate >= 50 ? 'text-yellow-700' :
            'text-red-700'
          }`}>{data.summary.successRate}%</div>
          <div className={`text-sm ${
            data.summary.successRate >= 80 ? 'text-green-600' :
            data.summary.successRate >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>Başarı Oranı</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          {Object.entries(data.categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryNames[key] || key} ({category.matched.length}/{category.expected.length})
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {Object.entries(data.categories)
        .filter(([key]) => selectedCategory === 'all' || selectedCategory === key)
        .map(([categoryKey, category]) => (
          <div key={categoryKey} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Category Header */}
            <div className={`px-6 py-4 border-b border-gray-200 ${getStatusColor(category.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {getStatusIcon(category.status)} {categoryNames[categoryKey] || categoryKey}
                  </h3>
                  <p className="text-sm mt-1">
                    {category.matched.length} / {category.expected.length} endpoint uyumlu
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {Math.round((category.matched.length / category.expected.length) * 100)}%
                  </div>
                  <div className="text-xs">Uyum</div>
                </div>
              </div>
            </div>

            {/* Matched Endpoints */}
            {category.matched.length > 0 && (
              <div className="px-6 py-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-2">✅ UYUMLU ({category.matched.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800 uppercase">Method</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800 uppercase">Plan'daki Path</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800 uppercase">Backend'deki Path</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800 uppercase">Dosya</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800 uppercase">Açıklama</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {category.matched.map((endpoint, idx) => (
                        <tr key={idx} className="hover:bg-green-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">{endpoint.path}</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">{endpoint.actualPath}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{endpoint.file}.js</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{endpoint.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Missing Endpoints */}
            {category.missing.length > 0 && (
              <div className="px-6 py-4 bg-red-50">
                <h4 className="font-semibold text-red-800 mb-2">🔴 EKSİK ({category.missing.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-red-200">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Method</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Path</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Açıklama</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-100">
                      {category.missing.map((endpoint, idx) => (
                        <tr key={idx} className="hover:bg-red-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-900 rounded">
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">{endpoint.path}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{endpoint.description}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                              IMPLEMENT REQUIRED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

      {/* Extra Endpoints */}
      {data.extraEndpoints.length > 0 && (
        <div className="bg-white border border-yellow-300 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-yellow-100 border-b border-yellow-300">
            <h3 className="text-lg font-bold text-yellow-800">
              ⚠️ FAZLADAN OLANLAR (Backend'de var ama plan'da yok)
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {data.extraEndpoints.length} endpoint (plan dışı ama mantıklı olabilir)
            </p>
          </div>
          <div className="px-6 py-4 bg-yellow-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-200">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="px-3 py-2 text-left text-xs font-medium text-yellow-800 uppercase">Method</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-yellow-800 uppercase">Path</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-yellow-800 uppercase">Dosya</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-yellow-100">
                  {data.extraEndpoints.map((endpoint, idx) => (
                    <tr key={idx} className="hover:bg-yellow-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm font-mono text-gray-900">{endpoint.path}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{endpoint.file}.js</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

