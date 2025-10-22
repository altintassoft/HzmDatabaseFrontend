import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Target, DollarSign } from 'lucide-react';
import { Advertisement } from '../types';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Omit<Advertisement, 'id' | 'spent' | 'impressions' | 'clicks' | 'createdAt'>) => void;
  campaign?: Advertisement | null;
}

const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  campaign
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner' as Advertisement['type'],
    status: 'draft' as Advertisement['status'],
    targetAudience: [] as string[],
    budget: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        status: campaign.status,
        targetAudience: campaign.targetAudience,
        budget: campaign.budget,
        startDate: campaign.startDate,
        endDate: campaign.endDate
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'banner',
        status: 'draft',
        targetAudience: [],
        budget: 0,
        startDate: '',
        endDate: ''
      });
    }
  }, [campaign, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        targetAudience: [...formData.targetAudience, audience]
      });
    } else {
      setFormData({
        ...formData,
        targetAudience: formData.targetAudience.filter(a => a !== audience)
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {campaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
              </h2>
              <p className="text-pink-100 text-sm">Reklam kampanyanızı yapılandırın</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 p-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Target className="mr-2 text-purple-600" size={20} />
              Temel Bilgiler
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampanya Başlığı *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Kampanya başlığını girin"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Kampanya açıklaması"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reklam Türü
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Advertisement['type']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="banner">🎯 Banner</option>
                  <option value="popup">🔔 Popup</option>
                  <option value="sidebar">📱 Sidebar</option>
                  <option value="inline">📄 Inline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Advertisement['status']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="draft">📝 Taslak</option>
                  <option value="active">✅ Aktif</option>
                  <option value="paused">⏸️ Duraklatıldı</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <DollarSign className="mr-2 text-green-600" size={20} />
              Bütçe ve Tarihler
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bütçe (₺) *
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={formData.startDate}
                  required
                />
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Target className="mr-2 text-blue-600" size={20} />
              Hedef Kitle
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'free-users', label: '🆓 Ücretsiz Kullanıcılar', desc: 'Free plan kullanıcıları' },
                { id: 'basic-users', label: '🥉 Temel Kullanıcılar', desc: 'Basic plan kullanıcıları' },
                { id: 'premium-users', label: '🥈 Premium Kullanıcılar', desc: 'Premium plan kullanıcıları' },
                { id: 'enterprise-users', label: '🥇 Kurumsal Kullanıcılar', desc: 'Enterprise plan kullanıcıları' }
              ].map(audience => (
                <label key={audience.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(audience.id)}
                    onChange={(e) => handleAudienceChange(audience.id, e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">{audience.label}</span>
                    <p className="text-xs text-gray-500">{audience.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {campaign ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;