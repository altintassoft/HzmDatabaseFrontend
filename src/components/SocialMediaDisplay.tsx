import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  title: string;
  icon: string;
  color: string;
  isActive: boolean;
  displayLocation: string;
}

interface SocialMediaDisplayProps {
  links: SocialMediaLink[];
  location: 'header' | 'footer' | 'sidebar' | 'contact' | 'about';
  className?: string;
}

const SocialMediaDisplay: React.FC<SocialMediaDisplayProps> = ({
  links,
  location,
  className = ''
}) => {
  const filteredLinks = links.filter(link => 
    link.isActive && link.displayLocation === location
  );

  if (filteredLinks.length === 0) return null;

  const getLocationStyles = () => {
    switch (location) {
      case 'header':
        return 'flex items-center space-x-3';
      case 'footer':
        return 'flex items-center justify-center space-x-4';
      case 'sidebar':
        return 'flex flex-col space-y-2';
      case 'contact':
      case 'about':
        return 'flex items-center space-x-4';
      default:
        return 'flex items-center space-x-3';
    }
  };

  return (
    <div className={`${getLocationStyles()} ${className}`}>
      {filteredLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} text-white p-2 rounded-full hover:opacity-80 transition-opacity flex items-center justify-center group`}
          title={link.title}
        >
          <span className="text-lg">{link.icon}</span>
          {location === 'sidebar' && (
            <span className="ml-2 text-sm font-medium">{link.title}</span>
          )}
          <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
};

export default SocialMediaDisplay;