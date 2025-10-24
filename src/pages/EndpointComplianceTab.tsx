import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Filter, Search, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface EndpointData {
  endpoint: string;
  method: string;
  expectedAuth: string;
  currentAuth: string;
  authMatch: boolean;
  expectedType: string;
  currentType: string;
  typeMatch: boolean;
  status: 'compliant' | 'partial' | 'missing' | 'noncompliant' | 'unknown';
  file: string;
}

interface ComplianceStats {
  total: number;
  compliant: number;
  partial: number;
  missing: number;
  noncompliant: number;
  byAuth: {
    jwt: number;
    apiKey: number;
  };
  byType: {
    smart: number;
    individual: number;
  };
}

interface ComplianceData {
  endpoints: EndpointData[];
  stats: ComplianceStats;
  successRate: number;
  timestamp: string;
}

export default function EndpointComplianceTab() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database?type=endpoint-compliance');
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
      console.error('Endpoint compliance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Hata</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Veri bulunamadı</div>;
  }

  // Filter endpoints
  const filteredEndpoints = data.endpoints.filter(endpoint => {
    // Status filter
    if (filter !== 'all' && endpoint.status !== filter) return false;
    
    // Search filter
    if (searchTerm && !endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Uyumlu
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Kısmi
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Eksik
          </span>
        );
      case 'noncompliant':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Uyumsuz
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Belirsiz
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Endpoint Compliance Report</h2>
            <p className="text-gray-600 mt-1">Akıllı API Stratejisi: Auth + Mimari Kontrol</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{data.successRate}%</div>
            <div className="text-sm text-gray-500">Başarı Oranı</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">Toplam Endpoint</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.stats.compliant}</div>
            <div className="text-xs text-green-700 mt-1">✅ Uyumlu</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.stats.partial}</div>
            <div className="text-xs text-yellow-700 mt-1">🟡 Kısmi</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{data.stats.missing}</div>
            <div className="text-xs text-gray-700 mt-1">⚪ Eksik</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.stats.noncompliant}</div>
            <div className="text-xs text-red-700 mt-1">🔴 Uyumsuz</div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 mb-2">🔐 Auth Kategorisi</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">JWT Token:</span>
                <span className="font-semibold text-blue-900">{data.stats.byAuth.jwt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">API Key:</span>
                <span className="font-semibold text-blue-900">{data.stats.byAuth.apiKey}</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-purple-900 mb-2">🎯 Mimari Tipi</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Akıllı (Generic):</span>
                <span className="font-semibold text-purple-900">{data.stats.byType.smart}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Bireysel:</span>
                <span className="font-semibold text-purple-900">{data.stats.byType.individual}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Endpoint ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({data.stats.total})
            </button>
            <button
              onClick={() => setFilter('compliant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'compliant'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uyumlu ({data.stats.compliant})
            </button>
            <button
              onClick={() => setFilter('partial')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'partial'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kısmi ({data.stats.partial})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'missing'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Eksik ({data.stats.missing})
            </button>
            <button
              onClick={() => setFilter('noncompliant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'noncompliant'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uyumsuz ({data.stats.noncompliant})
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEndpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{endpoint.endpoint}</div>
                    <div className="text-xs text-gray-500">{endpoint.file}.js</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Beklenen:</span>
                        <span className="font-semibold text-gray-900">{endpoint.expectedAuth}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500">Gerçek:</span>
                        <span className={`font-semibold ${endpoint.authMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {endpoint.currentAuth}
                        </span>
                        {endpoint.authMatch ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Beklenen:</span>
                        <span className="font-semibold text-gray-900">{endpoint.expectedType}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500">Gerçek:</span>
                        <span className={`font-semibold ${endpoint.typeMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {endpoint.currentType}
                        </span>
                        {endpoint.typeMatch ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(endpoint.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Filtrelere uygun endpoint bulunamadı</p>
          </div>
        )}
      </div>

      {/* Success Rate Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Başarı Hedefi</h3>
              <p className="text-sm text-gray-600">
                Mevcut: {data.successRate}% → Hedef: 100%
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {data.stats.compliant} / {data.stats.total} endpoint uyumlu
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.stats.total - data.stats.compliant} endpoint düzeltme gerekiyor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

