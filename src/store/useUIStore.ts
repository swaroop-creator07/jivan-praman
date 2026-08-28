import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../i18n/translations';

type FontSize = 'small' | 'base' | 'large';

interface UIState {
  language: Language;
  fontSize: FontSize;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: FontSize) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      fontSize: 'base',
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'updp-ui-settings' }
  )
);
