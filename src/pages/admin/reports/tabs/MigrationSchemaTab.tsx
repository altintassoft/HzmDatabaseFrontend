import { useEffect } from 'react';
import { RefreshCw, Clock, FileCode } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function MigrationSchemaTab() {
  const { report, loading, generating, error, fetchLatestReport, generateReport } = useAIKnowledgeBase('migration_schema');

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
          <div className="p-3 bg-green-500/10 rounded-lg">
            <FileCode size={24} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Migration & Schema</h2>
            <p className="text-gray-400 text-sm">Veritabanı Schema Durumu</p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-green-500/90 hover:bg-green-600 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
          <span>{generating ? 'Oluşturuluyor...' : '🔄 Rapor Oluştur'}</span>
        </button>
      </div>

      {/* Last Update Info */}
      {report && !loading && !generating && (
        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock size={18} className="text-green-400" />
            <span className="text-white font-medium">Son Güncelleme:</span>
            <span className="text-green-200">{formatDate(report.updated_at)}</span>
            {report.description && (
              <>
                <span className="text-green-400/50">•</span>
                <span className="text-green-100/80">{report.description}</span>
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
          <FileCode size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Henüz rapor oluşturulmamış</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-green-500/90 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'İlk Raporu Oluştur'}
          </button>
        </div>
      )}

      {/* Report Content */}
      {!loading && !generating && !error && report && reportData && (
        <div className="space-y-6">
          {/* Schema Info */}
          {reportData.schemas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reportData.schemas.map((schema: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-green-500/20 to-teal-600/10 backdrop-blur-sm border-2 border-green-400/40 rounded-xl p-6 shadow-lg hover:shadow-green-500/20 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCode size={20} className="text-green-300" />
                    <div className="text-xs text-green-200 font-bold uppercase tracking-wider">{schema.schema_name}</div>
                  </div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {schema.table_count}
                  </div>
                  <div className="text-sm text-green-100/80">
                    {schema.table_count === 1 ? 'tablo' : 'tablo'}
                  </div>
                  {schema.total_size && (
                    <div className="mt-3 pt-3 border-t border-green-400/20">
                      <div className="text-xs text-green-200/70">{schema.total_size}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Raw Data */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FileCode size={22} className="text-blue-400" />
              <h3 className="text-lg font-bold text-white">Schema Detayları (JSON)</h3>
            </div>
            <pre className="text-sm text-gray-100 overflow-x-auto bg-gray-900/50 p-5 rounded-lg font-mono leading-relaxed">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
