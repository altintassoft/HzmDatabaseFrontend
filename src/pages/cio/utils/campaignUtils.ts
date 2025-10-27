import { Advertisement } from '../types';

export const calculateCTR = (clicks: number, impressions: number): string => {
  return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
};

export const calculateCPC = (spent: number, clicks: number): string => {
  return clicks > 0 ? (spent / clicks).toFixed(2) : '0.00';
};

export const getStatusColor = (status: Advertisement['status']): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: Advertisement['status']): string => {
  switch (status) {
    case 'active': return 'Aktif';
    case 'paused': return 'Duraklatıldı';
    case 'draft': return 'Taslak';
    default: return 'Bilinmiyor';
  }
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('tr-TR') + ' ₺';
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('tr-TR');
};