import { useCallback } from 'react';
import { useUIStore } from '../store/useUIStore';
import { translations, TranslationKey } from './translations';

export const useTranslation = () => {
  const language = useUIStore((state) => state.language);
  
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return { t, language };
};
