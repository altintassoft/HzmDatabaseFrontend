import { useEffect } from 'react';
import { RefreshCw, Clock, FileCode } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function MigrationSchemaTab() {
  const { report, loading, generating, error, fetchLatestReport, generateReport } = useAIKnowledgeBase('migration_schema');

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
      {report && !loading && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} />
            <span>Son Güncelleme: {formatDate(report.updated_at)}</span>
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
            onClick={fetchLatestReport}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-green-400" />
          <span className="ml-3 text-gray-300">Yükleniyor...</span>
        </div>
      )}

      {/* No Report */}
      {!loading && !error && !report && (
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
      {!loading && !error && report && reportData && (
        <div className="space-y-4">
          {/* Schema Info */}
          {reportData.schemas && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.schemas.map((schema: any, index: number) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-400">{schema.schema_name}</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {schema.table_count} tablo
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {schema.total_size || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raw Data */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
