// src/context/LanguageProvider.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Available languages in RightRoute
export type Language = 'en' | 'lg' | 'sw'; // English, Luganda, Swahili

// i18n initialization
i18n
  .use(Backend) // Loads translations from /public/locales
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // Fallback language if translation is missing
    load: 'languageOnly', // Only load specific language (e.g., 'en' not 'en-US')
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    detection: {
      order: ['localStorage', 'navigator'], // Order of language detection
      caches: ['localStorage'], // Cache detected language
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    debug: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  });

interface LanguageContextType {
  language: Language;
  changeLanguage: (lng: Language) => void;
  t: (key: string) => string; // Expose the translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation();
  const [language, setLanguage] = useState<Language>(i18nInstance.language as Language || 'en');

  useEffect(() => {
    // Update state if i18n language changes (e.g., detected from browser)
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng as Language);
    };
    i18nInstance.on('languageChanged', handleLanguageChanged);
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged);
    };
  }, [i18nInstance]);

  const changeLanguage = (lng: Language) => {
    i18nInstance.changeLanguage(lng);
    setLanguage(lng);
    // Optionally persist language preference to the backend or local storage
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
