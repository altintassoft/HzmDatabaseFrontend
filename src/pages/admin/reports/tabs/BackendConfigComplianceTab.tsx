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

const BackendConfigComplianceTab = () => {
  const [backendRules, setBackendRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real compliance data
  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/database?type=configuration-compliance');
        
        if (response.data.success && response.data.data) {
          setBackendRules(response.data.data.backend || []);
        } else {
          setError('Compliance data format error');
        }
      } catch (err: any) {
        console.error('Failed to fetch compliance:', err);
        setError(err.response?.data?.message || 'Rapor yüklenemedi');
        // Fallback to mock data
        setBackendRules(mockBackendRules);
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kod taraması yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-700">
          <XCircle size={24} />
          <div>
            <div className="font-semibold">Hata</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

// Mock data (fallback)
const mockBackendRules: ComplianceRule[] = [
  // BÖLÜM I: TEMEL PRENSİPLER
  {
    id: 1,
    bölüm: 'I',
    kural: '1. Hard-Code Yasağı',
    durum: 'kısmi',
    yüzde: 65,
    açıklama: 'Path management kısmen uyumlu. Bazı dosyalarda hala deep relative paths var (../../../../).',
    öneri: 'Module aliases (@core, @modules) kullanımı yaygınlaştırılmalı.'
  },
  {
    id: 2,
    bölüm: 'I',
    kural: '2. Dynamic Discovery',
    durum: 'uyumsuz',
    yüzde: 30,
    açıklama: 'Module auto-loading yok. Route\'lar manuel olarak import edilip register ediliyor.',
    öneri: 'ModuleLoader.autoLoadRoutes(app) implementasyonu yapılmalı.'
  },
  {
    id: 3,
    bölüm: 'I',
    kural: '3. Configuration Patterns',
    durum: 'kısmi',
    yüzde: 70,
    açıklama: 'Config dosyası var ama constants (PATHS, TABLES) dosyaları eksik.',
    öneri: 'src/core/constants/paths.js ve tables.js oluşturulmalı.'
  },
  {
    id: 4,
    bölüm: 'I',
    kural: '4. Anti-Patterns (Yasak)',
    durum: 'uyumsuz',
    yüzde: 40,
    açıklama: 'Deep relative paths (../../../../) ve hard-coded values mevcut.',
    öneri: 'Pre-commit hook ile otomatik kontrol eklenmeli.'
  },
  {
    id: 5,
    bölüm: 'I',
    kural: '5. Best Practices',
    durum: 'kısmi',
    yüzde: 55,
    açıklama: 'Module aliases kısmen kullanılıyor, convention over configuration eksik.',
    öneri: 'Standart klasör yapısı ve naming conventions takip edilmeli.'
  },

  // BÖLÜM II: GÜVENLİK & KALİTE
  {
    id: 6,
    bölüm: 'II',
    kural: '6. Güvenlik & Gizli Bilgi',
    durum: 'kısmi',
    yüzde: 60,
    açıklama: 'Environment variables kullanılıyor ama secrets maskeleme eksik.',
    öneri: 'Logger\'da credential maskeleme implementasyonu yapılmalı.'
  },
  {
    id: 7,
    bölüm: 'II',
    kural: '7. Hata Yönetimi & Logging',
    durum: 'kısmi',
    yüzde: 65,
    açıklama: 'Logger var ama structured logging (JSON) ve error codes eksik.',
    öneri: 'APP_[DOMAIN]_[REASON] formatında error code standardı oluşturulmalı.'
  },
  {
    id: 8,
    bölüm: 'II',
    kural: '8. Multi-Tenant & İzleme',
    durum: 'uyumlu',
    yüzde: 85,
    açıklama: 'tenant_id filtresi ve RLS policy mevcut. Audit logs eksik.',
    öneri: 'Audit trail middleware eklenmeli.'
  },
  {
    id: 9,
    bölüm: 'II',
    kural: '9. İsimlendirme & Konvansiyon',
    durum: 'uyumsuz',
    yüzde: 45,
    açıklama: 'Naming inconsistency: api-keys vs api-key, user vs users. Plural/singular karmaşası.',
    öneri: 'Tüm modül dosyaları plural olmalı (users.routes.js).'
  },

  // BÖLÜM III: VERİ & API
  {
    id: 10,
    bölüm: 'III',
    kural: '10. Zaman, Para, Kimlik',
    durum: 'uyumlu',
    yüzde: 90,
    açıklama: 'TIMESTAMPTZ, UUID kullanılıyor. Para için DECIMAL var.',
    öneri: 'UUID v7 (sıralanabilir) migrasyon yapılabilir.'
  },
  {
    id: 11,
    bölüm: 'III',
    kural: '11. API Sözleşmesi & Versiyonlama',
    durum: 'kısmi',
    yüzde: 50,
    açıklama: '/api/v1 var ama OpenAPI spec eksik.',
    öneri: 'OpenAPI 3.1 spec oluşturulup swagger-ui eklenmeli.'
  },
  {
    id: 12,
    bölüm: 'III',
    kural: '12. Performans & Ölçeklenebilirlik',
    durum: 'kısmi',
    yüzde: 55,
    açıklama: 'Redis cache var ama rate limiting eksik.',
    öneri: 'express-rate-limit ile IP+user+tenant bazlı limit eklenmeli.'
  },

  // BÖLÜM IV: BACKEND KURALLARI
  {
    id: 14,
    bölüm: 'IV',
    kural: '14. Backend Kuralları',
    durum: 'kısmi',
    yüzde: 60,
    açıklama: 'Database queries uyumlu. File system ve imports için PATHS/constants eksik.',
    öneri: 'TABLES constant kullanımı yaygınlaştırılmalı.'
  },

  // BÖLÜM V: KOD KALİTESİ & OTOMASYON
  {
    id: 15,
    bölüm: 'V',
    kural: '15. Kod Kalitesi & Kurallar',
    durum: 'kısmi',
    yüzde: 50,
    açıklama: 'ESLint var ama deep path yasağı kuralı yok.',
    öneri: 'import/no-relative-parent-imports ve no-restricted-imports kuralları eklenmeli.'
  },
  {
    id: 16,
    bölüm: 'V',
    kural: '16. CI/CD Otomatik Kontroller',
    durum: 'uyumsuz',
    yüzde: 20,
    açıklama: 'Pre-commit hook yok, CI pipeline sadece basic test yapıyor.',
    öneri: 'Husky + lint-staged ekleyip deep path/IP/credentials taraması yapılmalı.'
  },

  // BÖLÜM VI: ADVANCED
  {
    id: 17,
    bölüm: 'VI',
    kural: '17. Test & Doğrulama',
    durum: 'uyumsuz',
    yüzde: 25,
    açıklama: 'Test coverage düşük. Unit/integration/E2E test eksik.',
    öneri: 'Jest/Vitest ile test piramidi oluşturulmalı.'
  },
  {
    id: 18,
    bölüm: 'VI',
    kural: '18. Alias & Yol Çözümleme',
    durum: 'uyumsuz',
    yüzde: 30,
    açıklama: 'module-alias kullanılmıyor. Deep relative paths yaygın.',
    öneri: 'package.json\'a _moduleAliases eklenmeli.'
  },
  {
    id: 19,
    bölüm: 'VI',
    kural: '19. Feature Flags',
    durum: 'uyumsuz',
    yüzde: 10,
    açıklama: 'Feature flag sistemi yok.',
    öneri: '@core/flags implementasyonu yapılabilir (opsiyonel).'
  },
  {
    id: 20,
    bölüm: 'VI',
    kural: '20. Dokümantasyon',
    durum: 'kısmi',
    yüzde: 60,
    açıklama: 'Roadmap ve docs/ var ama modül README\'leri eksik.',
    öneri: 'Her modül için README + API örnekleri eklenmeli.'
  },
];

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

  return (
    <div className="space-y-6">
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

