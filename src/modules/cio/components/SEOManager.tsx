import React, { useState } from 'react';
import { Search, Edit, Save, X, Globe, Image, FileText } from 'lucide-react';
import { SEOSettings } from '../types';
import { SEO_PAGE_TYPES } from '../utils/socialPlatforms';

interface SEOManagerProps {
  seoSettings: SEOSettings[];
  onUpdateSEO: (pageType: string, settings: Partial<SEOSettings>) => void;
}

const SEOManager: React.FC<SEOManagerProps> = ({
  seoSettings,
  onUpdateSEO
}) => {
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SEOSettings>>({});

  const handleEdit = (pageType: string) => {
    const settings = seoSettings.find(s => s.pageType === pageType);
    setEditingPage(pageType);
    setFormData(settings || {
      pageType: pageType as SEOSettings['pageType'],
      title: '',
      description: '',
      keywords: [],
      robots: 'index,follow'
    });
  };

  const handleSave = () => {
    if (editingPage && formData) {
      onUpdateSEO(editingPage, formData);
      setEditingPage(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
    setFormData({});
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData({...formData, keywords});
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <Search className="text-green-600 mr-3" size={24} />
        <div>
          <h3 className="text-xl font-bold text-gray-800">SEO Ayarları</h3>
          <p className="text-gray-600">Google'da üst sıralarda çıkmak için SEO ayarlarınızı optimize edin</p>
        </div>
      </div>

      <div className="space-y-6">
        {SEO_PAGE_TYPES.map((pageType) => {
          const settings = seoSettings.find(s => s.pageType === pageType.id);
          const isEditing = editingPage === pageType.id;

          return (
            <div key={pageType.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{pageType.name}</h4>
                  <p className="text-sm text-gray-600">{pageType.description}</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(pageType.id)}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Düzenle
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sayfa Başlığı (Title) *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Örn: HZMSoft DataBase Pro - Profesyonel Veritabanı Yönetimi"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.title || '').length}/60 karakter (Google'da görünecek başlık)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Açıklama (Description) *
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Örn: HZMSoft DataBase Pro ile profesyonel veritabanı yönetimi. Tablolar oluşturun, alanları düzenleyin ve verilerinizi kolayca yönetin."
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.description || '').length}/160 karakter (Google'da görünecek açıklama)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      value={formData.keywords?.join(', ') || ''}
                      onChange={(e) => handleKeywordsChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="veritabanı, database, yönetim, HZMSoft, yazılım"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Virgülle ayırarak yazın (Örn: veritabanı, database, yönetim)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Graph Başlık
                      </label>
                      <input
                        type="text"
                        value={formData.ogTitle || ''}
                        onChange={(e) => setFormData({...formData, ogTitle: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Facebook/LinkedIn'de görünecek başlık"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Graph Görsel URL
                      </label>
                      <input
                        type="url"
                        value={formData.ogImage || ''}
                        onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Açıklama
                    </label>
                    <textarea
                      value={formData.ogDescription || ''}
                      onChange={(e) => setFormData({...formData, ogDescription: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Sosyal medyada paylaşıldığında görünecek açıklama"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={formData.canonicalUrl || ''}
                        onChange={(e) => setFormData({...formData, canonicalUrl: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://example.com/page"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Robots
                      </label>
                      <select
                        value={formData.robots || 'index,follow'}
                        onChange={(e) => setFormData({...formData, robots: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="index,follow">Index, Follow (Önerilen)</option>
                        <option value="index,nofollow">Index, NoFollow</option>
                        <option value="noindex,follow">NoIndex, Follow</option>
                        <option value="noindex,nofollow">NoIndex, NoFollow</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      İptal
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Başlık:</h5>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {settings?.title || 'Henüz ayarlanmamış'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Anahtar Kelimeler:</h5>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {settings?.keywords?.join(', ') || 'Henüz ayarlanmamış'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Açıklama:</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {settings?.description || 'Henüz ayarlanmamış'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SEO Tips */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <Globe className="mr-2" size={20} />
          SEO İpuçları
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h5 className="font-medium mb-2">✅ Başlık Optimizasyonu:</h5>
            <ul className="space-y-1 text-green-600">
              <li>• 50-60 karakter arası tutun</li>
              <li>• Ana anahtar kelimeyi başa koyun</li>
              <li>• Marka adını sona ekleyin</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">✅ Açıklama Optimizasyonu:</h5>
            <ul className="space-y-1 text-green-600">
              <li>• 150-160 karakter arası tutun</li>
              <li>• Çağrı cümlesi ekleyin</li>
              <li>• Anahtar kelimeleri doğal kullanın</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOManager;