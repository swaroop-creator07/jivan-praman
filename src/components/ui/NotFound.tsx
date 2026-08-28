import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="max-w-xl mx-auto text-center py-12 space-y-6">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
        <FileQuestion className="w-10 h-10 text-slate-400" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('notfound_title')}</h1>
        <p className="text-slate-600 mt-3 text-lg">{t('notfound_desc')}</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link to="/" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl">
          <Home className="w-5 h-5" aria-hidden="true" /> {t('home')}
        </Link>
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5" aria-hidden="true" /> {t('notfound_back')}
        </button>
      </div>
      <p className="text-sm text-slate-400">Error code: 404</p>
    </div>
  );
}
