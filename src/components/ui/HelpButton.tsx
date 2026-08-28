import { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function HelpButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t('call_title')}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[var(--color-info)] px-5 py-4 text-white font-bold shadow-lg hover:opacity-90"
      >
        <Phone className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">{t('call_title')}</span>
      </button>

      {open && (
        <div className="help-panel" role="dialog" aria-label={t('call_title')}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{t('call_title')}</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('back')}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-[var(--color-muted)]">{t('help_desc')}</p>
          <p className="mt-3 font-bold text-lg">{t('help_number')}</p>
          <p className="text-[var(--color-muted)]">{t('help_hours')}</p>
          <a
            href="tel:1800111555"
            className="btn-primary mt-4 w-full rounded-lg px-6 py-4 font-bold inline-flex items-center justify-center gap-2"
          >
            {t('help_number')}
          </a>
        </div>
      )}
    </>
  );
}
