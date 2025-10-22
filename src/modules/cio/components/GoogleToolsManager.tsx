import React, { useState } from 'react';
import { BarChart3, Search, Eye, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleAnalytics, GoogleSearchConsole } from '../types';

interface GoogleToolsManagerProps {
  analytics: GoogleAnalytics;
  searchConsole: GoogleSearchConsole;
  onUpdateAnalytics: (analytics: Partial<GoogleAnalytics>) => void;
  onUpdateSearchConsole: (searchConsole: Partial<GoogleSearchConsole>) => void;
}

const GoogleToolsManager: React.FC<GoogleToolsManagerProps> = ({
  analytics,
  searchConsole,
  onUpdateAnalytics,
  onUpdateSearchConsole
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'search-console'>('analytics');

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="text-blue-600 mr-3" size={24} />
        <div>
          <h3 className="text-xl font-bold text-gray-800">Google Araçları</h3>
          <p className="text-gray-600">Google Analytics ve Search Console entegrasyonu</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Google Analytics
          </button>
          <button
            onClick={() => setActiveTab('search-console')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search-console'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search size={16} className="inline mr-2" />
            Search Console
          </button>
        </nav>
      </div>

      {/* Google Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <BarChart3 className="text-blue-600 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-blue-800">Google Analytics Entegrasyonu</h4>
                <p className="text-sm text-blue-600">Ziyaretçi istatistiklerini takip edin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics Tracking ID
              </label>
              <input
                type="text"
                value={analytics.trackingId}
                onChange={(e) => onUpdateAnalytics({ trackingId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX veya UA-XXXXXXXX-X"
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Analytics hesabınızdan alacağınız tracking ID
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="analyticsActive"
                checked={analytics.isActive}
                onChange={(e) => onUpdateAnalytics({ isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="analyticsActive" className="ml-2 block text-sm text-gray-700">
                Google Analytics'i aktif et
              </label>
            </div>
          </div>

          <div>
            <h5 className="text-lg font-medium text-gray-800 mb-4">Takip Edilecek Olaylar</h5>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics.events.pageViews}
                  onChange={(e) => onUpdateAnalytics({ 
                    events: { ...analytics.events, pageViews: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Sayfa Görüntülemeleri</span>
                  <p className="text-xs text-gray-500">Hangi sayfaların ziyaret edildiği</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics.events.clicks}
                  onChange={(e) => onUpdateAnalytics({ 
                    events: { ...analytics.events, clicks: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Tıklamalar</span>
                  <p className="text-xs text-gray-500">Buton ve link tıklamaları</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics.events.formSubmissions}
                  onChange={(e) => onUpdateAnalytics({ 
                    events: { ...analytics.events, formSubmissions: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Form Gönderimi</span>
                  <p className="text-xs text-gray-500">Kayıt ve iletişim formları</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics.events.downloads}
                  onChange={(e) => onUpdateAnalytics({ 
                    events: { ...analytics.events, downloads: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">İndirmeler</span>
                  <p className="text-xs text-gray-500">Dosya indirme işlemleri</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              {analytics.isActive && analytics.trackingId ? (
                <CheckCircle className="text-green-600 mr-3" size={20} />
              ) : (
                <AlertCircle className="text-yellow-600 mr-3" size={20} />
              )}
              <div>
                <h4 className="font-medium text-gray-800">
                  {analytics.isActive && analytics.trackingId ? 'Google Analytics Aktif' : 'Google Analytics Kurulumu Gerekli'}
                </h4>
                <p className="text-sm text-gray-600">
                  {analytics.isActive && analytics.trackingId 
                    ? 'Ziyaretçi verileri toplanıyor ve analiz ediliyor'
                    : 'Tracking ID girin ve aktif edin'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Console Tab */}
      {activeTab === 'search-console' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Search className="text-green-600 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-green-800">Google Search Console</h4>
                <p className="text-sm text-green-600">Arama performansınızı izleyin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={searchConsole.siteUrl}
                onChange={(e) => onUpdateSearchConsole({ siteUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                value={searchConsole.verificationCode}
                onChange={(e) => onUpdateSearchConsole({ verificationCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="google-site-verification=..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sitemap URL
            </label>
            <input
              type="url"
              value={searchConsole.sitemapUrl || ''}
              onChange={(e) => onUpdateSearchConsole({ sitemapUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/sitemap.xml"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchConsole.isVerified}
                onChange={(e) => onUpdateSearchConsole({ isVerified: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">Site doğrulandı</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchConsole.submitSitemap}
                onChange={(e) => onUpdateSearchConsole({ submitSitemap: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">Sitemap gönder</span>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              {searchConsole.isVerified ? (
                <CheckCircle className="text-green-600 mr-3" size={20} />
              ) : (
                <AlertCircle className="text-blue-600 mr-3" size={20} />
              )}
              <div>
                <h4 className="font-medium text-gray-800">
                  {searchConsole.isVerified ? 'Search Console Aktif' : 'Search Console Kurulumu'}
                </h4>
                <p className="text-sm text-gray-600">
                  {searchConsole.isVerified 
                    ? 'Arama performansı verileri toplanıyor'
                    : 'Site doğrulaması yapın ve sitemap gönderin'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-3">Kurulum Adımları:</h5>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Search Console</a>'a gidin</li>
              <li>2. "Özellik Ekle" butonuna tıklayın</li>
              <li>3. Site URL'nizi girin</li>
              <li>4. HTML meta tag yöntemini seçin</li>
              <li>5. Doğrulama kodunu yukarıdaki alana yapıştırın</li>
              <li>6. "Site doğrulandı" kutusunu işaretleyin</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleToolsManager;