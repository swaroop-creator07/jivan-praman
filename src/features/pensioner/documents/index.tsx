import React from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function Documents() {
  const { t } = useTranslation();
  const { loading, error, retry } = usePageLoad(500);

  const documents = [
    { id: 'ppo', name: 'Pension Payment Order (PPO)', date: 'Original Issue', desc: 'Your primary pension authorization document.', icon: <ShieldCheck className="w-6 h-6 text-indigo-600" /> },
    { id: 'dlc_2026', name: 'Digital Life Certificate - 2026', date: 'Generated: 12 Aug 2026', desc: 'Valid until 11 Aug 2027', icon: <FileText className="w-6 h-6 text-emerald-600" /> },
    { id: 'dlc_2025', name: 'Digital Life Certificate - 2025', date: 'Generated: 10 Aug 2025', desc: 'Expired', icon: <FileText className="w-6 h-6 text-slate-400" /> },
  ];

  if (loading) return <PageLoader message="Loading your documents…" />;
  if (error) return <div className="max-w-4xl mx-auto"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('documents_title')}</h1>
        <p className="text-slate-600 mt-1">{t('documents_sub')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                {doc.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{doc.date}</p>
                <p className="text-slate-600 mt-2 text-sm">{doc.desc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-lg font-bold text-indigo-900">Need Form 16?</h3>
           <p className="text-indigo-800 mt-1">Tax documents and Form 16 are usually provided by your pension disbursing bank.</p>
        </div>
        <a href="#" className="bg-white border border-indigo-200 text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap">
           Go to Bank Portal <ExternalLink className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
