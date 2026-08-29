import React, { useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { Download, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DownloadDLC() {
  const { t } = useTranslation();
  const [pramaanId, setPramaanId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'not_found'>('idle');

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pramaanId.trim()) return;
    
    setStatus('loading');
    setTimeout(() => {
      if (pramaanId === '1234567890') {
        setStatus('success');
      } else if (pramaanId === 'error') {
        setStatus('error');
      } else {
        setStatus('not_found');
      }
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link to="/pramaan" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('download_dlc')}</h1>
        </div>
      </div>

      <form onSubmit={handleDownload} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label htmlFor="pramaanId" className="block text-sm font-bold text-slate-900 mb-2">
            Enter your Pramaan ID
          </label>
          <p className="text-sm text-slate-500 mb-1">{t('gen_demo_number')}</p>
          <input
            id="pramaanId"
            type="text"
            value={pramaanId}
            onChange={(e) => setPramaanId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-lg transition-shadow"
            placeholder="e.g., 1234567890"
            disabled={status === 'loading' || status === 'success'}
          />
        </div>

        {status === 'idle' && (
          <button
            type="submit"
            disabled={!pramaanId.trim()}
            className="w-full btn-primary disabled:opacity-50 font-bold text-lg py-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        )}

        {status === 'loading' && (
          <div className="w-full bg-slate-100 text-slate-500 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            Generating Secure PDF...
          </div>
        )}
        
        {status === 'success' && (
          <div className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Ready
            </div>
            <p className="text-sm font-medium text-emerald-100">Your browser should start the download automatically.</p>
          </div>
        )}
      </form>
      
      {status === 'success' && (
         <div className="text-center">
            <button onClick={() => setStatus('idle')} className="text-indigo-600 font-bold hover:underline">
              Download another certificate
            </button>
         </div>
      )}

      {status === 'not_found' && (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AlertTriangle className="w-16 h-16 text-slate-400" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('not_found')}</h3>
            <p className="text-slate-600">We could not find a Digital Life Certificate with that ID to download. Please check the number.</p>
          </div>
          <button onClick={() => setStatus('idle')} className="mt-4 text-indigo-600 font-bold hover:underline">
            {t('retry')}
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AlertTriangle className="w-16 h-16 text-rose-600" />
          <div>
            <h3 className="text-xl font-bold text-rose-900 mb-2">Download failed</h3>
            <p className="text-rose-800">We couldn't securely generate the PDF right now. Please try again.</p>
          </div>
          <button onClick={() => setStatus('idle')} className="mt-4 text-rose-700 font-bold hover:underline">
            {t('retry')}
          </button>
        </div>
      )}

    </div>
  );
}
