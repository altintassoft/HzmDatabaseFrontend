import React, { useState, useEffect } from 'react';
import { AdDisplay } from '../modules/cio';
import { Advertisement } from '../modules/cio/types';

// Mock data - gerçek uygulamada bu veriler API'den gelecek
const mockActiveAds: Advertisement[] = [
  {
    id: '1',
    title: 'Premium Plan %30 İndirim!',
    description: 'Yıllık premium planlarda sınırlı süre %30 indirim fırsatı',
    platform: 'google',
    adUrl: 'https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-123456789',
    targetUrl: 'https://example.com/premium-plan',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
    displayLocation: 'sidebar',
    status: 'active',
    budget: 100,
    spent: 45.50,
    impressions: 12500,
    clicks: 340,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2025-01-01T00:00:00Z',
    priority: 8
  },
  {
    id: '2',
    title: 'Yeni API Özellikleri!',
    description: 'Gelişmiş API yönetimi özellikleri ile projelerinizi bir üst seviyeye taşıyın',
    platform: 'facebook',
    adUrl: 'https://www.facebook.com/tr/adnw_request?placement=123456789',
    targetUrl: 'https://example.com/api-features',
    displayLocation: 'banner',
    status: 'active',
    budget: 75,
    spent: 23.80,
    impressions: 8900,
    clicks: 156,
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    createdAt: '2025-01-15T00:00:00Z',
    priority: 6
  }
];

interface AdManagerProps {
  currentPage?: string;
  userType?: 'free' | 'basic' | 'premium' | 'enterprise' | 'all';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

const AdManager: React.FC<AdManagerProps> = ({
  currentPage = 'all',
  userType = 'all',
  deviceType = 'desktop'
}) => {
  const [activeAds, setActiveAds] = useState<Advertisement[]>([]);
  const [closedAds, setClosedAds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Gerçek uygulamada burada API'den aktif reklamları çekeceğiz
    // Şimdilik mock data kullanıyoruz
    const filteredAds = mockActiveAds.filter(ad => {
      // Sadece aktif reklamları göster
      if (ad.status !== 'active') return false;
      
      // Kapatılan reklamları gösterme
      if (closedAds.has(ad.id)) return false;
      
      // Tarih kontrolü
      const now = new Date();
      const startDate = new Date(ad.startDate);
      const endDate = new Date(ad.endDate);
      
      if (now < startDate || now > endDate) return false;
      
      return true;
    });

    setActiveAds(filteredAds);
  }, [currentPage, userType, deviceType, closedAds]);

  const handleCloseAd = (adId: string) => {
    setClosedAds(prev => new Set([...prev, adId]));
  };

  const renderAdsByLocation = (location: Advertisement['displayLocation']) => {
    const locationAds = activeAds.filter(ad => ad.displayLocation === location);
    
    return locationAds.map(ad => (
      <AdDisplay
        key={ad.id}
        advertisement={ad}
        location={location}
        onClose={() => handleCloseAd(ad.id)}
      />
    ));
  };

  return (
    <>
      {/* Header Ads */}
      {renderAdsByLocation('header')}
      
      {/* Sidebar Ads */}
      {renderAdsByLocation('sidebar')}
      
      {/* Footer Ads */}
      {renderAdsByLocation('footer')}
      
      {/* Popup Ads */}
      {renderAdsByLocation('popup')}
      
      {/* Banner ve Inline ads sayfaya göre render edilecek */}
    </>
  );
};

export default AdManager;