import React from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  MapPin, 
  Target, 
  Calendar,
  TrendingUp,
  Users
} from 'lucide-react';
import { Advertisement } from '../types';
import { getPlatformInfo, getDisplayLocationText } from '../utils/adPlatforms';
import { formatCurrency, formatNumber, calculateCTR, getStatusColor, getStatusText } from '../utils/campaignUtils';

interface AdCardProps {
  advertisement: Advertisement;
  onToggleStatus: (id: string) => void;
  onEdit: (ad: Advertisement) => void;
  onDelete: (id: string) => void;
}

const AdCard: React.FC<AdCardProps> = ({
  advertisement,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  const platform = getPlatformInfo(advertisement.platform);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden">
      {/* Header with Platform */}
      <div className={`${platform.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{platform.icon}</span>
            <div>
              <h3 className="text-lg font-bold">{advertisement.title}</h3>
              <p className="text-sm opacity-90">{platform.name}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            advertisement.status === 'active' ? 'bg-green-100 text-green-800' :
            advertisement.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getStatusText(advertisement.status)}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Description */}
        {advertisement.description && (
          <p className="text-gray-600 text-sm mb-4">{advertisement.description}</p>
        )}

        {/* Display Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-2 text-purple-500" />
            <span>{getDisplayLocationText(advertisement.displayLocation)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Target size={14} className="mr-2 text-blue-500" />
            <span>Öncelik: {advertisement.priority}</span>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Bütçe Kullanımı</span>
            <span className="font-medium">{formatCurrency(advertisement.spent)} / {formatCurrency(advertisement.budget)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${platform.color} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min((advertisement.spent / advertisement.budget) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">{formatNumber(advertisement.impressions)}</p>
            <p className="text-xs text-gray-500">Gösterim</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{formatNumber(advertisement.clicks)}</p>
            <p className="text-xs text-gray-500">Tıklama</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">{calculateCTR(advertisement.clicks, advertisement.impressions)}%</p>
            <p className="text-xs text-gray-500">CTR</p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2 mb-4">
          {advertisement.targetUrl && (
            <div className="flex items-center text-sm">
              <ExternalLink size={14} className="mr-2 text-gray-400" />
              <a 
                href={advertisement.targetUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 truncate"
              >
                {advertisement.targetUrl}
              </a>
            </div>
          )}
        </div>

        {/* Date Range */}
        {advertisement.startDate && advertisement.endDate && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Calendar size={14} className="mr-2" />
            <span>
              {new Date(advertisement.startDate).toLocaleDateString('tr-TR')} - {new Date(advertisement.endDate).toLocaleDateString('tr-TR')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleStatus(advertisement.id)}
            className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              advertisement.status === 'active' 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {advertisement.status === 'active' ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
            {advertisement.status === 'active' ? 'Duraklat' : 'Başlat'}
          </button>
          <button 
            onClick={() => onEdit(advertisement)}
            className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => onDelete(advertisement.id)}
            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdCard;