import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Globe,
  Shield,
  Layers,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import api from '../../../../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

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

interface SecurityFeature {
  feature: string;
  status: 'implemented' | 'warning' | 'missing';
  details: string;
}

interface DatabaseFeature {
  feature: string;
  status: 'active' | 'partial' | 'missing';
  count?: number;
  details: string;
}

interface BestPractice {
  category: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
  recommendation?: string;
}

interface ComplianceData {
  summary: {
    overallScore: number;
    endpointScore: number;
    securityScore: number;
    databaseScore: number;
  };
  endpoints: EndpointData[];
  endpointStats: {
    total: number;
    compliant: number;
    byAuth: { jwt: number; apiKey: number };
    byType: { smart: number; individual: number };
  };
  security: SecurityFeature[];
  database: DatabaseFeature[];
  bestPractices: BestPractice[];
  timestamp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ArchitectureComplianceTab() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'security' | 'database' | 'practices'>('endpoints');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both reports
      const [complianceResponse, healthResponse] = await Promise.all([
        api.get('/admin/database?type=endpoint-compliance'),
        api.get('/admin/database?type=architecture-compliance')
      ]);

      // Merge data
      setData({
        summary: {
          overallScore: healthResponse.overall_score || 0,
          endpointScore: complianceResponse.successRate || 0,
          securityScore: healthResponse.category_scores?.security_implementation || 0,
          databaseScore: healthResponse.category_scores?.database_schema || 0,
        },
        endpoints: complianceResponse.endpoints || [],
        endpointStats: complianceResponse.stats || {
          total: 0,
          compliant: 0,
          byAuth: { jwt: 0, apiKey: 0 },
          byType: { smart: 0, individual: 0 }
        },
        security: healthResponse.security_features || [],
        database: healthResponse.database_features || [],
        bestPractices: healthResponse.best_practices || [],
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
      console.error('Architecture compliance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (!data) return null;

  // ============================================================================
  // FILTER & SEARCH
  // ============================================================================

  const filteredEndpoints = data.endpoints.filter(endpoint => {
    const matchesFilter = filter === 'all' || endpoint.status === filter;
    const matchesSearch = endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.method.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const configs = {
      compliant: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Uyumlu' },
      implemented: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Uygulandı' },
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Aktif' },
      good: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'İyi' },
      
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: 'Kısmi' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle, label: 'Uyarı' },
      
      noncompliant: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Uyumsuz' },
      missing: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Eksik' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle, label: 'Kritik' },
      
      unknown: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Bilinmiyor' },
    };

    const config = configs[status as keyof typeof configs] || configs.unknown;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mimari Uyumluluk Raporu</h2>
          <p className="text-sm text-gray-600 mt-1">
            Endpoint, Security, Database & Best Practices Analizi
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className={`border-2 rounded-lg p-4 ${getScoreColor(data.summary.overallScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6" />
            <span className="text-2xl font-bold">{data.summary.overallScore}%</span>
          </div>
          <div className="text-sm font-medium">Genel Skor</div>
        </div>

        {/* Endpoint Score */}
        <div className={`border-2 rounded-lg p-4 ${getScoreColor(data.summary.endpointScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-6 w-6" />
            <span className="text-2xl font-bold">{data.summary.endpointScore}%</span>
          </div>
          <div className="text-sm font-medium">Endpoint Uyumu</div>
          <div className="text-xs mt-1 opacity-75">
            {data.endpointStats.compliant}/{data.endpointStats.total} uyumlu
          </div>
        </div>

        {/* Security Score */}
        <div className={`border-2 rounded-lg p-4 ${getScoreColor(data.summary.securityScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-6 w-6" />
            <span className="text-2xl font-bold">{data.summary.securityScore}%</span>
          </div>
          <div className="text-sm font-medium">Güvenlik</div>
          <div className="text-xs mt-1 opacity-75">
            {data.security.filter(s => s.status === 'implemented').length}/{data.security.length} feature
          </div>
        </div>

        {/* Database Score */}
        <div className={`border-2 rounded-lg p-4 ${getScoreColor(data.summary.databaseScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <Database className="h-6 w-6" />
            <span className="text-2xl font-bold">{data.summary.databaseScore}%</span>
          </div>
          <div className="text-sm font-medium">Database</div>
          <div className="text-xs mt-1 opacity-75">
            {data.database.filter(d => d.status === 'active').length}/{data.database.length} feature
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'endpoints', label: 'Endpoint Analizi', icon: Globe },
            { id: 'security', label: 'Security Features', icon: Shield },
            { id: 'database', label: 'Database Features', icon: Database },
            { id: 'practices', label: 'Best Practices', icon: Layers },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* ENDPOINTS TAB */}
        {activeTab === 'endpoints' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">{data.endpointStats.total}</div>
                <div className="text-sm text-blue-700">Toplam Endpoint</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">{data.endpointStats.compliant}</div>
                <div className="text-sm text-green-700">Uyumlu</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">{data.endpointStats.byAuth.apiKey}</div>
                <div className="text-sm text-purple-700">API Key Auth</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-900">{data.endpointStats.byType.smart}</div>
                <div className="text-sm text-indigo-700">Smart/Generic</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Endpoint ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'compliant', 'partial', 'noncompliant'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Tümü' : f === 'compliant' ? 'Uyumlu' : f === 'partial' ? 'Kısmi' : 'Uyumsuz'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Endpoint</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Auth</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEndpoints.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          Sonuç bulunamadı
                        </td>
                      </tr>
                    ) : (
                      filteredEndpoints.map((endpoint, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-semibold ${
                              endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                              endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                              endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-900">{endpoint.endpoint}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className={endpoint.authMatch ? 'text-green-700' : 'text-red-700'}>
                                {endpoint.currentAuth}
                              </div>
                              {!endpoint.authMatch && (
                                <div className="text-xs text-gray-500">Expected: {endpoint.expectedAuth}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className={endpoint.typeMatch ? 'text-green-700' : 'text-red-700'}>
                                {endpoint.currentType}
                              </div>
                              {!endpoint.typeMatch && (
                                <div className="text-xs text-gray-500">Expected: {endpoint.expectedType}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(endpoint.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Feature</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.security.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.feature}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === 'database' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Feature</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Count</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.database.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.feature}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.count || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BEST PRACTICES TAB */}
        {activeTab === 'practices' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.bestPractices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.category}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.recommendation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

