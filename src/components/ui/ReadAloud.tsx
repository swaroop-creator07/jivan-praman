import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../i18n/useTranslation';

export function ReadAloud() {
  const { language } = useUIStore();
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const heading = document.querySelector('h1')?.textContent ?? '';
    const instr = document.querySelector('main p')?.textContent ?? '';
    const text = `${heading}. ${instr}`.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? t('read_aloud_stop') : t('read_aloud')}
      aria-pressed={speaking}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-bold text-[var(--color-info)] hover:bg-slate-100"
    >
      {speaking ? <VolumeX className="w-5 h-5" aria-hidden="true" /> : <Volume2 className="w-5 h-5" aria-hidden="true" />}
      <span className="hidden sm:inline">{speaking ? t('read_aloud_stop') : t('read_aloud')}</span>
    </button>
  );
}
