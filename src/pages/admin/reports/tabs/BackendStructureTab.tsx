import { RefreshCw, Clock, FolderTree } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function BackendStructureTab() {
  const { report, generating, error, generateReport } = useAIKnowledgeBase('backend_structure');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <FolderTree size={24} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Backend Proje Yapısı</h2>
            <p className="text-gray-400 text-sm">Dosya ve Klasör Analizi</p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-purple-500/90 hover:bg-purple-600 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <RefreshCw size={32} className="animate-spin text-purple-400" />
          <span className="ml-3 text-gray-300">Rapor oluşturuluyor...</span>
        </div>
      )}

      {/* No Report */}
      {!generating && !error && !report && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
          <FolderTree size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Henüz rapor oluşturulmamış</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-purple-500/90 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'İlk Raporu Oluştur'}
          </button>
        </div>
      )}

      {/* Report Content - Markdown */}
      {!generating && !error && report && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div
            className="prose prose-invert prose-sm max-w-none"
            style={{
              color: '#e5e7eb',
            }}
          >
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {report.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
