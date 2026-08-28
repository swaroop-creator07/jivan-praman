import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { Search, Download, FileText, FileCheck2, HelpCircle, MapPin } from 'lucide-react';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function PramaanHub() {
  const { t } = useTranslation();
  const { loading, error, retry } = usePageLoad(300);

  if (loading) return <PageLoader message="Loading Pramaan services…" />;
  if (error) return <div className="max-w-3xl mx-auto"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div className="text-left space-y-4 pt-4 pb-8 border-b border-slate-200">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('pramaan_title')}</h1>
        <p className="text-xl font-medium text-slate-600">{t('pramaan_subtitle')}</p>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed mt-4">
          {t('pramaan_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        
        <Link to="/pramaan/status" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <FileCheck2 className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-bold text-xl text-slate-900">{t('check_my_status')}</h4>
            <p className="text-slate-500 mt-1">Check if your life certificate is valid and accepted by your pension agency.</p>
          </div>
        </Link>

        <Link to="/pramaan/find-id" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <Search className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-bold text-xl text-slate-900">{t('get_my_pramaan_id')}</h4>
            <p className="text-slate-500 mt-1">Find your unique Pramaan ID required for downloading your certificate.</p>
          </div>
        </Link>

        <Link to="/pramaan/download" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <Download className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-bold text-xl text-slate-900">{t('download_my_dlc')}</h4>
            <p className="text-slate-500 mt-1">Download a PDF copy of your Digital Life Certificate for your records.</p>
          </div>
        </Link>

        <Link to="/pramaan/generate" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-bold text-xl text-slate-900">{t('create_new_pramaan')}</h4>
            <p className="text-slate-500 mt-1">Learn how to generate a new Digital Life Certificate securely.</p>
          </div>
        </Link>
        
      </div>

      <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/pramaan/generate" className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-4">
           <MapPin className="w-6 h-6 text-slate-600 shrink-0" />
           <span className="font-bold text-lg text-slate-800">{t('renew_lc')}</span>
        </Link>
        
        <Link to="/troubleshoot" className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-4">
           <HelpCircle className="w-6 h-6 text-slate-600 shrink-0" />
           <span className="font-bold text-lg text-slate-800">{t('troubleshoot')}</span>
        </Link>
      </div>

    </div>
  );
}
