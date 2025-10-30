import { useState, useEffect } from 'react';
import { RefreshCw, Clock, FileCode, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import api from '../../../../services/api';

export default function MigrationSchemaTab() {
  const [migrationReport, setMigrationReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMigrationReport();
  }, []);

  const fetchMigrationReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database?type=migration-report');
      if (response) {
        setMigrationReport(response);
      }
    } catch (err: any) {
      console.error('Failed to fetch migration report:', err);
      setError(err.message || 'Migration raporu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">📋 Migration & Schema Uyumluluk</h2>
              <p className="text-green-100 mt-1">Migration vs Tablo vs Kod Analizi</p>
            </div>
      </div>

          <button
            onClick={fetchMigrationReport}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Yükleniyor...' : '🔄 Yenile'}</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">❌ {error}</p>
          <button
            onClick={fetchMigrationReport}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Tekrar Dene
          </button>
                          </div>
                        )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-green-500" />
          <span className="ml-3 text-gray-600 font-medium">Migration raporu yükleniyor...</span>
          </div>
        )}

      {/* Report Content */}
      {!loading && !error && migrationReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {migrationReport.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Toplam Migration</span>
                  <FileCode size={20} className="text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{migrationReport.summary.totalMigrations || 0}</div>
              </div>

              <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 text-sm font-medium">✅ Başarılı</span>
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-900">{migrationReport.summary.successCount || 0}</div>
              </div>

              <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-700 text-sm font-medium">⚠️ Uyarı</span>
                  <AlertTriangle size={20} className="text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-yellow-900">{migrationReport.summary.warningCount || 0}</div>
              </div>

              <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-700 text-sm font-medium">❌ Hata</span>
                  <XCircle size={20} className="text-red-500" />
              </div>
                <div className="text-3xl font-bold text-red-900">{migrationReport.summary.errorCount || 0}</div>
              </div>
            </div>
          )}

          {/* Migration Table */}
          {migrationReport.migrations && migrationReport.migrations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode size={20} />
                  Migration Detayları ({migrationReport.migrations.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Migration Dosyası</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Oluşturulan Tablolar</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Executed</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {migrationReport.migrations.map((migration: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">{migration.filename}</div>
                          {migration.description && (
                            <div className="text-xs text-gray-500 mt-1">{migration.description}</div>
                          )}
                          {migration.executed_at && (
                            <div className="text-xs text-gray-400 mt-1">
                              📅 {new Date(migration.executed_at).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {migration.tables && migration.tables.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {migration.tables.map((table: any, tIdx: number) => (
                                <div key={tIdx} className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-blue-600 font-medium">
                                    {table.fullName || `${table.schema}.${table.table}`}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({table.actualColumns || 0} sütun)
                                  </span>
                            </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Tablo oluşturmaz</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {migration.executed ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              ✅ Evet
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              ⏳ Bekliyor
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {migration.status === 'success' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              ✅ OK
                            </span>
                            )}
                          {migration.status === 'warning' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              ⚠️ Uyarı
                            </span>
                            )}
                          {migration.status === 'error' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              ❌ Hata
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Schema Cards (Optional) */}
          {migrationReport.schemas && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {migrationReport.schemas.map((schema: any, index: number) => (
                <div key={index} className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-700 text-sm font-medium uppercase tracking-wide">{schema.schema_name}</span>
                    <FileCode size={20} className="text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {schema.table_count}
                  </div>
                  <div className="text-sm text-green-600 mb-3">
                    {schema.table_count === 1 ? 'tablo' : 'tablo'}
                  </div>
                  {schema.total_size && (
                    <div className="pt-3 border-t border-green-200">
                      <div className="text-xs text-green-600">{schema.total_size}</div>
          </div>
        )}
      </div>
              ))}
            </div>
          )}

          {/* Raw Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCode size={22} className="text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Migration Detayları (JSON)</h3>
            </div>
            <pre className="text-sm text-gray-700 overflow-x-auto bg-gray-50 p-4 rounded-lg font-mono leading-relaxed">
              {JSON.stringify(migrationReport, null, 2)}
            </pre>
          </div>
      </div>
      )}
    </div>
  );
}
