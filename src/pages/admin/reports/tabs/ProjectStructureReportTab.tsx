import { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import api from '../../../../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface ReportData {
  type: 'markdown';
  content: string;
  reportPath: string;
  lastUpdated: string;
  note: string;
}

interface ApiResponse {
  success: boolean;
  type: string;
  timestamp: string;
  content: string;
  reportPath: string;
  lastUpdated: string;
  note: string;
  error?: string;
  message?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectStructureReportTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // ============================================================================
  // FETCH REPORT
  // ============================================================================

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/admin/database', {
        params: { type: 'project-structure' }
      });

      // Check if response exists and has data
      if (!response || !response.data) {
        setError('Backend\'den yanıt alınamadı. Lütfen Railway deployment durumunu kontrol edin.');
        return;
      }

      // Check for success
      if (!response.data.success) {
        setError(response.data.message || response.data.error || 'Rapor yüklenemedi');
        return;
      }

      // Check if all required fields exist
      if (!response.data.content) {
        setError('Rapor içeriği bulunamadı. DOSYA_ANALIZI.md dosyası eksik olabilir.');
        return;
      }

      setReportData({
        type: response.data.type || 'markdown',
        content: response.data.content,
        reportPath: response.data.reportPath || 'Unknown',
        lastUpdated: response.data.lastUpdated || new Date().toISOString(),
        note: response.data.note || ''
      });

    } catch (err: any) {
      console.error('Failed to fetch project structure report:', err);
      
      // Better error messages
      if (err.response?.status === 404) {
        setError('Backend endpoint bulunamadı (404). Railway deployment tamamlanmamış olabilir.');
      } else if (err.response?.status === 500) {
        setError(`Backend hatası: ${err.response?.data?.message || 'Internal Server Error'}`);
      } else if (err.code === 'ECONNREFUSED') {
        setError('Backend bağlantısı reddedildi. Railway servisi çalışmıyor olabilir.');
      } else {
        setError(err.response?.data?.message || err.message || 'Rapor yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="animate-spin" size={20} />
          <span>Rapor yükleniyor...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: ERROR
  // ============================================================================

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Rapor Yüklenemedi</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: REPORT
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Dosya Analiz Raporu</h2>
          <p className="text-gray-600">Frontend & Backend - Otomatik Dosya Boyutu Analizi</p>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-blue-800 mb-2">
              <span className="font-semibold">Kaynak:</span> {reportData?.reportPath}
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Clock size={14} />
              <span>Son güncelleme: {reportData?.lastUpdated ? new Date(reportData.lastUpdated).toLocaleString('tr-TR') : 'Bilinmiyor'}</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">{reportData?.note}</p>
          </div>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {reportData?.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

