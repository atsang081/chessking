import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from './translations/en.json';
import zhTWTranslations from './translations/zh-TW.json';
import zhCNTranslations from './translations/zh-CN.json';

export type Language = 'en' | 'zh-TW' | 'zh-CN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations = {
  en: enTranslations,
  'zh-TW': zhTWTranslations,
  'zh-CN': zhCNTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('chess-language');
    return (saved as Language) || 'zh-TW';
  });

  useEffect(() => {
    localStorage.setItem('chess-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters like {{winner}} with actual values
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || '');
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};