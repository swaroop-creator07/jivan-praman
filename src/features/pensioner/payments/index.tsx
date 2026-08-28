import React, { useEffect } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { IndianRupee, ArrowDownCircle, Search, Calendar, FileText, AlertTriangle, Clock } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { Link } from 'react-router-dom';
import { useAria } from '../../../store/useAriaStore';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function Payments() {
  const { t } = useTranslation();
  const { pensioner } = useStore();
  const { announce } = useAria();
  const { loading, error, retry } = usePageLoad(700);

  const payments = pensioner.pensionPayments;
  const lastCredited = payments.find(p => p.status === 'Credited');
  
  const latestDlc = pensioner.dlcHistory[0];
  const isDlcValidOrProcessing = latestDlc?.status === 'Approved' || latestDlc?.status === 'Submitted' || latestDlc?.status === 'Under PDA Verification';

  useEffect(() => {
    if (!loading && !error) announce(`Payment history loaded. Showing ${payments.length} recent transactions.`);
  }, [announce, payments.length, loading, error]);

  if (loading) return <PageLoader message="Fetching payment history…" />;
  if (error) return <div className="max-w-4xl mx-auto"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]" tabIndex={0}>{t('payments_title')}</h1>
          <p className="text-slate-600 mt-1 text-lg">{t('payments_sub')}</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-3 rounded-xl shadow-sm flex items-center gap-2 transition-colors focus:ring-4 focus:ring-indigo-300 outline-none">
           <FileText className="w-5 h-5" aria-hidden="true" />
           Download Statement
        </button>
      </div>

      {lastCredited && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
             <p className="text-indigo-200 font-bold text-lg mb-1 uppercase tracking-widest">Last Payment Received</p>
             <h2 className="text-5xl font-bold flex items-center gap-1">
               <IndianRupee className="w-10 h-10" aria-hidden="true" />
               {lastCredited.amount.toLocaleString('en-IN')}
             </h2>
             <p className="text-white mt-3 text-lg font-medium">Credited on {lastCredited.creditedOn} to {pensioner.pda.name} ({pensioner.pda.accountMasked})</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <h3 className="text-2xl font-bold text-[var(--color-text)]" tabIndex={0}>Recent Transactions</h3>
           <div className="relative w-full sm:w-auto">
             <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
             <input 
                type="text" 
                placeholder="Search payments..." 
                className="pl-12 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-indigo-300 w-full sm:w-72 text-lg font-medium"
                aria-label="Search payment history"
             />
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {payments.map(payment => {
              const isHeld = payment.status.includes('Held');
              const isPending = payment.status === 'Pending';
              
              return (
                <div key={payment.id} className={`p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors ${isHeld ? 'bg-rose-50/50' : ''}`}>
                   <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 
                        ${isHeld ? 'bg-rose-100' : isPending ? 'bg-amber-100' : 'bg-emerald-100'}`} aria-hidden="true">
                        {isHeld ? <AlertTriangle className="w-7 h-7 text-rose-600" /> : 
                         isPending ? <Clock className="w-7 h-7 text-amber-600" /> : 
                         <ArrowDownCircle className="w-7 h-7 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[var(--color-text)] flex flex-wrap items-center gap-3">
                          {payment.month} {payment.year}
                          <span className={`text-[12px] uppercase tracking-widest px-3 py-1 rounded-lg font-bold
                            ${isHeld ? 'bg-rose-200 text-rose-900' : isPending ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
                            {payment.status}
                          </span>
                        </h4>
                        <p className="text-slate-600 text-base font-medium flex items-center gap-2 mt-2">
                          <Calendar className="w-5 h-5" aria-hidden="true" />
                          {payment.creditedOn ? `Credited: ${payment.creditedOn}` : 'Expected soon'} 
                        </p>
                        
                        {isHeld && !isDlcValidOrProcessing && (
                          <div className="mt-4 bg-white border border-rose-200 p-4 rounded-xl">
                            <p className="text-rose-800 font-bold mb-2">This payment requires action</p>
                            <Link to="/pramaan/generate" className="text-indigo-700 font-bold hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
                              Generate Life Certificate to release payment
                            </Link>
                          </div>
                        )}
                        {isHeld && isDlcValidOrProcessing && (
                          <div className="mt-4 bg-white border border-amber-200 p-4 rounded-xl">
                            <p className="text-amber-800 font-bold mb-2">Processing Payment</p>
                            <p className="text-amber-700 text-sm">Your Life Certificate has been submitted. This payment will be released shortly once the bank verifies it.</p>
                          </div>
                        )}
                      </div>
                   </div>
                   
                   <div className="text-left sm:text-right w-full sm:w-auto pl-[72px] sm:pl-0">
                      <span className={`text-2xl font-bold flex items-center sm:justify-end gap-1 ${isHeld ? 'text-slate-400' : 'text-[var(--color-text)]'}`}>
                        <IndianRupee className="w-6 h-6" aria-hidden="true" />{payment.amount.toLocaleString('en-IN')}
                      </span>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
