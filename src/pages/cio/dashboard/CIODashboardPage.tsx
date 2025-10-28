import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Search, 
  BarChart3,
  Share2,
  Settings,
  TrendingUp,
  Users,
  Eye,
  Target
} from 'lucide-react';
import { SocialMediaLink, SEOSettings, GoogleAnalytics, GoogleSearchConsole } from './types';
import SocialMediaManager from './components/SocialMediaManager';
import SEOManager from './components/SEOManager';
import GoogleToolsManager from './components/GoogleToolsManager';

const CIODashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'seo' | 'google'>('overview');

  // Mock data - gerçek uygulamada bu veriler state management'ten gelecek
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([
    {
      id: '1',
      platform: 'facebook',
      url: 'https://facebook.com/hzmsoft',
      title: 'HZMSoft Facebook',
      description: 'Resmi Facebook sayfamız',
      isActive: true,
      displayLocation: 'footer',
      icon: '📘',
      color: 'bg-blue-600',
      followers: 1250,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      platform: 'instagram',
      url: 'https://instagram.com/hzmsoft',
      title: 'HZMSoft Instagram',
      description: 'Güncel projelerimiz ve haberler',
      isActive: true,
      displayLocation: 'footer',
      icon: '📷',
      color: 'bg-pink-500',
      followers: 890,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ]);

  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([
    {
      id: '1',
      pageType: 'home',
      title: 'HZMSoft DataBase Pro - Profesyonel Veritabanı Yönetimi',
      description: 'HZMSoft DataBase Pro ile profesyonel veritabanı yönetimi. Tablolar oluşturun, alanları düzenleyin ve verilerinizi kolayca yönetin.',
      keywords: ['veritabanı', 'database', 'yönetim', 'HZMSoft', 'yazılım', 'professional'],
      ogTitle: 'HZMSoft DataBase Pro - Veritabanı Yönetim Sistemi',
      ogDescription: 'Profesyonel veritabanı yönetimi için güçlü araçlar',
      robots: 'index,follow',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ]);

  const [googleAnalytics, setGoogleAnalytics] = useState<GoogleAnalytics>({
    trackingId: '',
    isActive: false,
    events: {
      pageViews: true,
      clicks: true,
      formSubmissions: true,
      downloads: false
    }
  });

  const [googleSearchConsole, setGoogleSearchConsole] = useState<GoogleSearchConsole>({
    siteUrl: '',
    verificationCode: '',
    isVerified: false,
    submitSitemap: false,
    sitemapUrl: ''
  });

  // Handlers
  const handleAddSocialLink = (link: Omit<SocialMediaLink, 'id' | 'createdAt'>) => {
    const newLink: SocialMediaLink = {
      ...link,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleUpdateSocialLink = (id: string, updates: Partial<SocialMediaLink>) => {
    setSocialLinks(links => 
      links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    );
  };

  const handleDeleteSocialLink = (id: string) => {
    if (confirm('Bu sosyal medya linkini silmek istediğinizden emin misiniz?')) {
      setSocialLinks(links => links.filter(link => link.id !== id));
    }
  };

  const handleUpdateSEO = (pageType: string, updates: Partial<SEOSettings>) => {
    setSeoSettings(settings => {
      const existingIndex = settings.findIndex(s => s.pageType === pageType);
      if (existingIndex >= 0) {
        return settings.map((setting, index) => 
          index === existingIndex 
            ? { ...setting, ...updates, updatedAt: new Date().toISOString() }
            : setting
        );
      } else {
        return [...settings, {
          id: Date.now().toString(),
          pageType: pageType as SEOSettings['pageType'],
          title: '',
          description: '',
          keywords: [],
          robots: 'index,follow',
          updatedAt: new Date().toISOString(),
          ...updates
        }];
      }
    });
  };

  const handleUpdateAnalytics = (updates: Partial<GoogleAnalytics>) => {
    setGoogleAnalytics(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateSearchConsole = (updates: Partial<GoogleSearchConsole>) => {
    setGoogleSearchConsole(prev => ({ ...prev, ...updates }));
  };

  // Stats
  const activeSocialLinks = socialLinks.filter(link => link.isActive).length;
  const totalFollowers = socialLinks.reduce((total, link) => total + (link.followers || 0), 0);
  const seoOptimizedPages = seoSettings.filter(setting => setting.title && setting.description).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="mr-4 hover:bg-green-700 p-2 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <Globe size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">SEO & Sosyal Medya CIO</h1>
                  <p className="text-green-100 text-lg">Sitenizi Google'da üst sıralara çıkarın ve sosyal medya varlığınızı güçlendirin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp size={16} className="inline mr-2" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'social'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Share2 size={16} className="inline mr-2" />
              Sosyal Medya
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'seo'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search size={16} className="inline mr-2" />
              SEO Ayarları
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'google'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Google Araçları
            </button>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="text-white" size={40} />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  SEO & Sosyal Medya Bölümüne Hoş Geldiniz! 🚀
                </h2>
                <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                  Sitenizi Google'da üst sıralara çıkarmak için SEO ayarlarınızı optimize edin ve 
                  sosyal medya hesaplarınızı entegre ederek online varlığınızı güçlendirin.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif Sosyal Medya</p>
                    <p className="text-3xl font-bold text-blue-600">{activeSocialLinks}</p>
                    <p className="text-sm text-gray-500">Platform</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Share2 className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Takipçi</p>
                    <p className="text-3xl font-bold text-green-600">{totalFollowers.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-500">Sosyal medya</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">SEO Optimize</p>
                    <p className="text-3xl font-bold text-purple-600">{seoOptimizedPages}</p>
                    <p className="text-sm text-gray-500">Sayfa</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Search className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Google Araçları</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {(googleAnalytics.isActive ? 1 : 0) + (googleSearchConsole.isVerified ? 1 : 0)}
                    </p>
                    <p className="text-sm text-gray-500">Aktif</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <BarChart3 className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hızlı İşlemler</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('social')}
                  className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <Share2 size={20} className="mr-2" />
                  Sosyal Medya Ekle
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className="bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                >
                  <Search size={20} className="mr-2" />
                  SEO Optimize Et
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className="bg-purple-100 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center"
                >
                  <BarChart3 size={20} className="mr-2" />
                  Analytics Kur
                </button>
                <button
                  className="bg-orange-100 text-orange-700 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center"
                >
                  <Target size={20} className="mr-2" />
                  Performans Raporu
                </button>
              </div>
            </div>

            {/* Current Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Sosyal Medya Durumu</h4>
                <div className="space-y-3">
                  {socialLinks.slice(0, 3).map(link => (
                    <div key={link.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{link.icon}</span>
                        <span className="text-sm font-medium">{link.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {link.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  ))}
                  {socialLinks.length === 0 && (
                    <p className="text-gray-500 text-sm">Henüz sosyal medya linki eklenmemiş</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">SEO Durumu</h4>
                <div className="space-y-3">
                  {seoSettings.slice(0, 3).map(setting => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{setting.pageType}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        setting.title && setting.description ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {setting.title && setting.description ? 'Optimize' : 'Eksik'}
                      </span>
                    </div>
                  ))}
                  {seoSettings.length === 0 && (
                    <p className="text-gray-500 text-sm">Henüz SEO ayarı yapılmamış</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <SocialMediaManager
            socialLinks={socialLinks}
            onAddLink={handleAddSocialLink}
            onUpdateLink={handleUpdateSocialLink}
            onDeleteLink={handleDeleteSocialLink}
          />
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <SEOManager
            seoSettings={seoSettings}
            onUpdateSEO={handleUpdateSEO}
          />
        )}

        {/* Google Tools Tab */}
        {activeTab === 'google' && (
          <GoogleToolsManager
            analytics={googleAnalytics}
            searchConsole={googleSearchConsole}
            onUpdateAnalytics={handleUpdateAnalytics}
            onUpdateSearchConsole={handleUpdateSearchConsole}
          />
        )}
      </main>
    </div>
  );
};

export default CIODashboard;