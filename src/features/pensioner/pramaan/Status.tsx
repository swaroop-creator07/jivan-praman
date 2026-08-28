import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Search, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { useAria } from '../../../store/useAriaStore';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

type Result =
  | { found: true; pramaanId: string; status: string; rejectionReason: string | null; validUntil: string | null }
  | { found: false };

const stages = [
  { key: 'Submitted', label: 'Certificate Generated & Submitted' },
  { key: 'Repository Uploaded', label: 'Uploaded to Government Repository' },
  { key: 'Under PDA Verification', label: 'Sent to Bank for Verification' },
  { key: 'Approved', label: 'Verified by Bank' },
];

export default function PramaanStatus() {
  const { t, language } = useTranslation();
  const { pensioner } = useStore();
  const { announce } = useAria();
  const { loading, error, retry } = usePageLoad(600);

  const [id, setId] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!loading && !error) announce(t('status_title') + ' loaded.');
  }, [loading, error, announce, t]);

  if (loading) return <PageLoader message="Loading status checker…" />;
  if (error) return <div className="max-w-3xl"><ErrorState message={error} onRetry={retry} /></div>;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const value = id.trim();
    if (!value) { setResult(null); return; }
    const match = pensioner.dlcHistory.find(d => d.pramaanId === value);
    if (match) {
      setResult({ found: true, pramaanId: match.pramaanId, status: match.status, rejectionReason: match.rejectionReason, validUntil: match.validUntil });
      announce(t('status_pramaan_id') + ': ' + match.status);
    } else if (value === '1234567890') {
      setResult({ found: true, pramaanId: value, status: 'Approved', rejectionReason: null, validUntil: '2026-06-30' });
      announce(t('status_pramaan_id') + ': Approved');
    } else {
      setResult({ found: false });
      announce(t('status_not_found_title'));
    }
  };

  const getStageState = (stageKey: string, index: number, status: string) => {
    if (status === 'Rejected') {
      const rejectedIndex = stages.findIndex(s => s.key === 'Under PDA Verification');
      if (index < rejectedIndex) return 'completed';
      if (index === rejectedIndex) return 'rejected';
      return 'pending';
    }
    const currentIndex = stages.findIndex(s => s.key === status);
    if (currentIndex === -1) return 'pending';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-3xl space-y-6 text-left">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4 text-left">
        <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={t('back')}>
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </Link>
        <h1 className="text-left !text-[26px]">{t('status_title')}</h1>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 text-left">
        <label htmlFor="statusId" className="block font-bold text-lg">{t('status_enter_id')}</label>
        <p className="text-sm text-[var(--color-muted)] mt-1 mb-4">{t('status_enter_hint')} <span className="font-mono font-bold">{pensioner.dlcHistory[0]?.pramaanId}</span> {language === 'hi' ? 'या 1234567890।' : 'or 1234567890.'}</p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 text-left">
          <input
            id="statusId"
            type="text"
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="e.g. 1234567890"
            className="flex-1 px-4 py-3.5 rounded-lg border-2 border-[var(--color-border)] focus:border-[var(--color-info)] outline-none text-lg font-bold font-mono"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 btn-primary font-bold px-6 py-3.5 rounded-lg">
            <Search className="w-5 h-5" aria-hidden="true" /> {t('status_check')}
          </button>
        </form>
      </div>

      {result && 'found' in result && !result.found && (
        <div className="bg-[var(--color-warn-bg)] border-2 border-[var(--color-warn)]/30 rounded-lg p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center"><FileQuestion className="w-8 h-8 text-[var(--color-warn)]" aria-hidden="true" /></div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text)]">{t('status_not_found_title')}</h3>
            <p className="text-[var(--color-muted)] mt-2">{t('status_not_found_desc')}</p>
          </div>
          <Link to="/pramaan/generate" className="btn-primary font-bold px-6 py-3 rounded-lg">{t('dash_start_renewal')}</Link>
        </div>
      )}

      {result && 'found' in result && result.found && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-5 flex gap-4 ${result.status === 'Rejected' ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/30' : result.status === 'Approved' ? 'bg-white border-[var(--color-border)]' : 'bg-[var(--color-warn-bg)] border-[var(--color-warn)]/30'}`}>
            <div className="shrink-0 mt-1">
              {result.status === 'Rejected' ? <XCircle className="w-10 h-10 text-[var(--color-danger)]" aria-hidden="true" />
                : result.status === 'Approved' ? <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" aria-hidden="true" />
                : <Clock className="w-10 h-10 text-[var(--color-warn)]" aria-hidden="true" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('status_pramaan_id')}</p>
              <h2 className="font-mono font-bold text-lg">{result.pramaanId}</h2>
              <p className="text-sm font-semibold mt-1">{result.status}</p>
              {result.validUntil && <p className="text-sm text-[var(--color-muted)]">{t('status_valid_until')}: {result.validUntil}</p>}
            </div>
          </div>

          {result.status === 'Rejected' && (
            <div className="bg-[var(--color-danger-bg)] border-2 border-[var(--color-danger)]/30 rounded-lg p-6 text-left">
              <h3 className="text-lg font-bold text-[var(--color-danger)]">{t('status_action_req')}</h3>
              <p className="text-[var(--color-danger)] mt-1 font-medium">{result.rejectionReason || t('status_rejected_desc')}</p>
              <Link to="/pramaan/generate" className="inline-flex mt-4 btn-primary font-bold px-6 py-3 rounded-lg">{t('gen_submit')}</Link>
            </div>
          )}

          <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-10 text-left">
            <h3 className="text-left font-bold text-lg mb-8">{t('status_tracking')}</h3>
            <div className="space-y-6">
              {stages.map((stage, idx) => {
                const state = getStageState(stage.key, idx, result.status);
                return (
                  <div key={stage.key} className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0
                      ${state === 'completed' ? 'bg-[var(--color-success)] text-white' :
                        state === 'current' ? 'bg-[var(--color-warn)] text-white' :
                        state === 'rejected' ? 'bg-[var(--color-danger)] text-white' :
                        'bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)]'}`}>
                      {state === 'completed' && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                      {state === 'current' && <Clock className="w-5 h-5" aria-hidden="true" />}
                      {state === 'rejected' && <XCircle className="w-5 h-5" aria-hidden="true" />}
                      {state === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]" aria-hidden="true" />}
                    </div>
                    <div className={`flex-1 pb-2 border-b border-[var(--color-border)] last:border-0 ${idx === stages.length - 1 ? 'border-b-0' : ''}`}>
                      <p className={`font-bold ${state === 'rejected' ? 'text-[var(--color-danger)]' : state === 'current' ? 'text-[var(--color-warn)]' : state === 'completed' ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>{stage.label}</p>
                      {state === 'rejected' && <p className="text-sm text-[var(--color-danger)] mt-1 font-medium">{result.rejectionReason}</p>}
                      {state === 'current' && <p className="text-sm text-[var(--color-warn)] mt-1 font-medium">{language === 'hi' ? 'प्रगति में। 3 कार्य दिवसों तक प्रतीक्षा करें।' : 'In progress. Allow up to 3 working days.'}</p>}
                      {state === 'completed' && <p className="text-sm text-[var(--color-success)] mt-1">{language === 'hi' ? 'सफलतापूर्वक पूर्ण हुआ।' : 'Completed successfully.'}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!searched && (
        <p className="text-sm text-[var(--color-muted)] text-center">{t('status_no_search')}</p>
      )}
    </div>
  );
}
