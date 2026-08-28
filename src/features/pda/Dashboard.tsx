import React from 'react';
import { useStore } from '../../store/useStore';
import { PensionState, Role } from '../../types';
import { FileCheck, AlertCircle, Clock, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function PdaDashboard() {
  const { cases, approveVerification, rejectVerification } = useStore();
  
  // Get cases relevant to PDA (mock filtering)
  const pendingVerifications = cases.filter(c => c.currentState === PensionState.VERIFICATION_IN_PROGRESS);
  const paymentReady = cases.filter(c => c.currentState === PensionState.PAYMENT_READY);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PDA Operator Console</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Review verifications and manage pension processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pending Verifications</p>
              <p className="text-3xl font-bold text-slate-900">{pendingVerifications.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Payment Ready (Auth)</p>
              <p className="text-3xl font-bold text-slate-900">{paymentReady.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">SLA Breaches</p>
              <p className="text-3xl font-bold text-rose-500">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-900">Life Verification Queue</h2>
        </div>
        
        {pendingVerifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Check className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-sm">No verifications pending review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingVerifications.map(c => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">FACE</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{c.pensionerName}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                      <span>PPO: {c.ppoReference}</span>
                      <span>•</span>
                      <span>Submitted: Just now</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => rejectVerification(c.id, "Face mismatch")}
                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => approveVerification(c.id)}
                    className="flex-1 md:flex-none px-4 py-2 btn-primary rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
