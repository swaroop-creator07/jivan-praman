import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

export function ReminderStub() {
  const { t } = useTranslation();
  const [on, setOn] = useState(false);
  const [contact, setContact] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem('jp-reminder', JSON.stringify({ on, contact }));
    } catch { /* ignore */ }
    setSaved(true);
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 text-left">
      <h3 className="font-bold text-lg">{t('remind_title')}</h3>
      <p className="text-[var(--color-muted)] mt-1">{t('remind_desc')}</p>
      <label className="flex items-center gap-3 mt-4 font-bold cursor-pointer">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="w-6 h-6" />
        {t('remind_consent')}
      </label>
      {on && (
        <div className="mt-3">
          <label htmlFor="remindContact" className="block font-semibold">{t('remind_contact')}</label>
          <input id="remindContact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="mobile or email" className="w-full p-3.5 rounded-lg border-2 border-slate-300 mt-1 text-lg" />
        </div>
      )}
      <button onClick={save} className="btn-primary mt-4 px-6 py-3 rounded-lg font-bold">{t('remind_title')}</button>
      {saved && <p role="status" className="text-sm font-bold text-[var(--color-success)] mt-2">{t('remind_saved')}</p>}
    </div>
  );
}
