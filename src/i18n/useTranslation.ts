import { useCallback } from 'react';
import { useUIStore } from '../store/useUIStore';
import { translations, TranslationKey } from './translations';

export const useTranslation = () => {
  const language = useUIStore((state) => state.language);
  
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let str = translations[language][key] || translations['en'][key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }, [language]);

  return { t, language };
};
