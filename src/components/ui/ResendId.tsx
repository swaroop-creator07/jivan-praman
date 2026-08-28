import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function ResendIdButton({ pramaanId }: { pramaanId: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'fail'>('idle');

  const send = () => {
    setState('sending');
    try {
      // Simulated SMS gateway — replace with a real call when a backend exists.
      setTimeout(() => {
        setState('sent');
      }, 1200);
    } catch {
      setState('fail');
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={send}
        disabled={state === 'sending'}
        aria-label={t('resend_sms')}
        className="bg-white border-2 border-[var(--color-info)] text-[var(--color-info)] font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 disabled:opacity-60"
      >
        <MessageSquare className="w-5 h-5" aria-hidden="true" />
        {t('resend_sms')}
      </button>
      {state === 'sending' && (
        <p className="text-sm font-bold text-[var(--color-muted)]">{t('resend_sms_sending')}</p>
      )}
      {state === 'sent' && (
        <p role="status" className="text-sm font-bold text-[var(--color-success)]">{t('resend_sms_sent')}</p>
      )}
      {state === 'fail' && (
        <p role="alert" className="text-sm font-bold text-[var(--color-danger)]">{t('resend_sms_fail')}</p>
      )}
    </div>
  );
}
