import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Database } from 'lucide-react';

interface MigrationReport {
  filename: string;
  description: string;
  executed: boolean;
  executed_at: string | null;
  status: 'success' | 'warning' | 'error';
  tables: Array<{
    table: string;
    status: string;
    expectedColumns: number;
    actualColumns: number;
  }>;
  columns: Array<{
    table: string;
    column: string;
    found: boolean;
  }>;
  inserts: Array<{
    table: string;
    columns: string[];
    values: string[];
    found: boolean;
    status: string;
  }>;
}

interface TableComparison {
  status: string;
  message: string;
  table: string;
  expectedColumns: number;
  actualColumns: number;
  columnComparison: {
    missing: Array<{ name: string; type: string; source: string }>;
    extra: Array<{ name: string; type: string; source: string }>;
    typeMismatch: Array<{ name: string; expectedType: string; actualType: string }>;
    matching: Array<{ name: string; type: string }>;
    totalExpected: number;
    totalActual: number;
  };
}

interface ReportData {
  summary: {
    totalMigrations: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  };
  migrations: MigrationReport[];
  tables: Record<string, TableComparison>;
  totalTables: number;
}

const BackendMigrationsTab = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMigration, setExpandedMigration] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  useEffect(() => {
    fetchMigrationReport();
  }, []);

  const fetchMigrationReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/admin/database?type=migration-report&include=data`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch migration report: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('📊 MIGRATION REPORT:', data);
      
      setReportData(data);
    } catch (error) {
      console.error('Error fetching migration report:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'error':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'success':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>✅ Uyumlu</span>;
      case 'warning':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⚠️ Uyarı</span>;
      case 'error':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>❌ Hata</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>❓ Bilinmiyor</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600">Migration raporu oluşturuluyor...</p>
        <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="text-red-600 mb-4" size={48} />
        <p className="text-red-600 font-semibold">Migration raporu yüklenemedi</p>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
        <button
          onClick={fetchMigrationReport}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Database className="text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">Rapor bulunamadı</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={fetchMigrationReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Toplam Migration</div>
          <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalMigrations}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
          <div className="text-sm text-green-700 mb-1">Başarılı</div>
          <div className="text-2xl font-bold text-green-900">{reportData.summary.successCount}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">Uyarı</div>
          <div className="text-2xl font-bold text-yellow-900">{reportData.summary.warningCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
          <div className="text-sm text-red-700 mb-1">Hata</div>
          <div className="text-2xl font-bold text-red-900">{reportData.summary.errorCount}</div>
        </div>
      </div>

      {/* Migration List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Migration Detayları</h2>
          <p className="text-sm text-gray-600 mt-1">Her migration'ın backend ile uyumunu kontrol edin</p>
        </div>

        <div className="divide-y divide-gray-200">
          {reportData.migrations.map((migration) => (
            <div key={migration.filename} className="hover:bg-gray-50 transition-colors">
              {/* Migration Header */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(migration.status)}
                    <div className="flex-1">
                      <div className="font-mono font-semibold text-gray-900">{migration.filename}</div>
                      <div className="text-sm text-gray-600 mt-1">{migration.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(migration.status)}
                    {migration.executed ? (
                      <span className="text-sm text-gray-600">
                        {new Date(migration.executed_at!).toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">Çalışmadı</span>
                    )}
                    <button
                      onClick={() => setExpandedMigration(
                        expandedMigration === migration.filename ? null : migration.filename
                      )}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {expandedMigration === migration.filename ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Migration Details (Expanded) */}
              {expandedMigration === migration.filename && (
                <div className="px-6 pb-6 bg-gray-50">
                  {/* Tables Section */}
                  {migration.tables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Tablolar ({migration.tables.length})</h4>
                      <div className="space-y-2">
                        {migration.tables.map((table, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {table.status === 'success' ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <AlertCircle size={16} className="text-yellow-600" />
                                )}
                                <span className="font-mono text-sm">{table.table}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Kolon: {table.expectedColumns} beklenen / {table.actualColumns} gerçek
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Columns Section */}
                  {migration.columns.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Kolonlar ({migration.columns.length})</h4>
                      <div className="space-y-2">
                        {migration.columns.map((column, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {column.found ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <XCircle size={16} className="text-red-600" />
                                )}
                                <span className="font-mono text-sm">{column.table}.{column.column}</span>
                              </div>
                              <div className="text-sm">
                                {column.found ? (
                                  <span className="text-green-600">✅ Backend'de var</span>
                                ) : (
                                  <span className="text-red-600">❌ Backend'de yok</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inserts Section */}
                  {migration.inserts.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Veri Eklemeleri ({migration.inserts.length})</h4>
                      <div className="space-y-2">
                        {migration.inserts.map((insert, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {insert.found ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <XCircle size={16} className="text-red-600" />
                                )}
                                <span className="font-mono text-sm">{insert.table}</span>
                              </div>
                              <div className="text-sm">
                                {insert.found ? (
                                  <span className="text-green-600">✅ Veri bulundu</span>
                                ) : (
                                  <span className="text-red-600">❌ Veri bulunamadı</span>
                                )}
                              </div>
                            </div>
                            {!insert.found && insert.columns.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 font-mono">
                                Beklenen: {insert.columns[0]} = {insert.values[0]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table Comparison Section */}
      {reportData.totalTables > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Tablo Karşılaştırması</h2>
            <p className="text-sm text-gray-600 mt-1">Migration'larda tanımlanan tablolar vs Backend'deki gerçek tablolar</p>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.entries(reportData.tables).map(([tableName, comparison]) => (
              <div key={tableName} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(comparison.status)}
                      <div className="flex-1">
                        <div className="font-mono font-semibold text-gray-900">{tableName}</div>
                        <div className="text-sm text-gray-600 mt-1">{comparison.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(comparison.status)}
                      <div className="text-sm text-gray-600">
                        {comparison.expectedColumns} → {comparison.actualColumns} kolon
                      </div>
                      <button
                        onClick={() => setExpandedTable(expandedTable === tableName ? null : tableName)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedTable === tableName ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Details (Expanded) */}
                {expandedTable === tableName && comparison.columnComparison && (
                  <div className="px-6 pb-6 bg-gray-50 space-y-4">
                    {/* Missing Columns */}
                    {comparison.columnComparison.missing.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">
                          ❌ Eksik Kolonlar ({comparison.columnComparison.missing.length})
                        </h4>
                        <div className="space-y-2">
                          {comparison.columnComparison.missing.map((col, idx) => (
                            <div key={idx} className="bg-red-50 rounded-lg p-3 border border-red-200">
                              <div className="font-mono text-sm text-red-900">{col.name}</div>
                              <div className="text-xs text-red-700 mt-1">{col.type} - {col.source}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra Columns */}
                    {comparison.columnComparison.extra.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          ⚠️ Fazla Kolonlar ({comparison.columnComparison.extra.length})
                        </h4>
                        <div className="space-y-2">
                          {comparison.columnComparison.extra.map((col, idx) => (
                            <div key={idx} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <div className="font-mono text-sm text-yellow-900">{col.name}</div>
                              <div className="text-xs text-yellow-700 mt-1">{col.type} - {col.source}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Type Mismatches */}
                    {comparison.columnComparison.typeMismatch.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">
                          🔄 Tip Uyuşmazlıkları ({comparison.columnComparison.typeMismatch.length})
                        </h4>
                        <div className="space-y-2">
                          {comparison.columnComparison.typeMismatch.map((col, idx) => (
                            <div key={idx} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                              <div className="font-mono text-sm text-orange-900">{col.name}</div>
                              <div className="text-xs text-orange-700 mt-1">
                                Beklenen: {col.expectedType} → Gerçek: {col.actualType}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Columns */}
                    {comparison.columnComparison.matching.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">
                          ✅ Uyumlu Kolonlar ({comparison.columnComparison.matching.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {comparison.columnComparison.matching.map((col, idx) => (
                            <div key={idx} className="bg-green-50 rounded-lg p-2 border border-green-200">
                              <div className="font-mono text-xs text-green-900">{col.name}</div>
                              <div className="text-xs text-green-700">{col.type}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendMigrationsTab;

