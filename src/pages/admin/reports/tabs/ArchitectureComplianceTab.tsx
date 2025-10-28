import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Target,
  Flame,
  Zap,
  BarChart3,
  Copy
} from 'lucide-react';
import api from '../../../../services/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface Feature {
  id: number;
  name: string;
  roadmap: string;
  code: string;
  gap: number;
  compliance: number;
  priority: 'P0' | 'P1' | 'P2';
  status: 'compliant' | 'partial' | 'non_compliant';
}

interface Summary {
  generalScore: number;
  totalFeatures: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
}

interface ActionItem {
  feature: string;
  gap: number;
  action: string;
}

interface ComplianceData {
  success: boolean;
  summary: Summary;
  features: Feature[];
  actionPlan: {
    p0: ActionItem[];
    p1: ActionItem[];
    p2: ActionItem[];
  };
  generatedAt: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ArchitectureComplianceTab() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [filter, setFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/database?type=architecture-compliance');
      
      console.log('🏗️ Architecture Compliance Response:', response);
      
      if (response && response.success) {
        setData(response as ComplianceData);
        setHasScanned(true);
        setError(null);
      } else {
        setError('Rapor yüklenemedi');
        setHasScanned(true);
      }
    } catch (err: any) {
      console.error('❌ Architecture compliance error:', err);
      setError(err.message || 'Veri yüklenirken hata oluştu');
      setHasScanned(true);
    } finally {
      setLoading(false);
    }
  };

  // Raporu kopyala
  const handleCopyReport = () => {
    if (!data) return;
    
    const timestamp = new Date().toLocaleString('tr-TR');
    
    let report = `🏗️ MİMARİ & ROADMAP UYUMLULUK RAPORU
${'='.repeat(60)}
⏰ Tarih: ${timestamp}

📊 GENEL ÖZET:
${'='.repeat(60)}
• Genel Compliance: ${data.summary.generalScore}%
• Toplam Feature: ${data.summary.totalFeatures}
• ✅ Uyumlu: ${data.summary.compliantCount} (${Math.round((data.summary.compliantCount/data.summary.totalFeatures)*100)}%)
• ⚠️ Kısmi: ${data.summary.partialCount} (${Math.round((data.summary.partialCount/data.summary.totalFeatures)*100)}%)
• ❌ Uyumsuz: ${data.summary.nonCompliantCount} (${Math.round((data.summary.nonCompliantCount/data.summary.totalFeatures)*100)}%)
• 🔥 P0 Görevler: ${data.summary.p0Count}
• ⚡ P1 Görevler: ${data.summary.p1Count}
• 📊 P2 Görevler: ${data.summary.p2Count}

${'='.repeat(60)}
ROADMAP VS KOD MATRİSİ
${'='.repeat(60)}

`;
    
    data.features.forEach((feature) => {
      const icon = feature.status === 'compliant' ? '✅' : feature.status === 'partial' ? '⚠️' : '❌';
      const priorityIcon = feature.priority === 'P0' ? '🔥' : feature.priority === 'P1' ? '⚡' : '📊';
      
      report += `[${feature.id}] ${feature.name}
├─ Roadmap: ${feature.roadmap}
├─ Kod: ${feature.code}
├─ Gap: ${feature.gap}%
├─ Compliance: ${icon} ${feature.compliance}%
└─ Öncelik: ${priorityIcon} ${feature.priority}

`;
    });
    
    if (data.actionPlan.p0.length > 0) {
      report += `\n${'='.repeat(60)}\n`;
      report += `🔥 P0 KRİTİK GÖREVLER (Bu Hafta):\n`;
      report += `${'='.repeat(60)}\n\n`;
      
      data.actionPlan.p0.forEach((action, i) => {
        report += `${i + 1}. ${action.feature}\n`;
        report += `   └─ Action: ${action.action}\n\n`;
      });
    }
    
    report += `${'='.repeat(60)}\n`;
    report += `📋 Rapor Sonu\n`;
    report += `${'='.repeat(60)}\n`;
    
    navigator.clipboard.writeText(report).then(() => {
      alert('✅ Rapor panoya kopyalandı!');
    }).catch(() => {
      alert('❌ Kopyalama başarısız!');
    });
  };

  // Filtrelenmiş features
  const filteredFeatures = data ? (
    filter === 'all' ? data.features : data.features.filter(f => f.priority === filter)
  ) : [];

  // ============================================================================
  // İLK EKRAN - Tarama yapılmadıysa
  // ============================================================================

  if (!hasScanned && !loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">🏗️ Mimari & Roadmap Uyumluluk</h2>
              <p className="text-purple-100 mt-1">
                Dokümantasyon vs Kod Uyum Analizi
              </p>
            </div>
          </div>
        </div>

        {/* İlk tarama ekranı */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Target size={64} className="mx-auto text-purple-500 mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Roadmap vs Kod Uyumunu Analiz Et
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            ANALIZ.md dosyasındaki Roadmap matrisini okuyup, kodunuzla karşılaştırır.
            13 farklı feature'ın dokümantasyon-kod uyumunu gösterir.
          </p>
          <button
            onClick={fetchData}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
          >
            <Target size={20} />
            <span className="font-semibold">Taramayı Başlat</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ANALIZ.md parse ediliyor...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Target size={24} />
            <h2 className="text-2xl font-bold">🏗️ Mimari & Roadmap Uyumluluk</h2>
          </div>
        </div>

        {/* Error */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Hata</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={18} />
            <span>Tekrar Dene</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">🏗️ Mimari & Roadmap Uyumluluk</h2>
              <p className="text-purple-100 mt-1">
                Dokümantasyon vs Kod Uyum Analizi ({data.summary.totalFeatures} Feature)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyReport}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy size={18} />
              <span>Raporu Kopyala</span>
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Yenile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Genel Compliance</span>
            <BarChart3 size={20} className="text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.summary.generalScore}%</div>
          <div className="mt-2 text-xs text-gray-500">{data.summary.totalFeatures} feature analiz edildi</div>
        </div>

        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 text-sm font-medium">✅ Uyumlu</span>
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-900">{data.summary.compliantCount}</div>
          <div className="mt-2 text-xs text-green-600">
            {Math.round((data.summary.compliantCount/data.summary.totalFeatures)*100)}% compliance
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-700 text-sm font-medium">⚠️ Kısmi</span>
            <AlertCircle size={20} className="text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">{data.summary.partialCount}</div>
          <div className="mt-2 text-xs text-yellow-600">
            {Math.round((data.summary.partialCount/data.summary.totalFeatures)*100)}% kısmi uyum
          </div>
        </div>

        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-700 text-sm font-medium">❌ Uyumsuz</span>
            <XCircle size={20} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-900">{data.summary.nonCompliantCount}</div>
          <div className="mt-2 text-xs text-red-600">
            {Math.round((data.summary.nonCompliantCount/data.summary.totalFeatures)*100)}% uyumsuz
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tümü ({data.summary.totalFeatures})
          </button>
          <button
            onClick={() => setFilter('P0')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'P0'
                ? 'bg-red-100 text-red-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Flame size={16} />
            P0 Kritik ({data.summary.p0Count})
          </button>
          <button
            onClick={() => setFilter('P1')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'P1'
                ? 'bg-yellow-100 text-yellow-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap size={16} />
            P1 Önemli ({data.summary.p1Count})
          </button>
          <button
            onClick={() => setFilter('P2')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'P2'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={16} />
            P2 Gelecek ({data.summary.p2Count})
          </button>
        </div>
      </div>

      {/* Features Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roadmap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeatures.map((feature) => (
                <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feature.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{feature.roadmap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{feature.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.gap === 0 ? 'bg-green-100 text-green-700' :
                      feature.gap < 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {feature.gap}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {feature.status === 'compliant' && <CheckCircle size={16} className="text-green-500" />}
                      {feature.status === 'partial' && <AlertCircle size={16} className="text-yellow-500" />}
                      {feature.status === 'non_compliant' && <XCircle size={16} className="text-red-500" />}
                      <span className={`font-medium ${
                        feature.status === 'compliant' ? 'text-green-700' :
                        feature.status === 'partial' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {feature.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                      feature.priority === 'P0' ? 'bg-red-100 text-red-700' :
                      feature.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {feature.priority === 'P0' && <Flame size={12} />}
                      {feature.priority === 'P1' && <Zap size={12} />}
                      {feature.priority === 'P2' && <BarChart3 size={12} />}
                      {feature.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P0 Action Plan */}
      {data.actionPlan.p0.length > 0 && (
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <Flame size={20} className="text-red-600" />
            🔥 P0 KRİTİK GÖREVLER (Bu Hafta)
          </h3>
          <div className="space-y-3">
            {data.actionPlan.p0.map((action, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{action.feature}</h4>
                    <p className="text-sm text-gray-600 mb-2">Gap: {action.gap}%</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
                      ▸ {action.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-900">
              <strong>Hedef:</strong> Bu görevler tamamlandığında compliance <strong>{data.summary.generalScore}% → 65-70%</strong> olacak
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
