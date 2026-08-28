import React, { useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { HelpCircle, ChevronRight, RefreshCw, XCircle, FileWarning, Search, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { usePageLoad } from '../../../lib/usePageLoad';
import { PageLoader } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';

export default function Troubleshoot() {
  const { t } = useTranslation();
  const { pensioner } = useStore();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const { loading, error, retry } = usePageLoad(400);

  const latestDlc = pensioner.dlcHistory[0];
  const isDlcValidOrProcessing = latestDlc?.status === 'Approved' || latestDlc?.status === 'Submitted' || latestDlc?.status === 'Under PDA Verification';

  const issues = [
    { id: 'biometric_failed', label: 'My face or fingerprint authentication failed', icon: <XCircle className="w-5 h-5 text-rose-500" /> },
    { id: 'otp_missing', label: 'My OTP did not arrive', icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
    { id: 'cert_rejected', label: 'My certificate was rejected by the bank', icon: <FileWarning className="w-5 h-5 text-rose-500" /> },
    { id: 'no_id', label: 'I do not know my Pramaan ID', icon: <Search className="w-5 h-5 text-slate-500" /> },
    { id: 'payment_missing', label: 'My payment has not arrived', icon: <RefreshCw className="w-5 h-5 text-indigo-500" /> },
  ];

  if (loading) return <PageLoader message="Loading troubleshooter…" />;
  if (error) return <div className="max-w-3xl mx-auto"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        {selectedIssue ? (
           <button onClick={() => setSelectedIssue(null)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
             <ArrowLeft className="w-6 h-6" />
           </button>
        ) : (
           <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
             <ArrowLeft className="w-6 h-6" />
           </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('troubleshoot')}</h1>
        </div>
      </div>

      {!selectedIssue ? (
        <div className="space-y-4">
          <p className="text-lg text-slate-600 mb-6">What seems to be the problem?</p>
          <div className="grid grid-cols-1 gap-3">
            {issues.map(issue => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                    {issue.icon}
                  </div>
                  <span className="font-bold text-lg text-slate-900">{issue.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
              </button>
            ))}
          </div>
          
          <div className="mt-8 bg-slate-100 rounded-2xl p-6 text-center">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Need to talk to someone?</p>
            <Link to="/help" className="mt-2 inline-block text-indigo-600 font-bold hover:underline">Go to Help Center</Link>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          
          {selectedIssue === 'biometric_failed' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Authentication Failed</h2>
              <p className="text-slate-600">If your face or fingerprint is not recognized, it might be due to lighting or a dirty scanner.</p>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-900">What to do:</h4>
                  <ul className="list-disc list-inside mt-2 text-slate-700 space-y-2">
                    <li>Ensure you are in a well-lit room for face authentication.</li>
                    <li>Wipe the fingerprint scanner if using a PC device.</li>
                    <li>Ensure you blink when prompted by the face app.</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button onClick={() => setSelectedIssue(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Back</button>
                <Link to="/pramaan/generate" className="btn-primary font-bold px-6 py-3 rounded-xl shadow-sm">{t('renew_lc')}</Link>
              </div>
            </div>
          )}

          {selectedIssue === 'cert_rejected' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Certificate Rejected</h2>
              {isDlcValidOrProcessing ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-start gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-1">Issue Resolved</h3>
                    <p className="text-emerald-800">We see that you have already generated a new certificate which is currently {latestDlc.status}. You don't need to do anything else right now.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-600">Your bank or pension agency may reject the certificate if the details do not match their records.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <h4 className="font-bold text-slate-900">What to do:</h4>
                      <ul className="list-disc list-inside mt-2 text-slate-700 space-y-2">
                        <li>Check if your PPO number was entered correctly.</li>
                        <li>Check if you selected the correct Pension Authority.</li>
                        <li>Generate a new certificate with the correct details.</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button onClick={() => setSelectedIssue(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Back</button>
                    <Link to="/pramaan/generate" className="btn-primary font-bold px-6 py-3 rounded-xl shadow-sm">Generate New Certificate</Link>
                  </div>
                </>
              )}
            </div>
          )}
          
          {selectedIssue === 'payment_missing' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Payment Not Arrived</h2>
              {pensioner.pensionPayments.some(p => p.status.includes('Held')) && isDlcValidOrProcessing ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-start gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-1">Issue Resolved</h3>
                    <p className="text-emerald-800">Your payment was held due to a missing Life Certificate, but we see you have now submitted a new one. Your bank will process it and release your payment shortly.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-600">If your payment is delayed, it may be due to a pending life certificate or a bank processing delay.</p>
                  
                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link to="/pramaan/status" className="btn-primary font-bold px-6 py-3 rounded-xl shadow-sm">Check Certificate Status</Link>
                    <Link to="/payments" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold px-6 py-3 rounded-xl shadow-sm">Check Payment History</Link>
                  </div>
                </>
              )}
            </div>
          )}

          {(selectedIssue === 'otp_missing' || selectedIssue === 'no_id') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Information Retrieval</h2>
              <p className="text-slate-600">If you are missing your OTP or Pramaan ID, you can try searching by Aadhaar or trying again.</p>
              
              <div className="pt-4 flex gap-4">
                <button onClick={() => setSelectedIssue(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Back</button>
                <Link to="/pramaan/find-id" className="btn-primary font-bold px-6 py-3 rounded-xl shadow-sm">Find ID using Aadhaar</Link>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
