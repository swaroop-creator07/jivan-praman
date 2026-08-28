import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { useStore } from '../../../store/useStore';
import {
  ArrowLeft, Camera, CheckCircle2, RefreshCw, UserCheck, Pencil, Plus,
  Download, Printer, Home, AlertTriangle, CreditCard, User, FileText,
  Landmark, Mail, Users, MapPin, Globe, Heart, Briefcase, Smartphone, KeyRound, Building2,
} from 'lucide-react';
import { Glossary } from '../../../components/ui/Glossary';
import { ResendIdButton } from '../../../components/ui/ResendId';
import { downloadReceiptPdf } from '../../../lib/receiptPdf';
import { playTone } from '../../../lib/audioCue';

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

type FieldKey = keyof PensionerState;
type FieldDef = {
  key: FieldKey;
  labelKey: string;
  helpKey?: string;
  type: 'text' | 'email' | 'number' | 'select';
  options?: { value: string; labelKey: string }[];
  glossary?: 'glossary_ppo' | 'glossary_pda' | 'glossary_authority';
};

const emptyPensioner: PensionerState = {
  aadhaar: '', name: '', ppo: '', authority: '', bank: '', email: '',
  pensionType: '', pda: '', country: 'India', state: '', remarried: '', reemployed: '',
};

const inputCls =
  'w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-[var(--color-info)] outline-none text-lg font-bold bg-white';

const SAVE_KEY = 'jp-wizard-v1';
type Snapshot = {
  step: Step;
  operator: OperatorState;
  pensioner: PensionerState;
  faceVerified: boolean;
  faceAttempts: number;
  singleField: boolean;
};

