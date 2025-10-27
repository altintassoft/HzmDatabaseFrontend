import { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle, Clock, Server, Monitor } from 'lucide-react';
import api from '../../../../services/api';
import BackendStructureTab from './BackendStructureTab';
import FrontendStructureTab from './FrontendStructureTab';

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

type TabType = 'backend' | 'frontend';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectStructureReportTab() {
  const [activeTab, setActiveTab] = useState<TabType>('backend');
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
      const data = await api.get('/admin/database', {
        params: { type: 'project-structure' }
      });

      // Check if response exists
      if (!data) {
        setError('Backend\'den yanıt alınamadı. Lütfen Railway deployment durumunu kontrol edin.');
        return;
      }

      // Check for success
      if (!data.success) {
        setError(data.message || data.error || 'Rapor yüklenemedi');
        return;
      }

      // Check if all required fields exist
      if (!data.content) {
        setError('Rapor içeriği bulunamadı. DOSYA_ANALIZI.md dosyası eksik olabilir.');
        return;
      }

      setReportData({
        type: data.type || 'markdown',
        content: data.content,
        reportPath: data.reportPath || 'Unknown',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        note: data.note || ''
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Proje Yapısı Raporu</h2>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('backend')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'backend'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Server size={18} />
            <span>Backend</span>
          </button>
          
          <button
            onClick={() => setActiveTab('frontend')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'frontend'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Monitor size={18} />
            <span>Frontend</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'backend' && reportData && (
          <BackendStructureTab markdownContent={reportData.content} />
        )}
        
        {activeTab === 'frontend' && reportData && (
          <FrontendStructureTab markdownContent={reportData.content} />
        )}
      </div>
    </div>
  );
}

