import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import api from '../../../../services/api';

interface ComplianceRule {
  id: number;
  bölüm: string;
  kural: string;
  durum: 'uyumlu' | 'kısmi' | 'uyumsuz' | 'geçerli-değil';
  yüzde: number;
  açıklama: string;
  öneri?: string;
  detay?: any;
}

// Mock data (fallback) - Component DIŞINDA tanımla!
const mockBackendRules: ComplianceRule[] = [
  {
    id: 1,
    bölüm: 'I',
    kural: '1. Hard-Code Yasağı',
    durum: 'kısmi',
    yüzde: 65,
    açıklama: 'Geçici mock data - API yükleniyor...',
  },
];

const BackendConfigComplianceTab = () => {
  const [backendRules, setBackendRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  // Manuel tarama fonksiyonu (+ AI KB'ye kaydet)
  const handleScan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(ENDPOINTS.ADMIN.DATABASE, {
        params: { type: REPORT_TYPES.CONFIGURATION_COMPLIANCE }
      });
      
      console.log('📊 Compliance API Response (Backend):', response);
      
      // Backend response format: { success: true, backend: [...], frontend: [...] }
      if (response && response.backend && response.backend.length > 0) {
        console.log('✅ Backend rules loaded:', response.backend.length);
        setBackendRules(response.backend);
        setHasScanned(true);
        setError(null);
        
        // Raporu AI KB'ye kaydet (non-blocking)
        try {
          await api.post('/admin/generate-report?type=backend_config');
          console.log('✅ Report saved to AI Knowledge Base');
        } catch (saveErr) {
          console.warn('⚠️  Failed to save to AI KB:', saveErr);
        }
      } else {
        console.error('❌ Backend rules empty or invalid:', response);
        setError('Backend taraması başarısız. Lütfen tekrar deneyin.');
        setHasScanned(true); // Hata ekranı göster ama başa dönme
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch compliance:', err);
      setError(err.message || 'Rapor yüklenemedi. Backend erişilebilir mi?');
      setHasScanned(true); // Hata ekranı göster
      setBackendRules([]); // Mock data yerine boş array
    } finally {
      setLoading(false);
    }
  };

  // İlk ekran - Tarama yapılmadıysa
  if (!hasScanned && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-indigo-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Backend Kod Taraması</h3>
            <p className="text-gray-500 mb-6">24 kural üzerinden backend kodunu tarayın</p>
          </div>
          <button
            onClick={handleScan}
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Taramayı Başlat
          </button>
        </div>
      </div>
    );
  }

  // Loading ekranı
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kod taraması yapılıyor...</p>
          <p className="text-gray-400 text-sm mt-2">Bu 10-30 saniye sürebilir</p>
        </div>
      </div>
    );
  }

  if (error && hasScanned) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-700 mb-4">
            <XCircle size={24} />
            <div>
              <div className="font-semibold">Tarama Hatası</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Genel compliance score hesapla
  const totalScore = backendRules.reduce((sum, rule) => sum + rule.yüzde, 0);
  const averageScore = Math.round(totalScore / backendRules.length);

  // Durum sayıları
  const uyumluCount = backendRules.filter(r => r.durum === 'uyumlu').length;
  const kısmiCount = backendRules.filter(r => r.durum === 'kısmi').length;
  const uyumsuzCount = backendRules.filter(r => r.durum === 'uyumsuz').length;

  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'uyumlu':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'kısmi':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'uyumsuz':
        return <XCircle className="text-red-500" size={20} />;
      case 'geçerli-değil':
        return <Info className="text-gray-400" size={20} />;
      default:
        return null;
    }
  };

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'uyumlu':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✅ Uyumlu</span>;
      case 'kısmi':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">⚠️ Kısmi</span>;
      case 'uyumsuz':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Uyumsuz</span>;
      case 'geçerli-değil':
        return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">➖ N/A</span>;
      default:
        return null;
    }
  };

  const getProgressColor = (yüzde: number) => {
    if (yüzde >= 80) return 'bg-green-500';
    if (yüzde >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Raporu kopyala fonksiyonu
  const handleCopyReport = () => {
    const timestamp = new Date().toLocaleString('tr-TR');
    
    let report = `🔧 BACKEND KONFIGURASYON UYUMU RAPORU
${'='.repeat(60)}
⏰ Tarih: ${timestamp}

📊 GENEL ÖZET:
${'='.repeat(60)}
• Genel Compliance: ${averageScore}%
• Analiz Edilen Kural: 20
• ✅ Uyumlu: ${uyumluCount} (${Math.round((uyumluCount/20)*100)}%)
• ⚠️ Kısmi: ${kısmiCount} (${Math.round((kısmiCount/20)*100)}%)
• ❌ Uyumsuz: ${uyumsuzCount} (${Math.round((uyumsuzCount/20)*100)}%)

${'='.repeat(60)}
DETAYLI ANALIZ
${'='.repeat(60)}

`;

    backendRules.forEach((rule) => {
      const icon = rule.durum === 'uyumlu' ? '✅' : rule.durum === 'kısmi' ? '⚠️' : rule.durum === 'uyumsuz' ? '❌' : '➖';
      
      report += `[${rule.bölüm}] ${rule.kural}
├─ Durum: ${icon} ${rule.durum.charAt(0).toUpperCase() + rule.durum.slice(1)} (${rule.yüzde}%)
├─ Açıklama: ${rule.açıklama}`;
      
      if (rule.öneri) {
        report += `\n└─ Öneri: ${rule.öneri}`;
      }
      
      report += '\n\n';
    });

    report += `${'='.repeat(60)}\n`;
    report += `📋 Rapor Sonu\n`;
    report += `${'='.repeat(60)}\n`;

    navigator.clipboard.writeText(report).then(() => {
      alert('✅ Rapor panoya kopyalandı!');
    }).catch(() => {
      alert('❌ Kopyalama başarısız!');
    });
  };

  return (
    <div className="space-y-6">
      {/* Yeniden Tara ve Kopyala Butonları */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCopyReport}
          disabled={!backendRules.length}
          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Raporu Kopyala
        </button>
        
        <button
          onClick={handleScan}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yeniden Tara
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Genel Compliance Score */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Genel Compliance</div>
          <div className="text-4xl font-bold mb-2">{averageScore}%</div>
          <div className="text-sm opacity-75">20 kural analiz edildi</div>
        </div>

        {/* Uyumlu */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">✅ Uyumlu</div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{uyumluCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((uyumluCount / backendRules.length) * 100)}%</div>
        </div>

        {/* Kısmi Uyumlu */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">⚠️ Kısmi</div>
            <AlertTriangle className="text-yellow-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{kısmiCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((kısmiCount / backendRules.length) * 100)}%</div>
        </div>

        {/* Uyumsuz */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">❌ Uyumsuz</div>
            <XCircle className="text-red-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{uyumsuzCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((uyumsuzCount / backendRules.length) * 100)}%</div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bölüm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Kural</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Durum</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Compliance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backendRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  {/* Bölüm */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getDurumIcon(rule.durum)}
                      <span className="font-mono text-sm text-gray-600">{rule.bölüm}</span>
                    </div>
                  </td>

                  {/* Kural */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{rule.kural}</div>
                  </td>

                  {/* Durum */}
                  <td className="px-6 py-4">
                    {getDurumBadge(rule.durum)}
                  </td>

                  {/* Compliance Progress */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getProgressColor(rule.yüzde)}`}
                          style={{ width: `${rule.yüzde}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[45px]">{rule.yüzde}%</span>
                    </div>
                  </td>

                  {/* Açıklama */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{rule.açıklama}</p>
                      {rule.öneri && (
                        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Öneri:</span> {rule.öneri}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">🚨 Öncelikli Aksiyonlar (P0)</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">1</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Pre-commit Hook Ekle</div>
              <div className="text-sm opacity-90">Deep path, IP, credentials taraması (.husky/pre-commit)</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">2</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Module Loader Oluştur</div>
              <div className="text-sm opacity-90">src/core/utils/module-loader.js (auto-load routes)</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">3</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Constants Dosyaları</div>
              <div className="text-sm opacity-90">src/core/constants/paths.js, tables.js, endpoints.js</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendConfigComplianceTab;

