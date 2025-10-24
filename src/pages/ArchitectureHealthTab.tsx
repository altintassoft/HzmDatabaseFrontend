import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Globe,
  Shield,
  Layers,
  Activity,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import api from '../services/api';

interface AuthUsageEndpoint {
  endpoint: string;
  method: string;
  current_auth: string;
  expected_auth: string;
  status: 'correct' | 'wrong' | 'missing';
}

interface ApiKeyFeature {
  feature: string;
  status: 'implemented' | 'warning' | 'missing';
  table: string;
  column: string;
  notes: string;
}

interface PriorityAction {
  priority: string;
  title: string;
  description: string;
  phase: string;
  status: string;
  impact: string;
}

interface ArchitectureReport {
  overall_score: number;
  category_scores: {
    database_schema: number;
    migration_consistency: number;
    endpoint_architecture: number;
    security_implementation: number;
    rls_multi_tenancy: number;
    best_practices: number;
  };
  authentication_usage: {
    endpoints: AuthUsageEndpoint[];
    stats: {
      total: number;
      correct: number;
      wrong: number;
      missing: number;
    };
  };
  api_key_implementation: ApiKeyFeature[];
  priority_actions: PriorityAction[];
}

const ArchitectureHealthTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ArchitectureReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Filters
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [apiKeyFilter, setApiKeyFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchArchitectureReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/database?type=architecture-compliance');
      setReportData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Architecture report fetch error:', err);
      setError(err.message || 'Rapor yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitectureReport();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
      case 'implemented':
      case 'done':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'warning':
      case 'pending':
        return <AlertTriangle className="text-yellow-600" size={18} />;
      case 'wrong':
      case 'missing':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <AlertCircle className="text-gray-400" size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case 'correct':
      case 'implemented':
      case 'done':
        return `${baseClass} bg-green-100 text-green-700`;
      case 'warning':
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-700`;
      case 'wrong':
      case 'missing':
        return `${baseClass} bg-red-100 text-red-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClass = "px-2 py-1 rounded text-xs font-bold";
    switch (priority.toLowerCase()) {
      case 'p0':
        return `${baseClass} bg-red-600 text-white`;
      case 'p1':
        return `${baseClass} bg-orange-600 text-white`;
      case 'p2':
        return `${baseClass} bg-yellow-600 text-white`;
      case 'p3':
        return `${baseClass} bg-blue-600 text-white`;
      default:
        return `${baseClass} bg-gray-600 text-white`;
    }
  };

  // Filter data
  const filteredAuthEndpoints = reportData?.authentication_usage.endpoints.filter(ep => {
    if (authFilter !== 'all' && ep.status !== authFilter) return false;
    if (searchTerm && !ep.endpoint.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const filteredApiKeyFeatures = reportData?.api_key_implementation.filter(feat => {
    if (apiKeyFilter !== 'all' && feat.status !== apiKeyFilter) return false;
    if (searchTerm && !feat.feature.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const filteredActions = reportData?.priority_actions.filter(action => {
    if (actionFilter !== 'all' && action.priority.toLowerCase() !== actionFilter) return false;
    if (searchTerm && !action.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <span className="ml-3 text-lg text-gray-600">Mimari analiz yapılıyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="text-red-600" size={24} />
          <span className="ml-3 text-red-800 font-medium">Hata: {error}</span>
        </div>
        <button
          onClick={fetchArchitectureReport}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <span className="text-gray-600">Rapor verisi bulunamadı</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Compact Score Cards */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mimari Sağlık Raporu</h2>
            <p className="text-sm text-gray-500">
              Backend mimari uyumluluğu ve sağlık kontrolü
              {lastUpdated && ` • Son güncelleme: ${lastUpdated.toLocaleTimeString('tr-TR')}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(reportData.overall_score)}`}>
                {Math.round(reportData.overall_score)}/100
              </div>
              <div className="text-xs text-gray-500 mt-1">GENEL SKOR</div>
            </div>
            <button
              onClick={fetchArchitectureReport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Yenile
            </button>
          </div>
        </div>

        {/* Compact Category Scores */}
        <div className="grid grid-cols-6 gap-3">
          <div className={`${getScoreBgColor(reportData.category_scores.database_schema)} border rounded-lg p-3 text-center`}>
            <Database size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.database_schema)}`}>
              {reportData.category_scores.database_schema}
            </div>
            <div className="text-xs text-gray-600 mt-1">Database</div>
          </div>

          <div className={`${getScoreBgColor(reportData.category_scores.migration_consistency)} border rounded-lg p-3 text-center`}>
            <Activity size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.migration_consistency)}`}>
              {Math.round(reportData.category_scores.migration_consistency)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Migration</div>
          </div>

          <div className={`${getScoreBgColor(reportData.category_scores.endpoint_architecture)} border rounded-lg p-3 text-center`}>
            <Globe size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.endpoint_architecture)}`}>
              {reportData.category_scores.endpoint_architecture}
            </div>
            <div className="text-xs text-gray-600 mt-1">Endpoint</div>
          </div>

          <div className={`${getScoreBgColor(reportData.category_scores.security_implementation)} border rounded-lg p-3 text-center`}>
            <Shield size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.security_implementation)}`}>
              {reportData.category_scores.security_implementation}
            </div>
            <div className="text-xs text-gray-600 mt-1">Security</div>
          </div>

          <div className={`${getScoreBgColor(reportData.category_scores.rls_multi_tenancy)} border rounded-lg p-3 text-center`}>
            <Layers size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.rls_multi_tenancy)}`}>
              {reportData.category_scores.rls_multi_tenancy}
            </div>
            <div className="text-xs text-gray-600 mt-1">RLS</div>
          </div>

          <div className={`${getScoreBgColor(reportData.category_scores.best_practices)} border rounded-lg p-3 text-center`}>
            <TrendingUp size={20} className="mx-auto mb-1 text-gray-700" />
            <div className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.best_practices)}`}>
              {reportData.category_scores.best_practices}
            </div>
            <div className="text-xs text-gray-600 mt-1">Best Practice</div>
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Endpoint, özellik veya aksiyon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table 1: Authentication Usage Report */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Shield size={20} className="mr-2 text-blue-600" />
              🔐 Authentication Kullanım Raporu
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Endpoint'lerin JWT vs API Key kullanımı • {reportData.authentication_usage.stats.correct}/{reportData.authentication_usage.stats.total} doğru ({Math.round((reportData.authentication_usage.stats.correct / reportData.authentication_usage.stats.total) * 100)}%)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Tümü ({reportData.authentication_usage.endpoints.length})</option>
              <option value="correct">✅ Doğru ({reportData.authentication_usage.stats.correct})</option>
              <option value="wrong">⚠️ Yanlış ({reportData.authentication_usage.stats.wrong})</option>
              <option value="missing">❌ Eksik ({reportData.authentication_usage.stats.missing})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ENDPOINT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">METHOD</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ŞU AN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OLMALI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAuthEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || authFilter !== 'all' ? 'Filtre ile eşleşen sonuç yok' : 'Endpoint bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredAuthEndpoints.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{ep.endpoint}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                        {ep.current_auth === 'none' ? '❌ None' : ep.current_auth === 'jwt' ? '🎫 JWT' : '🔑 API Key'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                        {ep.expected_auth === 'jwt' ? '🎫 JWT' : '🔑 API Key'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ep.status)}
                        <span className={getStatusBadge(ep.status)}>
                          {ep.status === 'correct' ? 'DOĞRU' : ep.status === 'wrong' ? 'YANLTI' : 'EKSİK'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: API Key Implementation Report */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Layers size={20} className="mr-2 text-green-600" />
              🔑 API Key Implementasyon Raporu
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              API Key özellikleri ve durumları • {reportData.api_key_implementation.filter(f => f.status === 'implemented').length}/{reportData.api_key_implementation.length} tamamlandı ({Math.round((reportData.api_key_implementation.filter(f => f.status === 'implemented').length / reportData.api_key_implementation.length) * 100)}%)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={apiKeyFilter}
              onChange={(e) => setApiKeyFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Tümü ({reportData.api_key_implementation.length})</option>
              <option value="implemented">✅ Tamamlandı ({reportData.api_key_implementation.filter(f => f.status === 'implemented').length})</option>
              <option value="warning">⚠️ Uyarı ({reportData.api_key_implementation.filter(f => f.status === 'warning').length})</option>
              <option value="missing">❌ Eksik ({reportData.api_key_implementation.filter(f => f.status === 'missing').length})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ÖZELLİK</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DURUM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TABLO/KOLON</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NOTLAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApiKeyFeatures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || apiKeyFilter !== 'all' ? 'Filtre ile eşleşen sonuç yok' : 'Özellik bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredApiKeyFeatures.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{feat.feature}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(feat.status)}
                        <span className={getStatusBadge(feat.status)}>
                          {feat.status === 'implemented' ? 'TAMAMLANDI' : feat.status === 'warning' ? 'UYARI' : 'EKSİK'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {feat.table === '-' ? '-' : `${feat.table}.${feat.column}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{feat.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: Priority Actions */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <AlertTriangle size={20} className="mr-2 text-orange-600" />
              🎯 Öncelikli Aksiyonlar
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Yapılması gereken işlemler • {reportData.priority_actions.filter(a => a.status === 'pending').length} beklemede, {reportData.priority_actions.filter(a => a.status === 'done').length} tamamlandı
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Tümü ({reportData.priority_actions.length})</option>
              <option value="p0">🔴 P0 ({reportData.priority_actions.filter(a => a.priority === 'p0').length})</option>
              <option value="p1">🟠 P1 ({reportData.priority_actions.filter(a => a.priority === 'p1').length})</option>
              <option value="p2">🟡 P2 ({reportData.priority_actions.filter(a => a.priority === 'p2').length})</option>
              <option value="p3">🔵 P3 ({reportData.priority_actions.filter(a => a.priority === 'p3').length})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ÖNCELİK</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">BAŞLIK</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">AÇIKLAMA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PHASE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DURUM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ETKİ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || actionFilter !== 'all' ? 'Filtre ile eşleşen sonuç yok' : 'Aksiyon bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredActions.map((action, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={getPriorityBadge(action.priority)}>
                        {action.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{action.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md">{action.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {action.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(action.status)}
                        <span className={getStatusBadge(action.status)}>
                          {action.status === 'done' ? 'TAMAM' : 'BEKLİYOR'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{action.impact}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureHealthTab;
