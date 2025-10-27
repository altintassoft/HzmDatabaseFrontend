import { AdPlatform } from '../types';

export const AD_PLATFORMS: AdPlatform[] = [
  {
    id: 'google',
    name: 'Google Ads',
    type: 'google',
    icon: '🔍',
    color: 'bg-blue-500'
  },
  {
    id: 'facebook',
    name: 'Facebook Ads',
    type: 'facebook',
    icon: '📘',
    color: 'bg-blue-600'
  },
  {
    id: 'instagram',
    name: 'Instagram Ads',
    type: 'instagram',
    icon: '📷',
    color: 'bg-pink-500'
  },
  {
    id: 'twitter',
    name: 'Twitter Ads',
    type: 'twitter',
    icon: '🐦',
    color: 'bg-sky-500'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    type: 'linkedin',
    icon: '💼',
    color: 'bg-blue-700'
  },
  {
    id: 'youtube',
    name: 'YouTube Ads',
    type: 'youtube',
    icon: '📺',
    color: 'bg-red-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    type: 'tiktok',
    icon: '🎵',
    color: 'bg-black'
  }
];

export const getPlatformInfo = (type: AdPlatform['type']): AdPlatform => {
  return AD_PLATFORMS.find(platform => platform.type === type) || AD_PLATFORMS[0];
};

export const getDisplayLocationText = (location: string): string => {
  const locations = {
    'header': 'Üst Başlık',
    'sidebar': 'Yan Panel',
    'footer': 'Alt Bilgi',
    'popup': 'Popup',
    'banner': 'Banner',
    'inline': 'İçerik Arası'
  };
  return locations[location as keyof typeof locations] || location;
};