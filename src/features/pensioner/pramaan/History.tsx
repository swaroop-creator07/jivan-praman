import { Link } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { useTranslation } from '../../../i18n/useTranslation';
import { ArrowLeft } from 'lucide-react';
import { ResendIdButton } from '../../../components/ui/ResendId';
import { StatusBadge } from '../../../components/ui/StatusBadge';

const STATUS_KEY: Record<string, string> = {
  Submitted: 'st_submitted',
  'Repository Uploaded': 'st_repository',
  'Under PDA Verification': 'st_pda',
  Approved: 'st_approved',
  Rejected: 'st_rejected',
};

export default function History() {
  const { pensioner } = useStore();
  const { t, language } = useTranslation();

  const history = [...pensioner.dlcHistory].sort((a, b) =>
    (b.generatedOn || '').localeCompare(a.generatedOn || '')
  );

  return (
    <div className="max-w-3xl space-y-6 text-left">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={t('hist_back_dash')}>
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </Link>
        <h1 className="!text-[26px] text-left">{t('hist_title')}</h1>
      </div>

      <p className="text-[var(--color-muted)]">{t('hist_sub')}</p>

      {history.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8">
          <p className="text-[var(--color-muted)]">{t('hist_none')}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {history.map((rec) => (
            <li key={rec.pramaanId} className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('hist_date')}</p>
                  <p className="text-lg font-bold">
                    {new Date(rec.generatedOn).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={t(STATUS_KEY[rec.status] || 'st_submitted')} tone={rec.status} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('hist_id')}</p>
              <p className="text-2xl font-bold font-mono tracking-widest">{rec.pramaanId}</p>
              {rec.status === 'Rejected' && rec.rejectionReason && (
                <p className="text-sm font-bold text-[var(--color-danger)]">{rec.rejectionReason}</p>
              )}
              <ResendIdButton pramaanId={rec.pramaanId} />
            </li>
          ))}
        </ul>
      )}

      <Link to="/" className="inline-flex px-6 py-3 rounded-lg font-bold border border-[var(--color-border)]">{t('hist_back_dash')}</Link>
    </div>
  );
}
