'use client';

import React, { createContext, useState, ReactNode, useMemo } from 'react';
import en from '@/locales/en.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';

type Language = 'en' | 'kn' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<string, any>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsData = { en, kn, ml };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations: translationsData[language],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
