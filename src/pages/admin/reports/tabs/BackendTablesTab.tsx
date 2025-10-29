import { RefreshCw, Clock, Database } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function BackendTablesTab() {
  const { report, generating, error, generateReport } = useAIKnowledgeBase('backend_tables');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseReport = () => {
    if (!report) return null;
    try {
      return JSON.parse(report.content);
    } catch (err) {
      console.error('Failed to parse report:', err);
      return null;
    }
  };

  const reportData = parseReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Database size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Backend Tabloları</h2>
            <p className="text-gray-400 text-sm">Railway PostgreSQL Tablo Envanteri</p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-blue-500/90 hover:bg-blue-600 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
          <span>{generating ? 'Oluşturuluyor...' : '🔄 Rapor Oluştur'}</span>
        </button>
      </div>

      {/* Last Update Info */}
      {report && !generating && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} />
            <span>Son Oluşturma: {formatDate(report.updated_at)}</span>
            {report.description && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{report.description}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">❌ {error}</p>
          <button
            onClick={generateReport}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-400" />
          <span className="ml-3 text-gray-300">Rapor oluşturuluyor...</span>
        </div>
      )}

      {/* No Report */}
      {!generating && !error && !report && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
          <Database size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Henüz rapor oluşturulmamış</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-500/90 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'İlk Raporu Oluştur'}
          </button>
        </div>
      )}

      {/* Report Content */}
      {!generating && !error && report && reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400">Toplam Tablo</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {reportData.summary.total_tables || 0}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400">Schema</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {reportData.summary.total_schemas || 0}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400">Toplam Sütun</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {reportData.summary.total_columns || 0}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400">Toplam Index</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {reportData.summary.total_indexes || 0}
                </div>
              </div>
            </div>
          )}

          {/* Tables List */}
          {reportData.tables && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Schema</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tablo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Sütun Sayısı</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Index Sayısı</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Satır Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reportData.tables.map((table: any, index: number) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-blue-400">{table.schema_name}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{table.table_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{table.column_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{table.index_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{table.row_count?.toLocaleString() || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
