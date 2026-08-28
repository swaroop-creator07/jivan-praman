import React from 'react';
import { useStore } from '../../store/useStore';
import { PensionState, Role, Exception } from '../../types';
import { Landmark, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function BankDashboard() {
  const { cases, resolveBankException } = useStore();
  
  // Get cases relevant to BANK (mock filtering)
  const exceptions = cases.flatMap(c => c.exceptions.filter(e => e.owner === Role.BANK && e.status !== 'RESOLVED'));
  const activeBankExceptions = cases.filter(c => c.currentState === PensionState.BANK_EXCEPTION);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bank / CPPC Operations</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage payment exceptions and account validations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <AlertOctagon className="w-16 h-16 text-rose-50 opacity-50" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-800 mb-1">Payment Validation Failures</p>
            <p className="text-3xl font-bold text-rose-600">{activeBankExceptions.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
             <CheckCircle2 className="w-16 h-16 text-emerald-50 opacity-50" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Processed Today (Simulated)</p>
            <p className="text-3xl font-bold text-slate-900">1,248</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-900">Exception Resolution Queue</h2>
        </div>
        
        {activeBankExceptions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-sm">No payment exceptions in queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeBankExceptions.map(c => {
              const ex = c.exceptions.find(e => e.owner === Role.BANK && e.status !== 'RESOLVED');
              return (
                <div key={c.id} className="p-6 flex flex-col hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <Landmark className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{c.pensionerName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-100 text-rose-800">
                            {ex?.type || 'VALIDATION_ERROR'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">
                          <span>A/C: {c.bankAccountMasked}</span>
                          <span>•</span>
                          <span>SLA: {ex?.slaHours}h</span>
                          <span>•</span>
                          <span className="text-rose-600">Action: {ex?.recommendedAction}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => resolveBankException(c.id)}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-xs uppercase tracking-wider"
                      >
                        Override & Validate <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mock AI Diagnostic Banner */}
                  <div className="mt-6 ml-16 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row gap-4 items-start shadow-sm border border-slate-800">
                     <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                     <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 text-lg relative z-10">✨</div>
                     <div className="relative z-10">
                        <p className="font-bold text-sm mb-1">AI Diagnosis</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          High confidence (94%) that this is a transient NPCI routing error. 
                          <span className="text-white font-semibold"> Recommended action: </span> Retrying payment via alternative gateway is likely to succeed. No pensioner action required.
                        </p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
