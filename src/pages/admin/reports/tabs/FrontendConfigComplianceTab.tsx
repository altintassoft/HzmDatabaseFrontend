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

const FrontendConfigComplianceTab = () => {
  const [frontendRules, setFrontendRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real compliance data
  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/database?type=configuration-compliance');
        
        if (response.data.success && response.data.data) {
          setFrontendRules(response.data.data.frontend || []);
        } else {
          setError('Compliance data format error');
        }
      } catch (err: any) {
        console.error('Failed to fetch compliance:', err);
        setError(err.response?.data?.message || 'Rapor yüklenemedi');
        // Fallback to mock data
        setFrontendRules(mockFrontendRules);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
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
const mockFrontendRules: ComplianceRule[] = [
  // BÖLÜM I: TEMEL PRENSİPLER
  {
    id: 1,
    bölüm: 'I',
    kural: '1. Hard-Code Yasağı',
    durum: 'kısmi',
    yüzde: 70,
    açıklama: 'API URLs kısmen environment variable\'dan geliyor. Bazı asset path\'ler hard-coded.',
    öneri: 'Tüm URL\'ler ve asset path\'leri constants dosyasından gelsin.'
  },
  {
    id: 2,
    bölüm: 'I',
    kural: '2. Dynamic Discovery',
    durum: 'geçerli-değil',
    yüzde: 0,
    açıklama: 'Frontend için geçerli değil (React routing manual).',
    öneri: '-'
  },
  {
    id: 3,
    bölüm: 'I',
    kural: '3. Configuration Patterns',
    durum: 'kısmi',
    yüzde: 60,
    açıklama: 'Vite env variables kullanılıyor ama constants dosyaları eksik.',
    öneri: 'src/constants/ klasörü oluşturup ROUTES, ENDPOINTS, ASSETS constants ekle.'
  },
  {
    id: 4,
    bölüm: 'I',
    kural: '4. Anti-Patterns (Yasak)',
    durum: 'kısmi',
    yüzde: 65,
    açıklama: 'Relative import\'lar temiz ama bazı hard-coded URL\'ler mevcut.',
    öneri: 'ESLint kuralı ekle: no-restricted-imports.'
  },
  {
    id: 5,
    bölüm: 'I',
    kural: '5. Best Practices',
    durum: 'uyumlu',
    yüzde: 85,
    açıklama: 'React best practices takip ediliyor. Component yapısı düzgün.',
    öneri: 'TypeScript strict mode açılabilir.'
  },

  // BÖLÜM II: GÜVENLİK & KALİTE
  {
    id: 6,
    bölüm: 'II',
    kural: '6. Güvenlik & Gizli Bilgi',
    durum: 'uyumlu',
    yüzde: 90,
    açıklama: 'API keys client bundle\'ında yok. Token sessionStorage\'da.',
    öneri: 'Token httpOnly cookie\'ye taşınabilir (XSS koruması).'
  },
  {
    id: 7,
    bölüm: 'II',
    kural: '7. Hata Yönetimi & Logging',
    durum: 'kısmi',
    yüzde: 55,
    açıklama: 'console.error kullanılıyor ama structured logging yok.',
    öneri: 'Sentry/LogRocket gibi error tracking servisi ekle.'
  },
  {
    id: 8,
    bölüm: 'II',
    kural: '8. Multi-Tenant & İzleme',
    durum: 'geçerli-değil',
    yüzde: 0,
    açıklama: 'Frontend için tenant izleme backend\'de yapılıyor.',
    öneri: '-'
  },
  {
    id: 9,
    bölüm: 'II',
    kural: '9. İsimlendirme & Konvansiyon',
    durum: 'uyumlu',
    yüzde: 85,
    açıklama: 'Component isimleri PascalCase, dosya isimleri tutarlı.',
    öneri: 'Page/Component/Hook naming convention dokümante edilmeli.'
  },

  // BÖLÜM IV: FRONTEND KURALLARI
  {
    id: 13,
    bölüm: 'IV',
    kural: '13. Frontend Kuralları',
    durum: 'kısmi',
    yüzde: 60,
    açıklama: 'API client (axios) var ama interceptor\'lar ve retry logic eksik.',
    öneri: '@/lib/api.ts dosyası oluşturup merkezi API client yapılmalı.'
  },

  // BÖLÜM V: KOD KALİTESİ & OTOMASYON
  {
    id: 15,
    bölüm: 'V',
    kural: '15. Kod Kalitesi & Kurallar',
    durum: 'uyumlu',
    yüzde: 80,
    açıklama: 'ESLint + Prettier aktif. TypeScript kullanılıyor.',
    öneri: 'Husky pre-commit hook ekle.'
  },
  {
    id: 16,
    bölüm: 'V',
    kural: '16. CI/CD Otomatik Kontroller',
    durum: 'kısmi',
    yüzde: 50,
    açıklama: 'Build check var ama lint + test CI\'da çalışmıyor.',
    öneri: 'GitHub Actions workflow\'a lint ve test ekle.'
  },

  // BÖLÜM VI: ADVANCED
  {
    id: 17,
    bölüm: 'VI',
    kural: '17. Test & Doğrulama',
    durum: 'uyumsuz',
    yüzde: 15,
    açıklama: 'Unit test yok, component test yok.',
    öneri: 'Vitest + React Testing Library setup yapılmalı.'
  },
  {
    id: 18,
    bölüm: 'VI',
    kural: '18. Alias & Yol Çözümleme',
    durum: 'kısmi',
    yüzde: 70,
    açıklama: 'Vite alias\'lar kullanılıyor (@/) ama inconsistent.',
    öneri: 'vite.config.ts\'de tüm alias\'lar tanımlanmalı.'
  },
  {
    id: 19,
    bölüm: 'VI',
    kural: '19. Feature Flags',
    durum: 'uyumsuz',
    yüzde: 10,
    açıklama: 'Feature flag sistemi yok.',
    öneri: 'LaunchDarkly/ConfigCat gibi servis entegre edilebilir (opsiyonel).'
  },
  {
    id: 20,
    bölüm: 'VI',
    kural: '20. Dokümantasyon',
    durum: 'kısmi',
    yüzde: 50,
    açıklama: 'README var ama component documentation eksik.',
    öneri: 'Storybook eklenip component gallery oluşturulmalı.'
  },
];

  // Genel compliance score hesapla (geçerli-değil olanları çıkar)
  const applicableRules = frontendRules.filter(r => r.durum !== 'geçerli-değil');
  const totalScore = applicableRules.reduce((sum, rule) => sum + rule.yüzde, 0);
  const averageScore = Math.round(totalScore / applicableRules.length);

  // Durum sayıları
  const uyumluCount = frontendRules.filter(r => r.durum === 'uyumlu').length;
  const kısmiCount = frontendRules.filter(r => r.durum === 'kısmi').length;
  const uyumsuzCount = frontendRules.filter(r => r.durum === 'uyumsuz').length;
  const naCount = frontendRules.filter(r => r.durum === 'geçerli-değil').length;

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Genel Compliance Score */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Genel Compliance</div>
          <div className="text-4xl font-bold mb-2">{averageScore}%</div>
          <div className="text-sm opacity-75">{applicableRules.length} kural analiz</div>
        </div>

        {/* Uyumlu */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">✅ Uyumlu</div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{uyumluCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((uyumluCount / applicableRules.length) * 100)}%</div>
        </div>

        {/* Kısmi Uyumlu */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">⚠️ Kısmi</div>
            <AlertTriangle className="text-yellow-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{kısmiCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((kısmiCount / applicableRules.length) * 100)}%</div>
        </div>

        {/* Uyumsuz */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">❌ Uyumsuz</div>
            <XCircle className="text-red-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{uyumsuzCount}</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round((uyumsuzCount / applicableRules.length) * 100)}%</div>
        </div>

        {/* N/A */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">➖ N/A</div>
            <Info className="text-gray-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{naCount}</div>
          <div className="text-sm text-gray-500 mt-1">Geçerli değil</div>
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
              {frontendRules.map((rule) => (
                <tr 
                  key={rule.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    rule.durum === 'geçerli-değil' ? 'opacity-60' : ''
                  }`}
                >
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
                    {rule.durum === 'geçerli-değil' ? (
                      <span className="text-sm text-gray-400">-</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${getProgressColor(rule.yüzde)}`}
                            style={{ width: `${rule.yüzde}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[45px]">{rule.yüzde}%</span>
                      </div>
                    )}
                  </td>

                  {/* Açıklama */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{rule.açıklama}</p>
                      {rule.öneri && rule.öneri !== '-' && (
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
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">🚀 Öncelikli Aksiyonlar (P0)</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">1</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Merkezi API Client</div>
              <div className="text-sm opacity-90">@/lib/api.ts oluştur (interceptor, retry, auth)</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">2</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Constants Dosyaları</div>
              <div className="text-sm opacity-90">src/constants/ (ROUTES, ENDPOINTS, ASSETS)</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">3</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Test Setup</div>
              <div className="text-sm opacity-90">Vitest + React Testing Library + Component tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <div className="font-medium text-blue-900 mb-1">ℹ️ Not</div>
            <p className="text-sm text-blue-700">
              Frontend için bazı kurallar (Dynamic Discovery, Multi-Tenant İzleme) backend-spesifik olduğu için "N/A" (Geçerli Değil) olarak işaretlenmiştir. 
              Compliance score hesaplamasında bu kurallar dahil edilmemiştir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontendConfigComplianceTab;

