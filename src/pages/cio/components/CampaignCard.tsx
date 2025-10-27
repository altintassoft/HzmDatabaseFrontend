import React from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  BarChart3, 
  Target, 
  Settings, 
  Activity 
} from 'lucide-react';
import { Advertisement } from '../types';
import { calculateCTR, calculateCPC, getStatusColor, getStatusText, formatCurrency, formatNumber } from '../utils/campaignUtils';

interface CampaignCardProps {
  campaign: Advertisement;
  onToggleStatus: (id: string) => void;
  onEdit: (campaign: Advertisement) => void;
  onDelete: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  const getTypeIcon = (type: Advertisement['type']) => {
    switch (type) {
      case 'banner': return <BarChart3 size={16} className="text-blue-600" />;
      case 'popup': return <Target size={16} className="text-purple-600" />;
      case 'sidebar': return <Settings size={16} className="text-green-600" />;
      case 'inline': return <Activity size={16} className="text-orange-600" />;
      default: return <BarChart3 size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3">
              {getTypeIcon(campaign.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
              <p className="text-sm text-gray-600">{campaign.description}</p>
              <span className="text-xs text-gray-400 capitalize">{campaign.type}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
            {getStatusText(campaign.status)}
          </span>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Bütçe Kullanımı</span>
            <span className="font-medium">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatNumber(campaign.impressions)}</p>
            <p className="text-xs text-gray-500">Gösterim</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatNumber(campaign.clicks)}</p>
            <p className="text-xs text-gray-500">Tıklama</p>
          </div>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{calculateCTR(campaign.clicks, campaign.impressions)}%</p>
            <p className="text-xs text-gray-500">CTR</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{calculateCPC(campaign.spent, campaign.clicks)} ₺</p>
            <p className="text-xs text-gray-500">CPC</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar size={14} className="mr-2" />
          <span>
            {new Date(campaign.startDate).toLocaleDateString('tr-TR')} - {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleStatus(campaign.id)}
            className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
              campaign.status === 'active' 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } transition-colors`}
          >
            {campaign.status === 'active' ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
            {campaign.status === 'active' ? 'Duraklat' : 'Başlat'}
          </button>
          <button 
            onClick={() => onEdit(campaign)}
            className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => onDelete(campaign.id)}
            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;