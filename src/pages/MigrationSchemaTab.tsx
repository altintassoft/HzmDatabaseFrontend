import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw,
  FileText,
  GitCompare,
  Clock
} from 'lucide-react';
import api from '../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface MigrationFile {
  filename: string;
  description: string;
  status: 'success' | 'warning' | 'error';
  executed_at: string;
  errors?: string[];
  warnings?: string[];
  tableComparison?: {
    matching: number;
    missing: number;
    extra: number;
  };
  columnComparison?: {
    matching: number;
    missing: number;
    extra: number;
  };
}

interface MigrationReport {
  summary: {
    totalMigrations: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  };
  migrations: MigrationFile[];
  timestamp: string;
}

interface TableComparison {
  schema: string;
  table: string;
  expectedColumns: number;
  actualColumns: number;
  status: 'matching' | 'missing' | 'extra' | 'mismatch';
  missingColumns: string[];
  extraColumns: string[];
  details: string;
}

interface ComparisonReport {
  summary: {
    totalExpected: number;
    totalActual: number;
    matching: number;
    missing: number;
    extra: number;
  };
  tables: TableComparison[];
  timestamp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MigrationSchemaTab() {
  const [activeSubTab, setActiveSubTab] = useState<'migration' | 'comparison'>('migration');
  const [migrationData, setMigrationData] = useState<MigrationReport | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [migrationResponse, comparisonResponse] = await Promise.all([
        api.get('/admin/database?type=migration-report'),
        api.get('/admin/database?type=table-comparison')
      ]);

      setMigrationData(migrationResponse);
      setComparisonData(comparisonResponse);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
      console.error('Migration/Schema fetch error:', err);
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

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getStatusBadge = (status: string): JSX.Element => {
    const configs = {
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Başarılı' },
      matching: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Uyumlu' },
      
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle, label: 'Uyarı' },
      mismatch: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: 'Uyumsuz' },
      
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Hata' },
      missing: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Eksik' },
      
      extra: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle, label: 'Fazla' },
    };

    const config = configs[status as keyof typeof configs] || configs.warning;
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
          <h2 className="text-2xl font-bold text-gray-900">Migration & Schema Raporu</h2>
          <p className="text-sm text-gray-600 mt-1">
            Database Migration Durumu & Schema Karşılaştırma
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
        {/* Migration Summary */}
        {migrationData && (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">{migrationData.summary.totalMigrations}</span>
              </div>
              <div className="text-sm font-medium text-blue-900">Toplam Migration</div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-900">{migrationData.summary.successCount}</span>
              </div>
              <div className="text-sm font-medium text-green-900">Başarılı</div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">{migrationData.summary.warningCount}</span>
              </div>
              <div className="text-sm font-medium text-yellow-900">Uyarı</div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-2xl font-bold text-red-900">{migrationData.summary.errorCount}</span>
              </div>
              <div className="text-sm font-medium text-red-900">Hata</div>
            </div>
          </>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveSubTab('migration')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'migration'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Migration Durumu
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'comparison'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <GitCompare className="h-4 w-4" />
            Schema Karşılaştırma
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* MIGRATION TAB */}
        {activeSubTab === 'migration' && migrationData && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Migration Detayları</h3>
              <p className="text-sm text-gray-600">Her migration'ın backend ile uyumunu kontrol edin</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Migration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Executed At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {migrationData.migrations.map((migration, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono text-gray-900">{migration.filename}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{migration.description || 'No description'}</td>
                      <td className="px-4 py-3">{getStatusBadge(migration.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {new Date(migration.executed_at).toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {migration.errors && migration.errors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {migration.errors.map((err, i) => (
                              <div key={i}>• {err}</div>
                            ))}
                          </div>
                        )}
                        {migration.warnings && migration.warnings.length > 0 && (
                          <div className="text-xs text-yellow-600">
                            {migration.warnings.map((warn, i) => (
                              <div key={i}>• {warn}</div>
                            ))}
                          </div>
                        )}
                        {migration.tableComparison && (
                          <div className="text-xs text-gray-600">
                            Tables: {migration.tableComparison.matching} ✅ 
                            {migration.tableComparison.missing > 0 && ` | ${migration.tableComparison.missing} missing`}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPARISON TAB */}
        {activeSubTab === 'comparison' && comparisonData?.summary && (
          <div className="space-y-4">
            {/* Comparison Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">{comparisonData.summary.totalExpected ?? 0}</div>
                <div className="text-sm text-blue-700">Beklenen Tablo</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">{comparisonData.summary.totalActual ?? 0}</div>
                <div className="text-sm text-purple-700">Gerçek Tablo</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">{comparisonData.summary.matching ?? 0}</div>
                <div className="text-sm text-green-700">Uyumlu</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-900">{comparisonData.summary.missing ?? 0}</div>
                <div className="text-sm text-red-700">Eksik</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">{comparisonData.summary.extra ?? 0}</div>
                <div className="text-sm text-yellow-700">Fazla</div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Tablo Karşılaştırma Detayları</h3>
                <p className="text-sm text-gray-600">Migration dosyalarındaki tablolar ile backend'deki gerçek tabloları karşılaştırın</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Schema</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Table</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Columns</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisonData.tables?.map((table, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-700">
                            {table.schema}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-900">{table.table}</td>
                        <td className="px-4 py-3">{getStatusBadge(table.status)}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className={table.expectedColumns === table.actualColumns ? 'text-green-700' : 'text-red-700'}>
                              Expected: {table.expectedColumns}
                            </div>
                            <div className={table.expectedColumns === table.actualColumns ? 'text-green-700' : 'text-red-700'}>
                              Actual: {table.actualColumns}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-1">
                            {table.missingColumns && table.missingColumns.length > 0 && (
                              <div className="text-red-600">
                                <strong>Missing:</strong> {table.missingColumns.join(', ')}
                              </div>
                            )}
                            {table.extraColumns && table.extraColumns.length > 0 && (
                              <div className="text-yellow-600">
                                <strong>Extra:</strong> {table.extraColumns.join(', ')}
                              </div>
                            )}
                            {table.details && (
                              <div className="text-gray-600">{table.details}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Son güncelleme: {new Date().toLocaleString('tr-TR')}
      </div>
    </div>
  );
}

