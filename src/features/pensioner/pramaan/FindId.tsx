import React, { useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { ArrowLeft, Search, MessageSquare, Smartphone, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FindPramaanId() {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'options' | 'aadhaar'>('options');
  const [aadhaar, setAadhaar] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      if (Math.random() < 0.2) setStatus('error');
      else setStatus('success');
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link to="/pramaan" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('find_pramaan_id')}</h1>
        </div>
      </div>

      {method === 'options' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-600 mb-6">How would you like to find your Pramaan ID?</p>
          
          <button 
            onClick={() => setMethod('aadhaar')}
            className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Search using Aadhaar</h3>
              <p className="text-slate-500">Find your active Pramaan ID using your Aadhaar number</p>
            </div>
          </button>

          <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Check your SMS</h3>
              <p className="text-slate-500">Search your phone messages for "Jeevan Pramaan" or "Pramaan ID"</p>
            </div>
          </div>

          <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Use the Mobile App</h3>
              <p className="text-slate-500">If you generated it recently, it may be visible in the Jeevan Pramaan app</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Link to="/pramaan/generate" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
              <HelpCircle className="w-5 h-5" /> I need to generate a new certificate instead
            </Link>
          </div>
        </div>
      )}

      {method === 'aadhaar' && status === 'idle' && (
        <form onSubmit={handleLookup} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label htmlFor="aadhaar" className="block text-sm font-bold text-slate-900 mb-2">
              Enter your Aadhaar Number
            </label>
            <input
              id="aadhaar"
              type="text"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-lg transition-shadow"
              placeholder="12-digit Aadhaar Number"
              disabled={status === 'loading'}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setMethod('options')}
              className="px-6 py-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={aadhaar.length !== 12 || status === 'loading'}
              className="flex-1 btn-primary disabled:opacity-50 font-bold text-lg py-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? t('loading') : t('submit')}
            </button>
          </div>
        </form>
      )}

      {status === 'loading' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-bold">Searching government records...</p>
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="bg-rose-50 border border-rose-200 p-8 rounded-2xl flex flex-col items-center text-center gap-4">
          <h3 className="text-xl font-bold text-rose-900">Lookup failed</h3>
          <p className="text-rose-800">We could not reach the repository. Please check your connection and try again.</p>
          <button onClick={() => setStatus('idle')} className="text-rose-700 font-bold underline">Try again</button>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">We found your Pramaan ID</h3>
            <p className="text-emerald-800">Your latest active certificate details are below.</p>
          </div>
          
          <div className="w-full bg-white rounded-xl p-6 border border-emerald-100 text-center mt-2 space-y-2">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Your Pramaan ID</p>
            <p className="font-bold text-4xl text-slate-900 tracking-wider">1234567890</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Link to="/pramaan/status" className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors">
              Check Status
            </Link>
            <Link to="/pramaan/download" className="flex-1 btn-primary font-bold py-3 px-4 rounded-xl shadow-sm transition-colors">
              Download Certificate
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
