import { create } from 'zustand';

interface AriaState {
  message: string;
  announce: (msg: string) => void;
}

export const useAria = create<AriaState>((set) => ({
  message: '',
  announce: (msg) => {
    set({ message: '' }); 
    setTimeout(() => set({ message: msg }), 50);
  },
}));
