import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Globe,
  Shield,
  Layers,
  Activity
} from 'lucide-react';
import api from '../services/api';

interface CategoryScore {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  details?: {
    [key: string]: {
      percentage: number;
      label: string;
    };
  };
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
  database_analysis: {
    tables: { expected: number; actual: number; missing: number };
    columns: { mismatches: any[] };
    seed_data: { missing: any[] };
  };
  endpoint_analysis: {
    total: number;
    target: number;
    extra: any[];
    missing: any[];
  };
  api_key_architecture: {
    format_compliance: number;
    features: {
      [key: string]: boolean;
    };
  };
  security_checklist: {
    [key: string]: boolean;
  };
  action_plan: {
    p0_critical: any[];
    p1_high: any[];
    p2_medium: any[];
  };
}

const ArchitectureHealthTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ArchitectureReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArchitectureReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/database?type=architecture-compliance');
      setReportData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Architecture report fetch error:', err);
      setError(err.response?.data?.message || 'Rapor yüklenirken hata oluştu');
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

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="text-green-600" size={24} />;
    if (score >= 70) return <AlertTriangle className="text-yellow-600" size={24} />;
    return <XCircle className="text-red-600" size={24} />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="text-green-600" size={16} />
    ) : (
      <XCircle className="text-red-600" size={16} />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600">Mimari sağlık raporu yükleniyor...</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="text-red-600 mb-4" size={48} />
        <p className="text-gray-600 mb-4">{error || 'Rapor verisi yüklenemedi'}</p>
        <button
          onClick={fetchArchitectureReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mimari Sağlık Raporu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Backend'in SMART_ENDPOINT_STRATEGY_V2 ve BACKEND_PHASE_PLAN'e uyumluluğu
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Son güncelleme: {lastUpdated.toLocaleString('tr-TR')}
            </p>
          )}
        </div>
        <button
          onClick={fetchArchitectureReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {/* Section 1: Overall Score */}
      <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(reportData.overall_score)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getScoreIcon(reportData.overall_score)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Genel Mimari Skor</h3>
              <p className="text-sm text-gray-600">
                {getScoreLabel(reportData.overall_score)} - Backend {reportData.overall_score >= 85 ? 'mükemmel' : reportData.overall_score >= 70 ? 'iyi' : 'iyileştirme gerekli'}
              </p>
            </div>
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(reportData.overall_score)}`}>
            {reportData.overall_score}/100
          </div>
        </div>
      </div>

      {/* Section 2: Category Scores */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers size={24} className="text-blue-600" />
          Kategori Skorları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Database Schema */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.database_schema)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database size={20} />
                <span className="font-semibold">Database Schema</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.database_schema)}`}>
                {reportData.category_scores.database_schema}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.database_schema >= 85 ? 'bg-green-600' : reportData.category_scores.database_schema >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.database_schema}%` }}
              ></div>
            </div>
          </div>

          {/* Migration Consistency */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.migration_consistency)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity size={20} />
                <span className="font-semibold">Migration Tutarlılığı</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.migration_consistency)}`}>
                {reportData.category_scores.migration_consistency}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.migration_consistency >= 85 ? 'bg-green-600' : reportData.category_scores.migration_consistency >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.migration_consistency}%` }}
              ></div>
            </div>
          </div>

          {/* Endpoint Architecture */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.endpoint_architecture)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe size={20} />
                <span className="font-semibold">Endpoint Mimarisi</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.endpoint_architecture)}`}>
                {reportData.category_scores.endpoint_architecture}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.endpoint_architecture >= 85 ? 'bg-green-600' : reportData.category_scores.endpoint_architecture >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.endpoint_architecture}%` }}
              ></div>
            </div>
          </div>

          {/* Security Implementation */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.security_implementation)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <span className="font-semibold">Güvenlik</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.security_implementation)}`}>
                {reportData.category_scores.security_implementation}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.security_implementation >= 85 ? 'bg-green-600' : reportData.category_scores.security_implementation >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.security_implementation}%` }}
              ></div>
            </div>
          </div>

          {/* RLS & Multi-Tenancy */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.rls_multi_tenancy)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers size={20} />
                <span className="font-semibold">RLS & Multi-Tenancy</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.rls_multi_tenancy)}`}>
                {reportData.category_scores.rls_multi_tenancy}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.rls_multi_tenancy >= 85 ? 'bg-green-600' : reportData.category_scores.rls_multi_tenancy >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.rls_multi_tenancy}%` }}
              ></div>
            </div>
          </div>

          {/* Best Practices */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(reportData.category_scores.best_practices)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-semibold">Best Practices</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(reportData.category_scores.best_practices)}`}>
                {reportData.category_scores.best_practices}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${reportData.category_scores.best_practices >= 85 ? 'bg-green-600' : reportData.category_scores.best_practices >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${reportData.category_scores.best_practices}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Database Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database size={24} className="text-blue-600" />
          Database & Migration Analizi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Beklenen Tablolar</div>
            <div className="text-3xl font-bold text-blue-600">{reportData.database_analysis.tables.expected}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Mevcut Tablolar</div>
            <div className="text-3xl font-bold text-green-600">{reportData.database_analysis.tables.actual}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 mb-1">Eksik Tablolar</div>
            <div className="text-3xl font-bold text-red-600">{reportData.database_analysis.tables.missing}</div>
          </div>
        </div>
        {reportData.database_analysis.tables.missing > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Uyarı</p>
                <p className="text-sm text-gray-600">
                  {reportData.database_analysis.tables.missing} tablo eksik. Migration'ları kontrol edin.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Endpoint Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={24} className="text-blue-600" />
          Endpoint Analizi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Mevcut Endpoint</div>
            <div className="text-3xl font-bold text-gray-900">{reportData.endpoint_analysis.total}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Hedef Endpoint</div>
            <div className="text-3xl font-bold text-green-600">{reportData.endpoint_analysis.target}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 mb-1">Fazla Endpoint</div>
            <div className="text-3xl font-bold text-red-600">
              {reportData.endpoint_analysis.total - reportData.endpoint_analysis.target}
            </div>
          </div>
        </div>
        {reportData.endpoint_analysis.total > reportData.endpoint_analysis.target && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Endpoint Explosion Tespit Edildi!</p>
                <p className="text-sm text-gray-600">
                  {reportData.endpoint_analysis.total - reportData.endpoint_analysis.target} fazla endpoint var. 
                  Generic pattern'e geçilmeli.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Security Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={24} className="text-blue-600" />
          Güvenlik Kontrol Listesi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(reportData.security_checklist).map(([key, value]) => (
            <div
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                value ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {getStatusIcon(value)}
              <span className="text-sm font-medium text-gray-900">
                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: Action Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Önceliklendirilmiş Aksiyon Planı</h3>
        
        {/* P0 - Critical */}
        {reportData.action_plan.p0_critical.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded">P0 - KRİTİK</div>
              <span className="text-sm text-gray-600">Hemen yapılmalı</span>
            </div>
            <div className="space-y-2">
              {reportData.action_plan.p0_critical.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title || item.description}</p>
                      {item.details && (
                        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* P1 - High */}
        {reportData.action_plan.p1_high.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded">P1 - YÜKSEK</div>
              <span className="text-sm text-gray-600">Bu sprint'te yapılmalı</span>
            </div>
            <div className="space-y-2">
              {reportData.action_plan.p1_high.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title || item.description}</p>
                      {item.details && (
                        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* P2 - Medium */}
        {reportData.action_plan.p2_medium.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded">P2 - ORTA</div>
              <span className="text-sm text-gray-600">Sonraki sprint'te yapılmalı</span>
            </div>
            <div className="space-y-2">
              {reportData.action_plan.p2_medium.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title || item.description}</p>
                      {item.details && (
                        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectureHealthTab;

