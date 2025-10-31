/**
 * i18n Configuration
 * 
 * ACTIVE LANGUAGES: TR-TR, en-US
 * FUTURE: ar-SA, es-ES, de-DE, fr-FR, pt-BR, it-IT, ru-RU, zh-Hans-CN
 * 
 * To add a new language:
 * 1. Add locale to SUPPORTED_LOCALES (uncomment from FUTURE_LOCALES)
 * 2. Create translation file in /i18n/locales/{locale}.ts
 * 3. Import and add to translations object below
 */

export type Locale = 'tr-TR' | 'en-US';

export const DEFAULT_LOCALE: Locale = 'tr-TR';

export const SUPPORTED_LOCALES: Array<{
  code: Locale;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}> = [
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷', direction: 'ltr' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', direction: 'ltr' },
];

// Future languages (ready to activate)
export const FUTURE_LOCALES = [
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷', direction: 'ltr' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺', direction: 'ltr' },
  { code: 'zh-Hans-CN', name: '简体中文', flag: '🇨🇳', direction: 'ltr' },
];

export const isValidLocale = (locale: string): locale is Locale => {
  return SUPPORTED_LOCALES.some(l => l.code === locale);
};

export const getLocaleDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return SUPPORTED_LOCALES.find(l => l.code === locale)?.direction || 'ltr';
};

