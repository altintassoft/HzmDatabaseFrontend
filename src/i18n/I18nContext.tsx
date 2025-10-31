/**
 * i18n Context Provider
 * Provides translation functionality and locale management across the app
 * 
 * USAGE:
 *   const { t, locale, changeLocale } = useI18n();
 *   <h1>{t('common.save')}</h1>
 *   <button onClick={() => changeLocale('en-US')}>Switch to English</button>
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, isValidLocale, getLocaleDirection } from './config';
import { trTR, TranslationKeys } from './locales/tr-TR';
import { enUS } from './locales/en-US';

const translations: Record<Locale, TranslationKeys> = {
  'tr-TR': trTR,
  'en-US': enUS,
};

interface I18nContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'hzm-locale';

// Helper to get nested translation value
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return key if not found
    }
  }
  
  return typeof value === 'string' ? value : path;
};

// Helper to replace template variables
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, text);
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize locale from localStorage or default
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      return stored as Locale;
    }
    return DEFAULT_LOCALE;
  });

  // Update HTML lang attribute and direction on locale change
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);

  const changeLocale = (newLocale: Locale) => {
    if (isValidLocale(newLocale)) {
      setLocale(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[locale];
    const value = getNestedValue(translation, key);
    return replaceParams(value, params);
  };

  const value: I18nContextType = {
    locale,
    changeLocale,
    t,
    direction: getLocaleDirection(locale),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

