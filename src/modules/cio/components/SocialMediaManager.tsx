import React, { useState } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { SocialMediaLink } from '../types';
import { SOCIAL_PLATFORMS, DISPLAY_LOCATIONS } from '../utils/socialPlatforms';

interface SocialMediaManagerProps {
  socialLinks: SocialMediaLink[];
  onAddLink: (link: Omit<SocialMediaLink, 'id' | 'createdAt'>) => void;
  onUpdateLink: (id: string, link: Partial<SocialMediaLink>) => void;
  onDeleteLink: (id: string) => void;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  socialLinks,
  onAddLink,
  onUpdateLink,
  onDeleteLink
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [formData, setFormData] = useState({
    platform: 'facebook' as SocialMediaLink['platform'],
    url: '',
    title: '',
    description: '',
    displayLocation: 'footer' as SocialMediaLink['displayLocation'],
    isActive: true,
    followers: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const platform = SOCIAL_PLATFORMS.find(p => p.id === formData.platform);
    if (!platform) return;

    const linkData = {
      ...formData,
      icon: platform.icon,
      color: platform.color
    };

    if (editingLink) {
      onUpdateLink(editingLink.id, linkData);
    } else {
      onAddLink(linkData);
    }

    setShowModal(false);
    setEditingLink(null);
    setFormData({
      platform: 'facebook',
      url: '',
      title: '',
      description: '',
      displayLocation: 'footer',
      isActive: true,
      followers: 0
    });
  };

  const openEditModal = (link: SocialMediaLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      title: link.title,
      description: link.description || '',
      displayLocation: link.displayLocation,
      isActive: link.isActive,
      followers: link.followers || 0
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingLink(null);
    setFormData({
      platform: 'facebook',
      url: '',
      title: '',
      description: '',
      displayLocation: 'footer',
      isActive: true,
      followers: 0
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Sosyal Medya Linkleri</h3>
          <p className="text-gray-600">Facebook, Instagram ve diğer sosyal medya hesaplarınızı ekleyin</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Sosyal Medya Ekle
        </button>
      </div>

      {/* Social Links Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialLinks.map((link) => {
          const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
          return (
            <div key={link.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{link.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{link.title}</h4>
                    <p className="text-sm text-gray-500">{platform?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {link.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ExternalLink size={14} className="mr-2" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate">
                    {link.url}
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Konum:</strong> {DISPLAY_LOCATIONS.find(l => l.id === link.displayLocation)?.name}
                </div>
                {link.followers && link.followers > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>Takipçi:</strong> {link.followers.toLocaleString('tr-TR')}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdateLink(link.id, { isActive: !link.isActive })}
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    link.isActive 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {link.isActive ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                  {link.isActive ? 'Gizle' : 'Göster'}
                </button>
                <button 
                  onClick={() => openEditModal(link)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => onDeleteLink(link.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {socialLinks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sosyal medya linki yok</h3>
          <p className="text-gray-500 mb-4">Facebook, Instagram ve diğer sosyal medya hesaplarınızı ekleyin</p>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk Sosyal Medya Linkinizi Ekleyin
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editingLink ? 'Sosyal Medya Düzenle' : 'Yeni Sosyal Medya Ekle'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value as SocialMediaLink['platform']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {SOCIAL_PLATFORMS.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: HZMSoft Facebook"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={SOCIAL_PLATFORMS.find(p => p.id === formData.platform)?.placeholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kısa açıklama"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görüntüleme Konumu
                </label>
                <select
                  value={formData.displayLocation}
                  onChange={(e) => setFormData({...formData, displayLocation: e.target.value as SocialMediaLink['displayLocation']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DISPLAY_LOCATIONS.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Takipçi Sayısı (İsteğe bağlı)
                </label>
                <input
                  type="number"
                  value={formData.followers}
                  onChange={(e) => setFormData({...formData, followers: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Aktif olarak göster
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  {editingLink ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;