import React from 'react';
import { useStore } from '../../store/useStore';
import { PensionState, HealthStatus } from '../../types';
import { Activity, ShieldAlert, FileSearch, ArrowRight, User, Briefcase, Landmark } from 'lucide-react';

export default function GovDashboard() {
  const { cases } = useStore();
  
  // Aggregate mock metrics
  const totalCases = cases.length;
  const healthyCases = cases.filter(c => c.health === HealthStatus.GREEN).length;
  const stuckCases = cases.filter(c => c.health === HealthStatus.RED || c.health === HealthStatus.AMBER);
  
  const getOwnerIcon = (owner: string) => {
    switch(owner) {
      case 'PENSIONER': return <User className="w-4 h-4" />;
      case 'PDA': return <Briefcase className="w-4 h-4" />;
      case 'PSA': return <Briefcase className="w-4 h-4" />;
      case 'BANK': return <Landmark className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">National Pension Operations</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-system visibility and exception monitoring</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Monitored Pensions</p>
          <p className="text-3xl font-bold text-slate-900">{totalCases.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Processing Nominal</p>
          <p className="text-3xl font-bold text-emerald-600">{healthyCases.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-800 mb-1">Exceptions / Stuck</p>
          <p className="text-3xl font-bold text-rose-600">{stuckCases.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1">Nearing SLA Breach</p>
          <p className="text-3xl font-bold text-amber-600">
            {cases.flatMap(c => c.exceptions).filter(e => e.status !== 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Where is it stuck? Core Feature */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-slate-900 text-lg tracking-tight">Where is the pension stuck?</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm">
            <FileSearch className="w-4 h-4" /> Filter
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Pensioner / PPO</th>
                <th className="px-6 py-4">Blocked Stage</th>
                <th className="px-6 py-4">Responsible Owner</th>
                <th className="px-6 py-4">Failure Reason</th>
                <th className="px-6 py-4">SLA Time</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stuckCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <span className="font-medium">No pensions are currently blocked in the system.</span>
                  </td>
                </tr>
              ) : (
                stuckCases.map(c => {
                  const ex = c.exceptions.find(e => e.status !== 'RESOLVED');
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.pensionerName}</div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{c.ppoReference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest
                          ${c.health === HealthStatus.RED ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {c.currentState.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                            {getOwnerIcon(c.currentOwner)}
                          </div>
                          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">{c.currentOwner}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {ex?.type ? (
                          <span>{ex.type.replace(/_/g, ' ')}</span>
                        ) : (
                          c.currentState === PensionState.VERIFICATION_DUE ? 'Life Certificate Expired' : 'Pending Processing'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ex?.slaHours ? (
                          <span className="text-rose-500 font-bold">{ex.slaHours}h 00m</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wider flex items-center justify-end gap-1 w-full">
                          Inspect <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
