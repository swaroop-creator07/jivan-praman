import { useStore } from '../../store/useStore';
import { useTranslation } from '../../i18n/useTranslation';

export function CountdownBanner() {
  const { pensioner } = useStore();
  const { t } = useTranslation();
  const due = pensioner.nextDlcDueDate;
  if (!due) return null;
  const dueDate = new Date(due + 'T00:00:00');
  const days = Math.round((dueDate.getTime() - Date.now()) / 86400000);
  if (days > 60) return null;
  const msg = days > 0 ? t('days_left').replace('{n}', String(days)) : t('days_overdue');
  return (
    <div className="countdown-banner" role="status" aria-live="polite">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center text-sm font-bold">
        {msg}
      </div>
    </div>
  );
}
