# i18n (Internationalization) System

## 📋 Overview

HZM Database Platform now supports **2 active languages** with a system ready to expand to 8 more languages in the future.

### ✅ Active Languages
- 🇹🇷 **Türkçe (TR-TR)** - Turkish
- 🇺🇸 **English (en-US)** - English (US)

### 🔜 Future Languages (Ready to Activate)
- 🇸🇦 العربية (ar-SA) - Arabic (RTL support ready)
- 🇪🇸 Español (es-ES) - Spanish
- 🇩🇪 Deutsch (de-DE) - German
- 🇫🇷 Français (fr-FR) - French
- 🇧🇷 Português (pt-BR) - Portuguese (Brazil)
- 🇮🇹 Italiano (it-IT) - Italian
- 🇷🇺 Русский (ru-RU) - Russian
- 🇨🇳 简体中文 (zh-Hans-CN) - Simplified Chinese

---

## 🚀 Usage

### 1. Basic Translation

```tsx
import { useI18n } from '@/i18n';

function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('common.save')}</h1>
      <p>{t('auth.loginSuccess')}</p>
    </div>
  );
}
```

### 2. With Parameters

```tsx
const { t } = useI18n();

<p>{t('validation.minLength', { min: 8 })}</p>
// Output: "En az 8 karakter olmalıdır" (TR) or "Must be at least 8 characters" (EN)
```

### 3. Change Language

```tsx
import { useI18n } from '@/i18n';

function LanguageSwitcher() {
  const { locale, changeLocale } = useI18n();
  
  return (
    <button onClick={() => changeLocale(locale === 'tr-TR' ? 'en-US' : 'tr-TR')}>
      Switch to {locale === 'tr-TR' ? 'English' : 'Türkçe'}
    </button>
  );
}
```

### 4. Use Language Selector Component

```tsx
import LanguageSelector from '@/components/shared/LanguageSelector';

function MyPage() {
  return (
    <div>
      <LanguageSelector /> {/* Default variant */}
      <LanguageSelector variant="compact" /> {/* Compact variant */}
    </div>
  );
}
```

---

## 📁 File Structure

```
src/i18n/
├── config.ts              # Language configuration (supported locales, RTL)
├── I18nContext.tsx        # React Context Provider + useI18n hook
├── index.ts               # Central export point
├── locales/
│   ├── tr-TR.ts          # Turkish translations
│   ├── en-US.ts          # English translations
│   └── [future locales]  # ar-SA.ts, es-ES.ts, etc.
└── README.md             # This file
```

---

## ➕ Adding a New Language

### Step 1: Uncomment from `config.ts`

Move a language from `FUTURE_LOCALES` to `SUPPORTED_LOCALES`:

```typescript
export const SUPPORTED_LOCALES = [
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷', direction: 'ltr' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', direction: 'ltr' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', direction: 'rtl' }, // NEW!
];
```

### Step 2: Create Translation File

Create `src/i18n/locales/ar-SA.ts`:

```typescript
import { TranslationKeys } from './tr-TR';

export const arSA: TranslationKeys = {
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    // ... all other translations
  },
  // ... complete all sections
};
```

### Step 3: Import in `I18nContext.tsx`

```typescript
import { arSA } from './locales/ar-SA';

const translations: Record<Locale, TranslationKeys> = {
  'tr-TR': trTR,
  'en-US': enUS,
  'ar-SA': arSA, // NEW!
};
```

### Step 4: Update Type

```typescript
export type Locale = 'tr-TR' | 'en-US' | 'ar-SA'; // Add new locale
```

---

## 🌐 RTL (Right-to-Left) Support

The system automatically detects RTL languages (like Arabic) and applies `dir="rtl"` to the HTML element.

```typescript
// In config.ts
{ code: 'ar-SA', name: 'العربية', flag: '🇸🇦', direction: 'rtl' }
```

The `I18nContext` automatically sets:
- `document.documentElement.dir = 'rtl'` for Arabic
- `document.documentElement.dir = 'ltr'` for others

---

## 📝 Translation Keys

All translation keys are typed via `TranslationKeys` (derived from `trTR`).

### Available Categories:
- `common.*` - Common UI elements (save, cancel, delete, etc.)
- `auth.*` - Authentication (login, register, password, etc.)
- `navigation.*` - Navigation items (home, dashboard, projects, etc.)
- `projects.*` - Project management
- `users.*` - User management
- `organizations.*` - Organization management
- `apiKeys.*` - API key management
- `errors.*` - Error messages
- `validation.*` - Form validation messages

---

## 💾 Persistence

The selected language is automatically saved to `localStorage` under the key `hzm-locale`.

```typescript
// Automatic save on change
changeLocale('en-US');
// → localStorage.setItem('hzm-locale', 'en-US');
```

---

## 🔧 Configuration

### Default Language

Edit `src/i18n/config.ts`:

```typescript
export const DEFAULT_LOCALE: Locale = 'tr-TR'; // Change to 'en-US' if needed
```

### Storage Key

Edit `src/i18n/I18nContext.tsx`:

```typescript
const LOCALE_STORAGE_KEY = 'hzm-locale'; // Change if needed
```

---

## ✅ Implementation Checklist

- [x] i18n configuration (`config.ts`)
- [x] Turkish translations (`tr-TR.ts`)
- [x] English translations (`en-US.ts`)
- [x] Context Provider (`I18nContext.tsx`)
- [x] `useI18n()` hook
- [x] Language Selector component
- [x] Integration with App.tsx (`I18nProvider`)
- [x] Example usage (System Settings page)
- [x] RTL support for future Arabic
- [x] LocalStorage persistence
- [x] Type safety (TypeScript)

---

## 🎯 Next Steps

1. **Gradually replace hard-coded text** in existing components with `t()` calls
2. **Add more translation keys** as needed (e.g., `dashboard.*`, `reports.*`)
3. **Activate future languages** when translations are ready
4. **Connect to backend** (optional: sync `default_language` from `core.tenants` table)

---

## 📚 Documentation

For more information, see:
- Main README: `/HzmVeriTabaniFrontend/README.md`
- Backend i18n: `/HzmVeriTabaniBackend/docs/roadmap/06-Localization/01_i18n_System.md`

---

**Last Updated:** October 31, 2025  
**Version:** 1.0.0  
**Status:** ✅ Active (TR-TR, en-US)

