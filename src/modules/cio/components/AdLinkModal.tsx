import React, { useState, useEffect } from 'react';
import { X, Plus, Link, Eye, Settings, Target, Calendar } from 'lucide-react';
import { Advertisement, AdDisplaySettings } from '../types';
import { AD_PLATFORMS, getDisplayLocationText } from '../utils/adPlatforms';

interface AdLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ad: Omit<Advertisement, 'id' | 'spent' | 'impressions' | 'clicks' | 'createdAt'>, settings: AdDisplaySettings) => void;
  advertisement?: Advertisement | null;
}

const AdLinkModal: React.FC<AdLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  advertisement
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'google' as Advertisement['platform'],
    adUrl: '',
    imageUrl: '',
    targetUrl: '',
    displayLocation: 'sidebar' as Advertisement['displayLocation'],
    status: 'draft' as Advertisement['status'],
    budget: 0,
    startDate: '',
    endDate: '',
    priority: 1
  });

  const [displaySettings, setDisplaySettings] = useState<AdDisplaySettings>({
    showOnPages: ['all'],
    deviceTargeting: ['desktop', 'mobile'],
    userTargeting: ['all'],
    frequency: 3,
    animation: true
  });

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        description: advertisement.description,
        platform: advertisement.platform,
        adUrl: advertisement.adUrl,
        imageUrl: advertisement.imageUrl || '',
        targetUrl: advertisement.targetUrl,
        displayLocation: advertisement.displayLocation,
        status: advertisement.status,
        budget: advertisement.budget,
        startDate: advertisement.startDate,
        endDate: advertisement.endDate,
        priority: advertisement.priority
      });
    } else {
      setFormData({
        title: '',
        description: '',
        platform: 'google',
        adUrl: '',
        imageUrl: '',
        targetUrl: '',
        displayLocation: 'sidebar',
        status: 'draft',
        budget: 0,
        startDate: '',
        endDate: '',
        priority: 1
      });
    }
  }, [advertisement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, displaySettings);
    onClose();
  };

  const handlePageTargeting = (page: string, checked: boolean) => {
    if (page === 'all') {
      setDisplaySettings({
        ...displaySettings,
        showOnPages: checked ? ['all'] : []
      });
    } else {
      const newPages = checked 
        ? [...displaySettings.showOnPages.filter(p => p !== 'all'), page]
        : displaySettings.showOnPages.filter(p => p !== page);
      setDisplaySettings({
        ...displaySettings,
        showOnPages: newPages
      });
    }
  };

  if (!isOpen) return null;

  const selectedPlatform = AD_PLATFORMS.find(p => p.type === formData.platform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <Link size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {advertisement ? 'Reklam Düzenle' : 'Yeni Reklam Ekle'}
                </h2>
                <p className="text-blue-100 text-sm">Reklam platformu linkini ekleyin ve ayarlarını yapın</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Sol Kolon - Temel Bilgiler */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="mr-2 text-blue-600" size={20} />
                  Reklam Bilgileri
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reklam Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Örn: Premium Plan Kampanyası"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Reklam açıklaması"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reklam Platformu *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value as Advertisement['platform']})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {AD_PLATFORMS.map(platform => (
                        <option key={platform.id} value={platform.type}>
                          {platform.icon} {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reklam Linki (Embed/Script URL) *
                    </label>
                    <input
                      type="url"
                      value={formData.adUrl}
                      onChange={(e) => setFormData({...formData, adUrl: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://googleads.g.doubleclick.net/..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPlatform?.name} reklam kodunu veya linkini buraya yapıştırın
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hedef URL (Tıklandığında gidilecek)
                    </label>
                    <input
                      type="url"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/landing-page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reklam Görseli URL (İsteğe bağlı)
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/ad-image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Bütçe ve Tarihler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="mr-2 text-green-600" size={20} />
                  Bütçe ve Zamanlama
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Günlük Bütçe (₺)
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={formData.startDate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durum
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Advertisement['status']})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">📝 Taslak</option>
                        <option value="active">✅ Aktif</option>
                        <option value="paused">⏸️ Duraklatıldı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Öncelik (1-10)
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Kolon - Görüntüleme Ayarları */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="mr-2 text-purple-600" size={20} />
                  Görüntüleme Ayarları
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görüntüleme Konumu
                    </label>
                    <select
                      value={formData.displayLocation}
                      onChange={(e) => setFormData({...formData, displayLocation: e.target.value as Advertisement['displayLocation']})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="header">🔝 Üst Başlık</option>
                      <option value="sidebar">📱 Yan Panel</option>
                      <option value="footer">⬇️ Alt Bilgi</option>
                      <option value="popup">🔔 Popup</option>
                      <option value="banner">🎯 Banner</option>
                      <option value="inline">📄 İçerik Arası</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Gösterilecek Sayfalar
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'all', label: '🌐 Tüm Sayfalar', desc: 'Sitenin her yerinde göster' },
                        { id: 'home', label: '🏠 Ana Sayfa', desc: 'Sadece ana sayfada' },
                        { id: 'dashboard', label: '📊 Dashboard', desc: 'Kullanıcı panelinde' },
                        { id: 'projects', label: '📁 Projeler', desc: 'Proje sayfalarında' },
                        { id: 'pricing', label: '💰 Fiyatlandırma', desc: 'Plan sayfalarında' }
                      ].map(page => (
                        <label key={page.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={displaySettings.showOnPages.includes(page.id)}
                            onChange={(e) => handlePageTargeting(page.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">{page.label}</span>
                            <p className="text-xs text-gray-500">{page.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cihaz Hedefleme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'desktop', label: '🖥️ Masaüstü' },
                        { id: 'mobile', label: '📱 Mobil' },
                        { id: 'tablet', label: '📱 Tablet' }
                      ].map(device => (
                        <label key={device.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={displaySettings.deviceTargeting.includes(device.id as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDisplaySettings({
                                  ...displaySettings,
                                  deviceTargeting: [...displaySettings.deviceTargeting, device.id as any]
                                });
                              } else {
                                setDisplaySettings({
                                  ...displaySettings,
                                  deviceTargeting: displaySettings.deviceTargeting.filter(d => d !== device.id)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm">{device.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Kullanıcı Hedefleme
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'all', label: '👥 Tüm Kullanıcılar' },
                        { id: 'free', label: '🆓 Ücretsiz Kullanıcılar' },
                        { id: 'basic', label: '🥉 Temel Kullanıcılar' },
                        { id: 'premium', label: '🥈 Premium Kullanıcılar' },
                        { id: 'enterprise', label: '🥇 Kurumsal Kullanıcılar' }
                      ].map(user => (
                        <label key={user.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={displaySettings.userTargeting.includes(user.id as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDisplaySettings({
                                  ...displaySettings,
                                  userTargeting: [...displaySettings.userTargeting, user.id as any]
                                });
                              } else {
                                setDisplaySettings({
                                  ...displaySettings,
                                  userTargeting: displaySettings.userTargeting.filter(u => u !== user.id)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm">{user.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gösterim Sıklığı (günlük)
                      </label>
                      <input
                        type="number"
                        value={displaySettings.frequency}
                        onChange={(e) => setDisplaySettings({...displaySettings, frequency: Number(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="animation"
                        checked={displaySettings.animation}
                        onChange={(e) => setDisplaySettings({...displaySettings, animation: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="animation" className="ml-2 block text-sm text-gray-700">
                        ✨ Animasyon Efekti
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {advertisement ? 'Güncelle' : 'Reklam Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdLinkModal;