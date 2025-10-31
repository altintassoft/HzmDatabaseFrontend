/**
 * Language Selector Component
 * Dropdown to switch between supported languages
 * 
 * USAGE:
 *   <LanguageSelector />
 *   <LanguageSelector variant="compact" />
 */

import { Globe } from 'lucide-react';
import { useI18n } from '../../i18n';
import { SUPPORTED_LOCALES } from '../../i18n/config';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'default', 
  className = '' 
}: LanguageSelectorProps) {
  const { locale, changeLocale } = useI18n();

  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale);

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={locale}
          onChange={(e) => changeLocale(e.target.value as any)}
          className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          aria-label="Select language"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>
        <Globe 
          size={16} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" 
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Globe size={16} className="mr-2" />
        Language / Dil
      </label>
      
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as any)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
        aria-label="Select language"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
      
      {currentLocale && (
        <p className="text-xs text-gray-500">
          Current: {currentLocale.flag} {currentLocale.name}
        </p>
      )}
    </div>
  );
}

