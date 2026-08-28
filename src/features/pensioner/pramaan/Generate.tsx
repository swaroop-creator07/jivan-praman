import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import {
  ArrowLeft, Camera, CheckCircle2, UserCheck, Pencil, Plus,
  Download, Printer, Home, AlertTriangle,
} from 'lucide-react';

type Step = 'operator' | 'pensioner' | 'review' | 'success';

interface OperatorState {
  aadhaar: string;
  mobile: string;
  otp: string;
  verified: boolean;
  otpSent: boolean;
}

interface PensionerState {
  aadhaar: string;
  name: string;
  ppo: string;
  authority: string;
  bank: string;
  email: string;
  pensionType: string;
  pda: string;
  country: string;
  state: string;
  remarried: string;
  reemployed: string;
}

const emptyPensioner: PensionerState = {
  aadhaar: '', name: '', ppo: '', authority: '', bank: '', email: '',
  pensionType: '', pda: '', country: 'India', state: '', remarried: '', reemployed: '',
};

const inputCls =
  'w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-[var(--color-info)] outline-none text-lg font-bold bg-white';

function Field({
  label, help, htmlFor, children,
}: { label: string; help?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-bold text-lg">{label}</label>
      {help && <p className="text-sm text-slate-500 mt-0.5 leading-snug">{help}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function GeneratePramaan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recordDlc = useStore((s) => s.recordDlc);

  const [step, setStep] = useState<Step>('operator');
  const [operator, setOperator] = useState<OperatorState>({ aadhaar: '', mobile: '', otp: '', verified: false, otpSent: false });
  const [pensioner, setPensioner] = useState<PensionerState>(emptyPensioner);
  const [faceAttempts, setFaceAttempts] = useState(0);
  const [faceTip, setFaceTip] = useState<0 | 1 | 2>(0);
  const [faceVerified, setFaceVerified] = useState(false);
  const [diag, setDiag] = useState(false);
  const [error, setError] = useState('');
  const [pramaanId, setPramaanId] = useState('');
  const [sessionList, setSessionList] = useState<{ id: string; name: string; aadhaar: string }[]>([]);
  const [focusBank, setFocusBank] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => { stepRef.current?.focus(); }, [step]);

  useEffect(() => {
    if (focusBank && step === 'pensioner' && bankRef.current) {
      bankRef.current.focus();
      setFocusBank(false);
    }
  }, [focusBank, step]);

  useEffect(() => {
    let active = true;
    if (step === 'pensioner') {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((s) => {
          if (!active) { s.getTracks().forEach((tr) => tr.stop()); return; }
          streamRef.current = s;
          if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); }
        })
        .catch(() => { /* camera unavailable — fallback capture still works */ });
    }
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
  }, [step]);

  const stepNumber = step === 'operator' ? 1 : step === 'pensioner' ? 2 : step === 'review' ? 3 : 4;

  const authorities = [
    { value: 'central', label: t('auth_central') },
    { value: 'state', label: t('auth_state') },
    { value: 'epfo', label: t('auth_epfo') },
    { value: 'defence', label: t('auth_defence') },
  ];
  const pensionTypes = [
    { value: 'super', label: t('pen_super') },
    { value: 'family', label: t('pen_family') },
    { value: 'disability', label: t('pen_disability') },
    { value: 'commuted', label: t('pen_commuted') },
  ];
  const countries = [{ value: 'India', label: 'India' }, { value: 'Other', label: t('other') }];
  const yesNo = [{ value: 'no', label: t('no') }, { value: 'yes', label: t('yes') }];

  const cancel = () => navigate('/');

  const handleSendOtp = () => {
    setError('');
    if (operator.aadhaar.replace(/\D/g, '').length !== 12) { setError(t('gen_12_digit')); return; }
    if (operator.mobile.replace(/\D/g, '').length !== 10) { setError(t('gen_10_digit')); return; }
    setSending(true);
    setTimeout(() => { setSending(false); setOperator((o) => ({ ...o, otpSent: true })); }, 1000);
  };

  const handleVerify = () => {
    setError('');
    if (operator.otp.trim() !== '123456') { setError(t('gen_invalid_otp')); return; }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setOperator((o) => ({ ...o, verified: true }));
      setPensioner((p) => ({ ...p, aadhaar: operator.aadhaar }));
      setStep('pensioner');
    }, 900);
  };

  const switchOperator = () => {
    setOperator((o) => ({ ...o, verified: false, otp: '', otpSent: false }));
    setFaceAttempts(0); setFaceTip(0); setFaceVerified(false); setPhoto(null);
    setStep('operator');
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/png'));
    }
    const next = faceAttempts + 1;
    setFaceAttempts(next);
    if (next >= 3) { setFaceVerified(true); setFaceTip(0); }
    else { setFaceTip(next as 1 | 2); }
  };

  const continueToReview = () => {
    const required: [keyof PensionerState, string][] = [
      ['aadhaar', t('gen_pensioner_aadhaar')],
      ['name', t('gen_full_name')],
      ['ppo', t('gen_ppo')],
      ['authority', t('gen_authority')],
      ['bank', t('gen_bank')],
      ['email', t('gen_email')],
      ['pensionType', t('gen_pension_type')],
      ['pda', t('gen_pda')],
      ['country', t('gen_country')],
      ['state', t('gen_state')],
      ['remarried', t('gen_remarried')],
      ['reemployed', t('gen_reemployed')],
    ];
    const missing = required.filter(([k]) => !pensioner[k].trim());
    if (missing.length) { setError(t('gen_required')); return; }
    if (!faceVerified) { setError(t('gen_face_help')); return; }
    setError(''); setDiag(false);
    setStep('review');
  };

  const handleConfirm = () => {
    if (!diag) { setDiag(true); return; }
    const id = 'JP' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setPramaanId(id);
    recordDlc({ pramaanId: id, ppoNumber: pensioner.ppo, accountMasked: pensioner.bank, name: pensioner.name });
    setSessionList((list) => [...list, { id, name: pensioner.name, aadhaar: pensioner.aadhaar }]);
    setStep('success');
  };

  const addAnother = () => {
    setPensioner(emptyPensioner);
    setFaceAttempts(0); setFaceTip(0); setFaceVerified(false); setPhoto(null);
    setDiag(false); setError('');
    setStep('pensioner');
  };

  const correctNow = () => { setDiag(false); setStep('pensioner'); setFocusBank(true); };

  return (
    <div className="max-w-3xl space-y-6 pb-16 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <button onClick={cancel} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={t('cancel')}>
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <h1 className="!text-[26px] text-left">{t('gen_flow_title')}</h1>
        </div>
        <div className="text-sm font-bold text-[var(--color-muted)]" aria-hidden="true">{t('step')} {stepNumber} / 4</div>
      </div>

      <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden" aria-hidden="true">
        <div className="bg-[var(--color-info)] h-full transition-all" style={{ width: `${(stepNumber / 4) * 100}%` }} />
      </div>

      {/* STEP 1 — OPERATOR */}
      {step === 'operator' && (
        <div className="space-y-6">
          <h2 ref={stepRef} tabIndex={-1} className="outline-none">{t('gen_step_operator')}</h2>
          <p className="text-[var(--color-muted)]">{t('gen_operator_step_desc')}</p>

          <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-6">
            <Field label={t('gen_operator_aadhaar')} help={t('gen_operator_aadhaar_help')} htmlFor="opAadhaar">
              <input id="opAadhaar" inputMode="numeric" value={operator.aadhaar}
                onChange={(e) => setOperator((o) => ({ ...o, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                placeholder="1234 5678 9012" className={inputCls + ' font-mono'} />
            </Field>

            <Field label={t('gen_operator_mobile')} help={t('gen_operator_mobile_help')} htmlFor="opMobile">
              <input id="opMobile" inputMode="numeric" value={operator.mobile}
                onChange={(e) => setOperator((o) => ({ ...o, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                placeholder="98765 43210" className={inputCls + ' font-mono'} />
            </Field>

            {!operator.otpSent ? (
              <>
                {error && <p role="alert" className="text-sm font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 rounded-lg">{error}</p>}
                <button onClick={handleSendOtp} disabled={sending}
                  className="btn-primary w-full sm:w-auto text-lg px-8 py-4 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {sending && <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />}
                  {sending ? t('gen_sending') : t('gen_send_otp')}
                </button>
              </>
            ) : (
              <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
                <p className="text-sm font-bold text-[var(--color-success)]">{t('gen_otp_sent_msg')} {operator.mobile.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
                <Field label={t('gen_otp')} help={t('gen_otp_help')} htmlFor="opOtp">
                  <input id="opOtp" inputMode="numeric" value={operator.otp}
                    onChange={(e) => setOperator((o) => ({ ...o, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="6-digit OTP" className={inputCls + ' font-mono tracking-widest'} />
                </Field>
                {error && <p role="alert" className="text-sm font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 rounded-lg">{error}</p>}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSendOtp} className="bg-white border border-[var(--color-border)] font-bold px-6 py-3 rounded-lg">{t('gen_resend_otp')}</button>
                  <button onClick={handleVerify} disabled={verifying}
                    className="btn-primary px-8 py-3 rounded-lg disabled:opacity-50 inline-flex items-center gap-2">
                    {verifying && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />}
                    {verifying ? t('gen_verifying') : t('gen_verify_continue')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-start">
            <button onClick={cancel} className="px-6 py-3 rounded-lg font-bold text-[var(--color-muted)] hover:bg-slate-100">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* STEP 2 — PENSIONER */}
      {step === 'pensioner' && (
        <div className="space-y-6">
          <h2 ref={stepRef} tabIndex={-1} className="outline-none">{t('gen_step_pensioner')}</h2>

          <div className="flex items-center justify-between bg-[var(--color-success)] text-white rounded-lg px-4 py-3">
            <span className="inline-flex items-center gap-2 font-bold text-sm">
              <UserCheck className="w-5 h-5" aria-hidden="true" /> {t('gen_operator_verified')}
            </span>
            <button onClick={switchOperator} className="text-sm font-bold underline underline-offset-4">{t('gen_switch_operator')}</button>
          </div>

          <p className="text-[var(--color-muted)]">{t('gen_pensioner_step_desc')}</p>

          <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-6">
            <Field label={t('gen_pensioner_aadhaar')} help={t('gen_pensioner_aadhaar_help')} htmlFor="penAadhaar">
              <input id="penAadhaar" inputMode="numeric" value={pensioner.aadhaar}
                onChange={(e) => setPensioner((p) => ({ ...p, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                placeholder="1234 5678 9012" className={inputCls + ' font-mono'} />
            </Field>

            <Field label={t('gen_full_name')} help={t('gen_full_name_help')} htmlFor="penName">
              <input id="penName" value={pensioner.name}
                onChange={(e) => setPensioner((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Ramesh Kumar" className={inputCls} />
            </Field>

            <Field label={t('gen_ppo')} help={t('gen_ppo_help')} htmlFor="penPpo">
              <input id="penPpo" value={pensioner.ppo}
                onChange={(e) => setPensioner((p) => ({ ...p, ppo: e.target.value }))}
                placeholder="PPO / PPO-1234567" className={inputCls + ' font-mono'} />
            </Field>

            <Field label={t('gen_authority')} help={t('gen_authority_help')} htmlFor="penAuth">
              <select id="penAuth" value={pensioner.authority}
                onChange={(e) => setPensioner((p) => ({ ...p, authority: e.target.value }))} className={inputCls}>
                <option value="">—</option>
                {authorities.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>

            <Field label={t('gen_bank')} help={t('gen_bank_help')} htmlFor="penBank">
              <input id="penBank" ref={bankRef} inputMode="numeric" value={pensioner.bank}
                onChange={(e) => setPensioner((p) => ({ ...p, bank: e.target.value.replace(/\D/g, '').slice(0, 18) }))}
                placeholder="Account number" className={inputCls + ' font-mono'} />
            </Field>

            <Field label={t('gen_email')} help={t('gen_email_help')} htmlFor="penEmail">
              <input id="penEmail" type="email" value={pensioner.email}
                onChange={(e) => setPensioner((p) => ({ ...p, email: e.target.value }))}
                placeholder="name@example.com" className={inputCls} />
            </Field>

            <Field label={t('gen_pension_type')} help={t('gen_pension_type_help')} htmlFor="penType">
              <select id="penType" value={pensioner.pensionType}
                onChange={(e) => setPensioner((p) => ({ ...p, pensionType: e.target.value }))} className={inputCls}>
                <option value="">—</option>
                {pensionTypes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>

            <Field label={t('gen_pda')} help={t('gen_pda_help')} htmlFor="penPda">
              <input id="penPda" value={pensioner.pda}
                onChange={(e) => setPensioner((p) => ({ ...p, pda: e.target.value }))}
                placeholder="e.g. State Bank of India" className={inputCls} />
            </Field>

            <Field label={t('gen_country')} help={t('gen_country_help')} htmlFor="penCountry">
              <select id="penCountry" value={pensioner.country}
                onChange={(e) => setPensioner((p) => ({ ...p, country: e.target.value }))} className={inputCls}>
                {countries.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>

            <Field label={t('gen_state')} help={t('gen_state_help')} htmlFor="penState">
              <input id="penState" value={pensioner.state}
                onChange={(e) => setPensioner((p) => ({ ...p, state: e.target.value }))}
                placeholder="e.g. Delhi" className={inputCls} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-6">
              <Field label={t('gen_remarried')} help={t('gen_remarried_help')} htmlFor="penRem">
                <select id="penRem" value={pensioner.remarried}
                  onChange={(e) => setPensioner((p) => ({ ...p, remarried: e.target.value }))} className={inputCls}>
                  <option value="">—</option>
                  {yesNo.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
              <Field label={t('gen_reemployed')} help={t('gen_reemployed_help')} htmlFor="penReemp">
                <select id="penReemp" value={pensioner.reemployed}
                  onChange={(e) => setPensioner((p) => ({ ...p, reemployed: e.target.value }))} className={inputCls}>
                  <option value="">—</option>
                  {yesNo.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Face verification */}
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-2"><Camera className="w-5 h-5" aria-hidden="true" />{t('gen_face_title')}</h3>
            <p className="text-[var(--color-muted)]">{t('gen_face_help')}</p>
            <div className="bg-slate-900 rounded-lg flex items-center justify-center min-h-[240px] overflow-hidden">
              <video ref={videoRef} className="w-full max-w-sm" muted playsInline aria-hidden="true" />
            </div>

            {photo && (
              <div className="flex items-center gap-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <img src={photo} alt="Captured face photo (not stored)" className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]" />
                <p className="text-sm text-[var(--color-muted)]">{t('gen_photo_note')}</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            {faceTip === 1 && (
              <div role="alert" className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] p-3 rounded-lg text-sm font-bold">{t('gen_face_tip1')}</div>
            )}
            {faceTip === 2 && (
              <>
                <div role="alert" className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] p-3 rounded-lg text-sm font-bold">{t('gen_face_tip2')}</div>
                <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg text-sm">{t('gen_face_fallback')}</div>
              </>
            )}
            {faceVerified && (
              <div className="bg-[var(--color-success)] text-white p-3 rounded-lg text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />{t('gen_face_ok')}</div>
            )}

            <button onClick={handleCapture} disabled={faceVerified}
              className="btn-primary w-full sm:w-auto text-lg px-8 py-4 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" aria-hidden="true" />{t('gen_capture')}
            </button>
          </div>

          {error && <p role="alert" className="text-sm font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 rounded-lg">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button onClick={switchOperator} className="px-6 py-3 rounded-lg font-bold text-[var(--color-muted)] hover:bg-slate-100">{t('back')}</button>
            <button onClick={continueToReview} disabled={!faceVerified}
              className="btn-primary text-lg px-10 py-4 rounded-lg disabled:opacity-50">{t('gen_continue_review')}</button>
          </div>
        </div>
      )}

      {/* STEP 3 — REVIEW */}
      {step === 'review' && (
        <div className="space-y-6">
          <h2 ref={stepRef} tabIndex={-1} className="outline-none">{t('gen_step_review')}</h2>

          {diag && (
            <div role="alert" className="bg-[var(--color-danger-bg)] border-2 border-[var(--color-danger)] text-[var(--color-danger)] p-5 rounded-lg space-y-3">
              <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5" aria-hidden="true" />{t('gen_diagnostic_title')}</p>
              <p>{t('gen_diagnostic_msg')}</p>
              <button onClick={correctNow} className="btn-primary px-6 py-3 rounded-lg">{t('gen_correct_now')}</button>
            </div>
          )}

          <ReviewTable title={t('gen_review_operator')} onEdit={() => setStep('pensioner')} rows={[
            [t('gen_pensioner_aadhaar'), pensioner.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')],
            [t('gen_full_name'), pensioner.name],
            [t('gen_operator_aadhaar'), operator.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')],
          ]} />

          <ReviewTable title={t('gen_review_pension')} onEdit={() => setStep('pensioner')} rows={[
            [t('gen_ppo'), pensioner.ppo],
            [t('gen_authority'), authorities.find((a) => a.value === pensioner.authority)?.label || '—'],
            [t('gen_pension_type'), pensionTypes.find((a) => a.value === pensioner.pensionType)?.label || '—'],
            [t('gen_pda'), pensioner.pda],
            [t('gen_country'), pensioner.country],
            [t('gen_state'), pensioner.state],
            [t('gen_remarried'), pensioner.remarried === 'yes' ? t('yes') : pensioner.remarried === 'no' ? t('no') : '—'],
            [t('gen_reemployed'), pensioner.reemployed === 'yes' ? t('yes') : pensioner.reemployed === 'no' ? t('no') : '—'],
          ]} />

          <ReviewTable title={t('gen_review_bank')} onEdit={correctNow} rows={[
            [t('gen_bank'), pensioner.bank],
            [t('gen_email'), pensioner.email],
          ]} />

          <div className="bg-white border border-[var(--color-border)] rounded-lg p-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-[var(--color-success)]" aria-hidden="true" />{t('gen_review_verify')}</h3>
            <p className="mt-2 text-[var(--color-muted)]">{faceVerified ? t('gen_face_ok') : '—'}</p>
          </div>

          {error && <p role="alert" className="text-sm font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 rounded-lg">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep('pensioner')} className="px-6 py-3 rounded-lg font-bold text-[var(--color-muted)] hover:bg-slate-100">{t('back')}</button>
            <button onClick={handleConfirm} className="btn-primary text-lg px-10 py-4 rounded-lg">{t('gen_submit')}</button>
          </div>
        </div>
      )}

      {/* STEP 4 — SUCCESS */}
      {step === 'success' && (
        <div className="space-y-6">
          <h2 ref={stepRef} tabIndex={-1} className="sr-only">{t('gen_success_title')}</h2>

          <div className="bg-[var(--color-success)] text-white rounded-lg p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">{t('confirmation')}</p>
            <h3 className="mt-1">{t('gen_success_title')}</h3>
          </div>

          <div className="bg-white border-2 border-[var(--color-border)] rounded-lg p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('status_pramaan_id')}</p>
            <p className="text-3xl sm:text-4xl font-bold font-mono tracking-widest mt-2">{pramaanId}</p>
            <table className="w-full mt-6 border-collapse text-left">
              <tbody>
                <tr className="border-b border-[var(--color-border)]"><th scope="row" className="py-2 pr-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] w-1/3">{t('gen_full_name')}</th><td className="py-2 font-bold">{pensioner.name}</td></tr>
                <tr className="border-b border-[var(--color-border)]"><th scope="row" className="py-2 pr-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('gen_pensioner_aadhaar')}</th><td className="py-2 font-mono font-bold">{pensioner.aadhaar}</td></tr>
                <tr className="border-b border-[var(--color-border)]"><th scope="row" className="py-2 pr-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('gen_ppo')}</th><td className="py-2 font-mono font-bold">{pensioner.ppo}</td></tr>
                <tr className="border-b border-[var(--color-border)]"><th scope="row" className="py-2 pr-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('gen_bank')}</th><td className="py-2 font-mono font-bold">{pensioner.bank}</td></tr>
                <tr><th scope="row" className="py-2 pr-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('gen_email')}</th><td className="py-2 font-bold">{pensioner.email}</td></tr>
              </tbody>
            </table>
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => window.print()} className="bg-white border-2 border-[var(--color-info)] text-[var(--color-info)] font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2"><Printer className="w-5 h-5" aria-hidden="true" />{t('gen_print')}</button>
              <a href="#" onClick={(e) => e.preventDefault()} className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2"><Download className="w-5 h-5" aria-hidden="true" />{t('gen_download_pdf')}</a>
            </div>
          </div>

          {sessionList.length > 0 && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-6">
              <h4 className="font-bold">{t('gen_session_table')}</h4>
              <table className="w-full mt-3 border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border)] text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    <th scope="col" className="py-2 pr-4">{t('status_pramaan_id')}</th>
                    <th scope="col" className="py-2 pr-4">{t('gen_full_name')}</th>
                    <th scope="col" className="py-2">{t('gen_pensioner_aadhaar')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionList.map((s) => (
                    <tr key={s.id} className="border-b border-[var(--color-border)]">
                      <td className="py-2 font-mono font-bold">{s.id}</td>
                      <td className="py-2">{s.name}</td>
                      <td className="py-2 font-mono">{s.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={addAnother} className="bg-white border-2 border-[var(--color-info)] text-[var(--color-info)] font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2"><Plus className="w-5 h-5" aria-hidden="true" />{t('gen_add_another')}</button>
            <button onClick={cancel} className="bg-slate-900 text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2"><Home className="w-5 h-5" aria-hidden="true" />{t('gen_finish_home')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewTable({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: [string, string][] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
      <table className="w-full border-collapse text-left">
        <caption className="text-left font-bold text-lg p-4 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          {title}
          <button onClick={onEdit} className="ml-3 text-sm font-bold text-[var(--color-info)] underline underline-offset-4 inline-flex items-center gap-1">
            <Pencil className="w-4 h-4" aria-hidden="true" />{t('gen_edit')}
          </button>
        </caption>
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
              <th scope="row" className="text-left p-4 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] w-1/3">{k}</th>
              <td className="p-4 font-bold break-words">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
