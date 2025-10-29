import { RefreshCw, Clock, FileCode } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function MigrationSchemaTab() {
  const { report, generating, error, generateReport } = useAIKnowledgeBase('migration_schema');

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
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">📋 Migration & Schema</h2>
              <p className="text-green-100 mt-1">Veritabanı Schema Durumu</p>
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
            <span>{generating ? 'Oluşturuluyor...' : '🔄 Rapor Oluştur'}</span>
          </button>
        </div>
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
          <RefreshCw size={32} className="animate-spin text-green-400" />
          <span className="ml-3 text-gray-300">Rapor oluşturuluyor...</span>
        </div>
      )}

      {/* No Report */}
      {!generating && !error && !report && (
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
      {!generating && !error && report && reportData && (
        <div className="space-y-4">
          {/* Schema Info */}
          {reportData.schemas && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.schemas.map((schema: any, index: number) => (
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
              <h3 className="text-lg font-bold text-gray-900">Schema Detayları (JSON)</h3>
            </div>
            <pre className="text-sm text-gray-700 overflow-x-auto bg-gray-50 p-4 rounded-lg font-mono leading-relaxed">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