function Field({ label, help, htmlFor, children }: { label: React.ReactNode; help?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-bold text-lg">{label}</label>
      {help && <p className="text-sm text-slate-500 mt-0.5 leading-snug">{help}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const FIELD_ICONS: Record<FieldKey, React.ComponentType<{ className?: string }>> = {
  aadhaar: CreditCard, name: User, ppo: FileText, authority: Building2, bank: Landmark,
  email: Mail, pensionType: Users, pda: MapPin, country: Globe, state: MapPin,
  remarried: Heart, reemployed: Briefcase,
};

function LabelWithIcon({ icon: Icon, children }: { icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-[var(--color-info)] shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const { t } = useTranslation();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const setDigit = (i: number, d: string) => {
    const next = [...digits];
    next[i] = d;
    onChange(next.join('').slice(0, length));
  };
  useEffect(() => { refs.current[0]?.focus(); }, []);
  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    if (v.length > 1) {
      const chars = v.split('');
      const next = [...digits];
      let idx = i;
      for (const c of chars) { if (idx < length) { next[idx] = c; idx++; } }
      onChange(next.join('').slice(0, length));
      refs.current[Math.min(idx, length - 1)]?.focus();
      return;
    }
    setDigit(i, v);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  return (
    <div className="flex gap-2" role="group" aria-label={t('gen_otp')}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          type="tel"
          autoComplete="one-time-code"
          maxLength={1}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-slate-300 focus:border-[var(--color-info)] outline-none"
          aria-label={t('otp_box', { n: i + 1 })}
        />
      ))}
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
  const [notice, setNotice] = useState('');
  const [pramaanId, setPramaanId] = useState('');
  const [sessionList, setSessionList] = useState<{ id: string; name: string; aadhaar: string }[]>([]);
  const [focusBank, setFocusBank] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  // Accessibility features
  const [singleField, setSingleField] = useState(true);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [practice, setPractice] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [saved, setSaved] = useState<Snapshot | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);

  const authorities = [
    { value: 'central', labelKey: 'auth_central' },
    { value: 'state', labelKey: 'auth_state' },
    { value: 'epfo', labelKey: 'auth_epfo' },
    { value: 'defence', labelKey: 'auth_defence' },
  ];
  const pensionTypes = [
    { value: 'super', labelKey: 'pen_super' },
    { value: 'family', labelKey: 'pen_family' },
    { value: 'disability', labelKey: 'pen_disability' },
    { value: 'commuted', labelKey: 'pen_commuted' },
  ];
  const countries = [{ value: 'India', labelKey: 'other' }, { value: 'Other', labelKey: 'other' }];
  const yesNo = [{ value: 'no', labelKey: 'no' }, { value: 'yes', labelKey: 'yes' }];

  const FIELDS: FieldDef[] = [
    { key: 'aadhaar', labelKey: 'gen_pensioner_aadhaar', helpKey: 'gen_pensioner_aadhaar_help', type: 'number' },
    { key: 'name', labelKey: 'gen_full_name', helpKey: 'gen_full_name_help', type: 'text' },
    { key: 'ppo', labelKey: 'gen_ppo', helpKey: 'gen_ppo_help', type: 'text', glossary: 'glossary_ppo' },
    { key: 'authority', labelKey: 'gen_authority', helpKey: 'gen_authority_help', type: 'select', options: authorities, glossary: 'glossary_authority' },
    { key: 'bank', labelKey: 'gen_bank', helpKey: 'gen_bank_help', type: 'number' },
    { key: 'email', labelKey: 'gen_email', helpKey: 'gen_email_help', type: 'email' },
    { key: 'pensionType', labelKey: 'gen_pension_type', helpKey: 'gen_pension_type_help', type: 'select', options: pensionTypes },
    { key: 'pda', labelKey: 'gen_pda', helpKey: 'gen_pda_help', type: 'text', glossary: 'glossary_pda' },
    { key: 'country', labelKey: 'gen_country', helpKey: 'gen_country_help', type: 'select', options: countries },
    { key: 'state', labelKey: 'gen_state', helpKey: 'gen_state_help', type: 'text' },
    { key: 'remarried', labelKey: 'gen_remarried', helpKey: 'gen_remarried_help', type: 'select', options: yesNo },
    { key: 'reemployed', labelKey: 'gen_reemployed', helpKey: 'gen_reemployed_help', type: 'select', options: yesNo },
  ];

  const stepNumber = step === 'operator' ? 1 : step === 'pensioner' ? 2 : step === 'review' ? 3 : 4;
  const reassureKey = step === 'operator' ? 'gen_reassure_3' : step === 'pensioner' ? 'gen_reassure_2' : step === 'review' ? 'gen_reassure_1' : 'gen_reassure_0';

  const cancel = () => navigate('/');

  // Camera lifecycle
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

  useEffect(() => { stepRef.current?.focus(); }, [step]);

  useEffect(() => {
    if (focusBank && step === 'pensioner' && bankRef.current) {
      bankRef.current.focus();
      setFocusBank(false);
    }
  }, [focusBank, step]);

  // Save-and-resume: load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Snapshot;
        if (s && s.step && s.step !== 'success') {
          setSaved(s);
          setResumePrompt(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save-and-resume: persist on change
  useEffect(() => {
    try {
      const snap: Snapshot = {
        step,
        operator: { ...operator, otp: '' },
        pensioner,
        faceVerified,
        faceAttempts,
        singleField,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(snap));
    } catch { /* ignore */ }
  }, [step, operator, pensioner, faceVerified, faceAttempts, singleField]);

  const applyResume = () => {
    if (!saved) return;
    setStep(saved.step);
    setOperator(saved.operator);
    setPensioner(saved.pensioner);
    setFaceVerified(saved.faceVerified);
    setFaceAttempts(saved.faceAttempts);
    setSingleField(saved.singleField);
    setFieldIndex(0);
    setResumePrompt(false);
  };
  const discardResume = () => {
    localStorage.removeItem(SAVE_KEY);
    setSaved(null);
    setResumePrompt(false);
    setOperator({ aadhaar: '', mobile: '', otp: '', verified: false, otpSent: false });
    setPensioner(emptyPensioner);
    setFaceAttempts(0); setFaceTip(0); setFaceVerified(false); setPhoto(null);
    setStep('operator');
  };
  const clearSaved = () => {
    localStorage.removeItem(SAVE_KEY);
    discardResume();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/png'));
    }
  };

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
    capturePhoto();
    const next = faceAttempts + 1;
    setFaceAttempts(next);
    if (next >= 3) { setFaceVerified(true); setFaceTip(0); playTone('success'); }
    else { setFaceTip(next as 1 | 2); playTone('fail'); }
  };

  const handlePractice = () => {
    capturePhoto();
    playTone('practice');
    setPracticeDone(true);
  };

  const continueToReview = () => {
    const required: [FieldKey, string][] = FIELDS.map((f) => [f.key, t(f.labelKey)]);
    const missing = required.filter(([k]) => !pensioner[k].trim());
    if (missing.length) { setError(t('gen_required')); setFieldIndex(FIELDS.findIndex((f) => !pensioner[f.key].trim())); return; }
    if (!faceVerified) { setError(t('gen_face_help')); return; }
    setError(''); setDiag(false);
    setStep('review');
  };

  const handleConfirm = () => {
    if (!diag) { setDiag(true); return; }
    const id = 'JP' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const date = new Date().toISOString().split('T')[0];
    setPramaanId(id);
    recordDlc({ pramaanId: id, ppoNumber: pensioner.ppo, accountMasked: pensioner.bank, name: pensioner.name });
    setSessionList((list) => [...list, { id, name: pensioner.name, aadhaar: pensioner.aadhaar }]);
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    try {
      downloadReceiptPdf({ name: pensioner.name, aadhaar: pensioner.aadhaar, ppo: pensioner.ppo, bank: pensioner.bank, email: pensioner.email, pramaanId: id, date });
      setNotice('pdf_auto');
    } catch {
      setNotice('pdf_auto_fail');
    }
    setStep('success');
  };

  const handleDownload = () => {
    try {
      downloadReceiptPdf({
        name: pensioner.name, aadhaar: pensioner.aadhaar, ppo: pensioner.ppo,
        bank: pensioner.bank, email: pensioner.email, pramaanId, date: new Date().toISOString().split('T')[0],
      });
      setNotice('');
    } catch {
      setNotice('pdf_download_fail');
    }
  };

  const onConfirmClick = () => {
    if (!diag) { setDiag(true); return; }
    setConfirmOpen(true);
  };

  const addAnother = () => {
    setPensioner(emptyPensioner);
    setFaceAttempts(0); setFaceTip(0); setFaceVerified(false); setPhoto(null);
    setDiag(false); setError('');
    setStep('pensioner');
  };

  const correctNow = () => { setDiag(false); setStep('pensioner'); setFocusBank(true); };

  const renderControl = (field: FieldDef) => {
    const val = pensioner[field.key];
    const set = (v: string) => setPensioner((p) => ({ ...p, [field.key]: v }));
    if (field.type === 'select') {
      return (
        <select id={`f-${field.key}`} value={val} onChange={(e) => set(e.target.value)} className={inputCls}>
          <option value="">—</option>
          {field.options!.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
        </select>
      );
    }
    if (field.key === 'aadhaar') {
      return <input id={`f-${field.key}`} type="tel" inputMode="numeric" value={val} onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="1234 5678 9012" className={inputCls + ' font-mono'} />;
    }
    if (field.key === 'bank') {
      return <input id={`f-${field.key}`} type="tel" inputMode="numeric" value={val} onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, 18))} placeholder="Account number" className={inputCls + ' font-mono'} />;
    }
    const type = field.type === 'email' ? 'email' : 'text';
    return <input id={`f-${field.key}`} type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={field.key === 'name' ? 'e.g. Ramesh Kumar' : field.key === 'email' ? 'name@example.com' : field.key === 'state' ? 'e.g. Delhi' : ''} className={inputCls} />;
  };

  const labelNode = (field: FieldDef) =>
    field.glossary ? <Glossary term={field.glossary}>{t(field.labelKey)}</Glossary> : t(field.labelKey);

  const FieldBlock = ({ field }: { field: FieldDef; key?: string | number }) => (
    <Field label={<LabelWithIcon icon={FIELD_ICONS[field.key]}>{labelNode(field)}</LabelWithIcon>} help={field.helpKey ? t(field.helpKey) : undefined} htmlFor={`f-${field.key}`}>
      {renderControl(field)}
      {field.key === 'bank' && <p className="text-sm font-semibold text-[var(--color-success)] mt-2">{t('gen_free_govt')}</p>}
    </Field>
  );

  return (
    <div className="max-w-3xl space-y-6 pb-16 text-left">
      {/* Resume prompt */}
      {resumePrompt && saved && (
        <div className="bg-[var(--color-warn-bg)] border-2 border-[var(--color-warn)] rounded-lg p-6 text-left" role="dialog" aria-label={t('gen_resume_title')}>
          <h2 className="font-bold text-xl">{t('gen_resume_title')}</h2>
          <p className="mt-2 text-[var(--color-muted)]">{t('gen_resume_desc')}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={applyResume} className="btn-primary px-6 py-3 rounded-lg font-bold">{t('gen_resume_yes')}</button>
            <button onClick={discardResume} className="border border-[var(--color-border)] px-6 py-3 rounded-lg font-bold">{t('gen_resume_no')}</button>
          </div>
        </div>
      )}

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
      <p className="text-sm font-bold text-[var(--color-info)]">{t(reassureKey)}</p>

      {/* STEP 1 — OPERATOR */}
      {step === 'operator' && (
        <div className="space-y-6">
          <h2 ref={stepRef} tabIndex={-1} className="outline-none">{t('gen_step_operator')}</h2>
          <p className="text-[var(--color-muted)]">{t('gen_operator_step_desc')}</p>
          {saved && (
            <button onClick={clearSaved} className="text-sm font-bold text-[var(--color-info)] underline underline-offset-4">{t('gen_clear_saved')}</button>
          )}

          <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-6">
            <Field label={<LabelWithIcon icon={CreditCard}>{t('gen_operator_aadhaar')}</LabelWithIcon>} help={t('gen_operator_aadhaar_help')} htmlFor="opAadhaar">
              <input id="opAadhaar" type="tel" inputMode="numeric" value={operator.aadhaar}
                onChange={(e) => setOperator((o) => ({ ...o, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                placeholder="1234 5678 9012" className={inputCls + ' font-mono'} />
            </Field>

            <Field label={<LabelWithIcon icon={Smartphone}>{t('gen_operator_mobile')}</LabelWithIcon>} help={t('gen_operator_mobile_help')} htmlFor="opMobile">
              <input id="opMobile" type="tel" inputMode="numeric" value={operator.mobile}
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
                <Field label={<LabelWithIcon icon={KeyRound}>{t('gen_otp')}</LabelWithIcon>} help={t('gen_otp_help')} htmlFor="opOtp">
                  <OtpInput value={operator.otp} onChange={(v) => setOperator((o) => ({ ...o, otp: v }))} />
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
                <p className="text-xs text-[var(--color-muted)]">{t('gen_back_safe')}</p>
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

          {/* Mode toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setSingleField(true)} aria-pressed={singleField}
              className={`px-5 py-3 rounded-lg font-bold border ${singleField ? 'bg-[var(--color-info)] text-white border-[var(--color-info)]' : 'border-[var(--color-border)] text-slate-700'}`}>
              {t('gen_single_field')}
            </button>
            <button onClick={() => setSingleField(false)} aria-pressed={!singleField}
              className={`px-5 py-3 rounded-lg font-bold border ${!singleField ? 'bg-[var(--color-info)] text-white border-[var(--color-info)]' : 'border-[var(--color-border)] text-slate-700'}`}>
              {t('gen_all_fields')}
            </button>
          </div>

          {/* Single-field mode */}
          {singleField && (
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-6">
              <p className="text-sm font-bold text-[var(--color-info)]">{t('gen_field_of', { n: fieldIndex + 1, total: FIELDS.length })}</p>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map((f, i) => (
                  <button key={f.key} onClick={() => setFieldIndex(i)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold border ${i === fieldIndex ? 'bg-[var(--color-info)] text-white border-[var(--color-info)]' : pensioner[f.key].trim() ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-border)] text-slate-600'}`}
                    aria-current={i === fieldIndex}>
                    {i + 1}. {t(f.labelKey)}
                  </button>
                ))}
              </div>
              <FieldBlock field={FIELDS[fieldIndex]} />
              <div className="flex justify-between items-center gap-3 pt-2">
                <button onClick={() => setFieldIndex((i) => Math.max(0, i - 1))} disabled={fieldIndex === 0}
                  className="px-6 py-3 rounded-lg font-bold border border-[var(--color-border)] disabled:opacity-40">{t('gen_prev_field')}</button>
                {fieldIndex < FIELDS.length - 1 ? (
                  <button onClick={() => setFieldIndex((i) => i + 1)} className="btn-primary px-8 py-3 rounded-lg font-bold">{t('gen_next_field')}</button>
                ) : (
                  <button onClick={continueToReview} disabled={!faceVerified}
                    className="btn-primary px-8 py-3 rounded-lg font-bold disabled:opacity-50">{t('gen_continue_review')}</button>
                )}
              </div>
              <p className="text-xs text-[var(--color-muted)]">{t('gen_back_safe')}</p>
            </div>
          )}

          {/* All-fields mode */}
          {!singleField && (
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 space-y-6">
              {FIELDS.map((f) => <FieldBlock key={f.key} field={f} />)}
            </div>
          )}

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

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleCapture} disabled={faceVerified}
                className="btn-primary w-full sm:w-auto text-lg px-8 py-4 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" aria-hidden="true" />{t('gen_capture')}
              </button>
              <button onClick={() => setPractice((p) => !p)} aria-pressed={practice}
                className={`px-5 py-3 rounded-lg font-bold border ${practice ? 'bg-[var(--color-warn-bg)] border-[var(--color-warn)]' : 'border-[var(--color-border)]'}`}>
                {t('gen_practice')}
              </button>
            </div>
            {practice && (
              <div className="space-y-2">
                <button onClick={handlePractice} className="border border-[var(--color-border)] px-5 py-3 rounded-lg font-bold inline-flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" aria-hidden="true" />{t('gen_practice_btn')}
                </button>
                {practiceDone && <p className="text-sm text-[var(--color-muted)]">{t('gen_practice_note')}</p>}
              </div>
            )}
          </div>

          {error && <p role="alert" className="text-sm font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 rounded-lg">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button onClick={switchOperator} className="px-6 py-3 rounded-lg font-bold text-[var(--color-muted)] hover:bg-slate-100">{t('back')}</button>
            {singleField
              ? <button onClick={continueToReview} disabled={!faceVerified} className="btn-primary text-lg px-10 py-4 rounded-lg disabled:opacity-50">{t('gen_continue_review')}</button>
              : <button onClick={continueToReview} disabled={!faceVerified} className="btn-primary text-lg px-10 py-4 rounded-lg disabled:opacity-50">{t('gen_continue_review')}</button>}
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
            [t('gen_authority'), authorities.find((a) => a.value === pensioner.authority)?.labelKey ? t(authorities.find((a) => a.value === pensioner.authority)!.labelKey) : '—'],
            [t('gen_pension_type'), pensionTypes.find((a) => a.value === pensioner.pensionType)?.labelKey ? t(pensionTypes.find((a) => a.value === pensioner.pensionType)!.labelKey) : '—'],
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
            <button onClick={onConfirmClick} className="btn-primary text-lg px-10 py-4 rounded-lg">{t('gen_submit')}</button>
          </div>
          <p className="text-xs text-[var(--color-muted)]">{t('gen_back_safe')}</p>
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
               <button onClick={handleDownload} className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2"><Download className="w-5 h-5" aria-hidden="true" />{t('gen_download_pdf')}</button>
             </div>
             {notice && <p role="status" className={`mt-3 text-sm font-bold ${notice === 'pdf_download_fail' || notice === 'pdf_auto_fail' ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>{t(notice)}</p>}
             <div className="mt-5 border-t border-[var(--color-border)] pt-5">
               <ResendIdButton pramaanId={pramaanId} />
             </div>
          </div>

          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-6">
            <h4 className="font-bold">{t('gen_expect_next')}</h4>
            <p className="text-[var(--color-muted)] mt-2 leading-relaxed">{t('gen_expect_next_desc')}</p>
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
             <Link to="/pramaan/history" className="bg-white border-2 border-[var(--color-border)] text-[var(--color-text)] font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2"><FileText className="w-5 h-5" aria-hidden="true" />{t('hist_link')}</Link>
             <button onClick={cancel} className="bg-slate-900 text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2"><Home className="w-5 h-5" aria-hidden="true" />{t('gen_finish_home')}</button>
           </div>
        </div>
      )}

      {/* Confirmation prompt */}
      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-left">
            <h2 className="font-bold text-xl text-[var(--color-text)]">
              {t('gen_confirm_prefix')} {pensioner.name}. {t('gen_confirm_q')}
            </h2>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setConfirmOpen(false); handleConfirm(); }} className="btn-primary flex-1 px-6 py-4 rounded-lg font-bold">{t('gen_yes_submit')}</button>
              <button onClick={() => setConfirmOpen(false)} className="flex-1 px-6 py-4 rounded-lg font-bold border border-[var(--color-border)]">{t('gen_goback')}</button>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-3">{t('gen_back_safe')}</p>
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
