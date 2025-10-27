'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/context/language-context';

function getNestedValue(obj: Record<string, any>, key: string): string {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj) || key;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { translations } = context;

  const t = (key: string): string => {
    return getNestedValue(translations, key);
  };

  return { ...context, t };
}
