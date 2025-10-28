import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Advertisement } from '../types';

interface AdDisplayProps {
  advertisement: Advertisement;
  location: Advertisement['displayLocation'];
  onClose?: () => void;
  className?: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({
  advertisement,
  location,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate ad loading
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (advertisement.targetUrl) {
      window.open(advertisement.targetUrl, '_blank', 'noopener,noreferrer');
      
      // Track click (burada analytics'e gönderebiliriz)
      console.log('Ad clicked:', advertisement.id);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !isLoaded) return null;

  const getLocationStyles = () => {
    switch (location) {
      case 'header':
        return 'fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white p-2 text-center';
      case 'sidebar':
        return 'fixed right-4 top-1/2 transform -translate-y-1/2 z-30 w-64 bg-white shadow-lg rounded-lg border';
      case 'footer':
        return 'fixed bottom-0 left-0 right-0 z-40 bg-gray-800 text-white p-3 text-center';
      case 'popup':
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      case 'banner':
        return 'w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 text-center';
      case 'inline':
        return 'w-full bg-gray-50 border border-gray-200 rounded-lg p-4 my-4';
      default:
        return 'w-full bg-white border border-gray-200 rounded-lg p-4';
    }
  };

  const renderAdContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{advertisement.title}</h4>
        {advertisement.description && (
          <p className="text-xs opacity-90 mt-1">{advertisement.description}</p>
        )}
      </div>
      {advertisement.imageUrl && (
        <img 
          src={advertisement.imageUrl} 
          alt={advertisement.title}
          className="w-16 h-16 object-cover rounded ml-4"
        />
      )}
      {onClose && (
        <button
          onClick={handleClose}
          className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );

  if (location === 'popup') {
    return (
      <div className={getLocationStyles()}>
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
          <div 
            onClick={handleClick}
            className="cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">{advertisement.title}</h3>
            {advertisement.description && (
              <p className="text-gray-600 mb-4">{advertisement.description}</p>
            )}
            {advertisement.imageUrl && (
              <img 
                src={advertisement.imageUrl} 
                alt={advertisement.title}
                className="w-full h-32 object-cover rounded mb-4"
              />
            )}
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getLocationStyles()} ${className}`}>
      <div 
        onClick={handleClick}
        className="cursor-pointer hover:opacity-90 transition-opacity"
      >
        {renderAdContent()}
      </div>
    </div>
  );
};

export default AdDisplay;