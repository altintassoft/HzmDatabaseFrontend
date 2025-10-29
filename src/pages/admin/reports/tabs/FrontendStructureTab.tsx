import { useEffect } from 'react';
import { RefreshCw, Clock, FolderTree } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';

export default function FrontendStructureTab() {
  const { report, loading, generating, error, fetchLatestReport, generateReport } = useAIKnowledgeBase('frontend_structure');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <FolderTree size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Frontend Proje Yapısı</h2>
            <p className="text-gray-400 text-sm">Dosya ve Klasör Analizi</p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-cyan-500/90 hover:bg-cyan-600 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
          <span>{generating ? 'Oluşturuluyor...' : '🔄 Rapor Oluştur'}</span>
        </button>
      </div>

      {/* Last Update Info */}
      {report && !loading && !generating && (
        <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 backdrop-blur-sm border border-pink-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock size={18} className="text-pink-400" />
            <span className="text-white font-medium">Son Güncelleme:</span>
            <span className="text-pink-200">{formatDate(report.updated_at)}</span>
            {report.description && (
              <>
                <span className="text-pink-400/50">•</span>
                <span className="text-pink-100/80">{report.description}</span>
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
          <RefreshCw size={32} className="animate-spin text-cyan-400" />
          <span className="ml-3 text-white font-medium">Yeni rapor oluşturuluyor...</span>
        </div>
      )}

      {/* No Report */}
      {!loading && !generating && !error && !report && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
          <FolderTree size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Henüz rapor oluşturulmamış</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-cyan-500/90 hover:bg-cyan-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'İlk Raporu Oluştur'}
          </button>
        </div>
      )}

      {/* Report Content - Markdown */}
      {!generating && !error && report && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl">
          <div className="prose prose-invert prose-lg max-w-none">
            <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-100 font-mono bg-gray-900/50 p-6 rounded-lg overflow-x-auto">
              {report.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
