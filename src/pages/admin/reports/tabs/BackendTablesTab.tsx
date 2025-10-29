import { useEffect } from 'react';
import { RefreshCw, Clock, Database } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function BackendTablesTab() {
  const { report, loading, generating, error, fetchLatestReport, generateReport } = useAIKnowledgeBase('backend_tables');

  // Otomatik yükleme: Sayfa açılınca varsa getir
  useEffect(() => {
    fetchLatestReport();
  }, []);

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
      {report && !loading && !generating && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock size={18} className="text-blue-400" />
            <span className="text-white font-medium">Son Güncelleme:</span>
            <span className="text-blue-200">{formatDate(report.updated_at)}</span>
            {report.description && (
              <>
                <span className="text-blue-400/50">•</span>
                <span className="text-blue-100/80">{report.description}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 font-medium">❌ {error}</p>
          <button
            onClick={generateReport}
            className="mt-2 text-sm text-red-200 hover:text-red-100 underline font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-400" />
          <span className="ml-3 text-white font-medium">Rapor yükleniyor...</span>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-green-400" />
          <span className="ml-3 text-white font-medium">Yeni rapor oluşturuluyor...</span>
        </div>
      )}

      {/* No Report */}
      {!loading && !generating && !error && !report && (
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
      {!loading && !generating && !error && report && reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border-2 border-blue-400/40 rounded-xl p-5 shadow-lg hover:shadow-blue-500/20 transition-all">
                <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-2">Toplam Tablo</div>
                <div className="text-4xl font-extrabold text-white">
                  {reportData.summary.total_tables || 0}
                </div>
                <div className="text-xs text-blue-300/70 mt-1">veritabanı tablosu</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border-2 border-green-400/40 rounded-xl p-5 shadow-lg hover:shadow-green-500/20 transition-all">
                <div className="text-xs text-green-200 font-bold uppercase tracking-wider mb-2">Schema</div>
                <div className="text-4xl font-extrabold text-white">
                  {reportData.summary.total_schemas || 0}
                </div>
                <div className="text-xs text-green-300/70 mt-1">farklı schema</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border-2 border-purple-400/40 rounded-xl p-5 shadow-lg hover:shadow-purple-500/20 transition-all">
                <div className="text-xs text-purple-200 font-bold uppercase tracking-wider mb-2">Toplam Sütun</div>
                <div className="text-4xl font-extrabold text-white">
                  {reportData.summary.total_columns || 0}
                </div>
                <div className="text-xs text-purple-300/70 mt-1">tüm sütunlar</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm border-2 border-orange-400/40 rounded-xl p-5 shadow-lg hover:shadow-orange-500/20 transition-all">
                <div className="text-xs text-orange-200 font-bold uppercase tracking-wider mb-2">Toplam Index</div>
                <div className="text-4xl font-extrabold text-white">
                  {reportData.summary.total_indexes || 0}
                </div>
                <div className="text-xs text-orange-300/70 mt-1">performans indexi</div>
              </div>
            </div>
          )}

          {/* Tables List */}
          {reportData.tables && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Schema</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Tablo</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Sütun Sayısı</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Index Sayısı</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Satır Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reportData.tables.map((table: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-400">{table.schema_name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{table.table_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{table.column_count}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{table.index_count}</td>
                        <td className="px-6 py-4 text-sm text-gray-200">{table.row_count?.toLocaleString() || 'N/A'}</td>
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
