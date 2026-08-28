import React from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { Phone, Mail, FileQuestion, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function Help() {
  const { t } = useTranslation();
  const { loading, error, retry } = usePageLoad(400);

  if (loading) return <PageLoader message="Loading help resources…" />;
  if (error) return <div className="max-w-4xl mx-auto"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-left space-y-4 pt-4 pb-8 border-b border-slate-200">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('help_title')}</h1>
        <p className="text-xl font-medium text-slate-600">{t('help_sub')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors group">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 mb-4 group-hover:bg-indigo-100 transition-colors">
             <Phone className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Toll-Free Helpline</h3>
          <p className="text-slate-600 mb-4">Call our dedicated support line for immediate assistance with Jeevan Pramaan.</p>
          <a href="tel:1800111555" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-lg hover:underline">
             1800 111 555
          </a>
          <p className="text-sm text-slate-500 mt-2">Available 9:00 AM to 6:00 PM (Mon-Sat)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors group">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 mb-4 group-hover:bg-emerald-100 transition-colors">
             <Mail className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
          <p className="text-slate-600 mb-4">Send us an email with your query and Pramaan ID. We typically respond within 24 hours.</p>
          <a href="mailto:jeevanpramaan@gov.in" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-lg hover:underline">
             jeevanpramaan@gov.in
          </a>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Self Service Resources</h2>
        <div className="grid grid-cols-1 gap-4">
          
          <Link to="/troubleshoot" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
               <FileQuestion className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">Troubleshooter Tool</h4>
              <p className="text-slate-500">Interactive tool to fix common issues with face authentication or rejected certificates.</p>
            </div>
          </Link>
          
          <Link to="/pramaan/generate" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
               <BookOpen className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">Step-by-Step Guides</h4>
              <p className="text-slate-500">Read the detailed instructions on how to generate your Digital Life Certificate using the Face App or PC.</p>
            </div>
          </Link>

        </div>
      </div>
      
    </div>
  );
}
