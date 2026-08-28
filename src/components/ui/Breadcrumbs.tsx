import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

const keyMap: Record<string, string> = {
  pramaan: 'pramaan',
  status: 'status_title',
  'find-id': 'findid_title',
  download: 'download_title',
  generate: 'gen_title',
  history: 'hist_title',
  payments: 'payments_title',
  documents: 'documents_title',
  help: 'help_title',
  troubleshoot: 'troubleshoot_title',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  if (pathname === '/') return null;
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = keyMap[seg] ? t(keyMap[seg] as any) : seg.replace(/-/g, ' ');
    return { label, path, isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[var(--color-info)] font-semibold transition-colors rounded-lg px-2 py-1.5 hover:bg-slate-100 focus-visible:outline-none">
            <Home className="w-4 h-4" aria-hidden="true" /> {t('crumb_home')}
          </Link>
        </li>
        {crumbs.map(c => (
          <li key={c.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
            {c.isLast ? (
              <span aria-current="page" className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                {c.label}
              </span>
            ) : (
              <Link to={c.path} className="text-slate-500 hover:text-[var(--color-info)] font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
