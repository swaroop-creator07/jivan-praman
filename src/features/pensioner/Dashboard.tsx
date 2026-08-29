import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { CheckCircle2, XCircle, Clock, Play } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useAria } from '../../store/useAriaStore';
import { usePageLoad } from '../../lib/usePageLoad';
import { PageLoader } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { ReminderStub } from '../../components/ui/Reminder';

const faqs = [
  { qEn: 'Do I need to install any app or software to use this?', qHi: 'क्या इसका उपयोग करने के लिए मुझे कोई ऐप या सॉफ़्टवेयर इंस्टॉल करने की ज़रूरत है?', aEn: 'No. This portal works entirely through your web browser using your device\'s camera. There is nothing to download or install before you begin.', aHi: 'नहीं। यह पोर्टल पूरी तरह से आपके वेब ब्राउज़र और डिवाइस के कैमरे के ज़रिए काम करता है। शुरू करने से पहले डाउनलोड या इंस्टॉल करने के लिए कुछ नहीं है।' },
  { qEn: 'What is an "operator", and do I need a separate person for it?', qHi: '"ऑपरेटर" क्या है, और क्या मुझे इसके लिए अलग व्यक्ति चाहिए?', aEn: 'The operator is simply whoever is running this session on the device — very often that\'s you, the pensioner, yourself. If you\'re helping a family member who can\'t manage the process alone, you can act as the operator on their behalf.', aHi: 'ऑपरेटर वही है जो डिवाइस पर इस सत्र को चला रहा है — अक्सर वह आप स्वयं, पेंशनभोगी, होते हैं। यदि आप किसी ऐसे परिवार के सदस्य की मदद कर रहे हैं जो प्रक्रिया अकेले नहीं संभाल सकता, तो आप उनकी ओर से ऑपरेटर बन सकते हैं।' },
  { qEn: 'Can I submit life certificates for more than one family member in one sitting?', qHi: 'क्या मैं एक ही बैठक में एक से अधिक परिवार के सदस्यों के लिए जीवन प्रमाण जमा कर सकता हूँ?', aEn: 'Yes. Once you\'ve verified yourself as the operator, select "Add Pramaan ID for Another Person" after completing one certificate to submit for another pensioner without logging in again.', aHi: 'हाँ। एक प्रमाण पूरा करने के बाद, बिना फिर से लॉगिन किए दूसरे पेंशनभोगी के लिए जमा करने हेतु "किसी अन्य व्यक्ति का प्रमाण आईडी जोड़ें" चुनें।' },
  { qEn: 'What happens if my face verification keeps failing?', qHi: 'यदि मेरा फेस सत्यापन बार-बार विफल होता रहे तो क्या होगा?', aEn: 'Each failed attempt gives you more specific guidance based on what went wrong. After two failed attempts, you can choose to have someone assist you, or switch to fingerprint verification at a nearby Common Service Centre or bank branch instead.', aHi: 'हर विफल प्रयास गलती के अनुसार विशिष्ट मार्गदर्शन देता है। दो विफल प्रयासों के बाद आप सहायता के लिए किसी को चुन सकते हैं, या नज़दीकी कॉमन सर्विस सेंटर या बैंक शाखा में फिंगरप्रिंट सत्यापन चुन सकते हैं।' },
  { qEn: 'My submission was rejected — why, and what do I do?', qHi: 'मेरा जमा किया गया प्रमाण अस्वीकृत हो गया — क्यों, और मुझे क्या करना चाहिए?', aEn: 'If any detail doesn\'t match your Pension Disbursing Agency\'s records, we tell you exactly which field caused the mismatch on the Review screen, so you can correct it immediately and resubmit — without redoing the rest of the form.', aHi: 'यदि कोई विवरण आपकी पेंशन वितरण एजेंसी के रिकॉर्ड से मेल नहीं खाता, तो समीक्षा स्क्रीन पर हम बताते हैं कि किस फ़ील्ड ने मेल नहीं खाया, ताकि आप उसे तुरंत सुधार कर फिर जमा कर सकें — बाकी फ़ॉर्म दोबारा भरे बिना।' },
  { qEn: 'What happens after I receive my Pramaan ID?', qHi: 'मेरा प्रमाण आईडी मिलने के बाद क्या होता है?', aEn: 'Nothing further is required. Your certificate is automatically shared with your Pension Disbursing Agency, and an SMS confirmation is sent to your registered mobile number. Your pension will continue as usual.', aHi: 'आगे कुछ नहीं करना है। आपका प्रमाण स्वतः ही आपकी पेंशन वितरण एजेंसी को साझा हो जाता है और पंजीकृत मोबाइल पर एसएमएस पुष्टि जाती है। आपकी पेंशन पहले की तरह जारी रहेगी।' },
  { qEn: 'What is the deadline to submit my life certificate?', qHi: 'मेरा जीवन प्रमाण जमा करने की अंतिम तिथि क्या है?', aEn: 'The submission window typically runs from 1 to 30 November each year. Pensioners aged 80 and above can submit starting 1 October.', aHi: 'जमा करने की अवधि आमतौर पर हर साल 1 से 30 नवंबर तक रहती है। 80 वर्ष और उससे अधिक आयु के पेंशनभोगी 1 अक्टूबर से जमा कर सकते हैं।' },
  { qEn: 'What happens if I miss the deadline?', qHi: 'यदि मैं अंतिम तिथि छूट जाऊँ तो क्या होगा?', aEn: 'Your pension payments may be paused until a valid life certificate is submitted. We recommend submitting well before the last week of November to avoid high-traffic delays.', aHi: 'वैध जीवन प्रमाण जमा न होने तक आपकी पेंशन रुक सकती है। हाई-ट्रैफिक देरी से बचने के लिए नवंबर के अंतिम सप्ताह से पहले जमा करने की सलाह दी जाती है।' },
  { qEn: 'Will Jeevan Pramaan ever call, message, or email me asking for an OTP or a payment?', qHi: 'क्या जीवन प्रमाण कभी ओटीपी या भुगतान मांगने के लिए मुझे कॉल, संदेश या ईमेल करेगा?', aEn: 'No. We will never contact you by phone, SMS, or WhatsApp asking for your OTP, Aadhaar details, or any payment. This service is completely free. If you receive such a message, do not respond, and report it.', aHi: 'नहीं। हम कभी फ़ोन, एसएमएस या व्हाट्सऐप से आपका ओटीपी, आधार विवरण या कोई भुगतान नहीं मांगेंगे। यह सेवा पूरी तरह निःशुल्क है। यदि आपको ऐसा संदेश मिले तो उत्तर न दें और उसे रिपोर्ट करें।' },
  { qEn: 'My mobile number linked to Aadhaar has changed — what should I do?', qHi: 'मेरा आधार से जुड़ा मोबाइल नंबर बदल गया है — मुझे क्या करना चाहिए?', aEn: 'You\'ll need to update your mobile number with UIDAI at your nearest Aadhaar Seva Kendra before starting this process, since the OTP is sent only to the number linked to your Aadhaar.', aHi: 'इस प्रक्रिया शुरू करने से पहले आपको अपने नज़दीकी आधार सेवा केंद्र पर UIDAI के साथ अपना मोबाइल नंबर अपडेट करना होगा, क्योंकि ओटीपी केवल आपके आधार से जुड़े नंबर पर ही जाता है।' },
  { qEn: 'Can I use this service if I live outside India?', qHi: 'क्या मैं इस सेवा का उपयोग तब कर सकता हूँ जब मैं भारत के बाहर रहता हूँ?', aEn: 'Yes, as long as you have a working camera and a stable internet connection. Face verification works from anywhere; you don\'t need Aadhaar-registered biometric hardware.', aHi: 'हाँ, बशर्ते आपके पास काम करने वाला कैमरा और स्थिर इंटरनेट कनेक्शन हो। फेस सत्यापन कहीं भी काम करता है; आपको आधार-पंजीकृत बायोमेट्रिक हार्डवेयर की ज़रूरत नहीं।' },
  { qEn: 'How do I check the status of a certificate I\'ve already submitted?', qHi: 'मैंने पहले जमा किए गए प्रमाण की स्थिति कैसे जांचूँ?', aEn: 'Use the "Check Status" section on the homepage and enter your Pramaan ID or registered mobile number.', aHi: 'होमपेज पर "स्थिति जांचें" अनुभाग का उपयोग करें और अपना प्रमाण आईडी या पंजीकृत मोबाइल नंबर डालें।' },
];

export default function PensionerDashboard() {
  const { pensioner } = useStore();
  const { t, language } = useTranslation();
  const { announce } = useAria();
  const announcedRef = useRef(false);
  const { loading, error, retry } = usePageLoad(600);

  const latestDlc = pensioner.dlcHistory[0];
  const hasHeldPayment = pensioner.pensionPayments.some(p => p.status.includes('Held'));
  const isProcessing = latestDlc?.status === 'Submitted' || latestDlc?.status === 'Under PDA Verification';
  const isDlcValidOrProcessing = isProcessing || latestDlc?.status === 'Approved';

  let headline = t('status_on_track');
  let icon = <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" aria-hidden="true" />;
  let color = 'bg-white border-[var(--color-border)]';

  if (latestDlc?.status === 'Rejected' || (hasHeldPayment && !isDlcValidOrProcessing)) {
    headline = latestDlc?.status === 'Rejected' ? t('status_attention') + ' — ' + t('dash_action_required') : t('status_at_risk');
    icon = <XCircle className="w-10 h-10 text-[var(--color-danger)]" aria-hidden="true" />;
    color = 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/30';
  } else if (isProcessing) {
    headline = t('status_processing');
    icon = <Clock className="w-10 h-10 text-[var(--color-warn)]" aria-hidden="true" />;
    color = 'bg-[var(--color-warn-bg)] border-[var(--color-warn)]/30';
  }

  useEffect(() => {
    if (!announcedRef.current && !loading && !error) {
      announce(`${t('dash_title')}. ${headline}`);
      announcedRef.current = true;
    }
  }, [headline, announce, loading, error, t]);

  if (loading) return <PageLoader message="Loading your pension dashboard…" />;
  if (error) return <div className="max-w-4xl"><ErrorState message={error} onRetry={retry} /></div>;

  return (
    <div className="max-w-4xl space-y-8 text-left">
      <div>
        <h1 className="text-left">{t('dash_title')}</h1>
        <p className="text-left text-[var(--color-muted)] mt-2 max-w-3xl leading-relaxed">
          {t('dash_about')}
        </p>
      </div>

      <div className={`rounded-lg border p-5 sm:p-6 flex gap-4 text-left ${color}`}>
        <div className="shrink-0 mt-1">{icon}</div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">{t('dash_current_status')}</p>
          <h2 className="text-left !text-[22px] mt-1">{headline}</h2>
          <p className="text-sm font-semibold text-[var(--color-muted)] mt-1">{t('last_verified')}: {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          {latestDlc && (
            <p className="text-sm text-[var(--color-muted)] mt-1">{t('status_pramaan_id')}: <span className="font-mono font-bold text-[var(--color-text)]">{latestDlc.pramaanId}</span> • {latestDlc.status}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <Link to="/pramaan/status" className="bg-white p-6 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-info)] flex items-center">
          <span className="font-bold text-lg text-left">{t('check_status')}</span>
        </Link>
        <Link to="/pramaan/find-id" className="bg-white p-6 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-info)] flex items-center">
          <span className="font-bold text-lg text-left">{t('find_pramaan_id')}</span>
        </Link>
        <Link to="/pramaan/download" className="bg-white p-6 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-info)] flex items-center">
          <span className="font-bold text-lg text-left">{t('download_dlc')}</span>
        </Link>
        <Link to="/pramaan/generate" className="bg-white p-6 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-info)] flex items-center">
          <span className="font-bold text-lg text-left">{t('renew_lc')}</span>
        </Link>
        <Link to="/pramaan/history" className="bg-white p-6 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-info)] flex items-center">
          <span className="font-bold text-lg text-left">{t('hist_link')}</span>
        </Link>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 text-left">
        <h3 className="text-left font-bold text-lg">{t('video_title')}</h3>
        <p className="text-[var(--color-muted)] mt-1">{t('video_desc')}</p>
        <div className="mt-4 aspect-video rounded-lg bg-slate-900 flex items-center justify-center" role="img" aria-label={t('video_title')}>
          <Play className="w-12 h-12 text-white/80" aria-hidden="true" />
        </div>
      </div>

      {(latestDlc?.status === 'Rejected' || (hasHeldPayment && !isDlcValidOrProcessing)) && (
        <div className="bg-white border border-[var(--color-danger)]/30 rounded-lg p-6 text-left">
          <h3 className="text-left">{t('dash_what_wrong')}</h3>
          <p className="text-left text-[var(--color-muted)] mt-2 leading-relaxed">
            {latestDlc?.status === 'Rejected' ? latestDlc.rejectionReason : t('dash_action_desc')}
          </p>
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-5 rounded-lg mt-4 text-left">
            <p className="font-bold text-[var(--color-text)]">{t('dash_action_required')}</p>
            <p className="text-[var(--color-muted)] mt-1">{t('dash_action_desc')}</p>
            <Link to="/pramaan/generate" className="inline-flex mt-4 btn-primary text-lg px-8 py-4 rounded-lg" aria-label={t('dash_start_renewal')}>
              {t('dash_start_renewal')}
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 text-left">
        <h3 className="text-left">{t('dash_need_docs')}</h3>
        <ol className="list-decimal list-inside mt-4 space-y-3 text-[var(--color-text)] leading-relaxed">
          <li><span className="font-bold">{t('doc_aadhaar')}</span></li>
          <li><span className="font-bold">{t('doc_mobile')}</span></li>
          <li><span className="font-bold">{t('doc_ppo')}</span></li>
          <li><span className="font-bold">{t('doc_biometric')}</span></li>
          <li><span className="font-bold">{t('doc_internet')}</span></li>
        </ol>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 sm:p-8 text-left">
        <h3 className="text-left">{t('dash_faq')}</h3>
        <div className="faq-list mt-4">
          {faqs.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{language === 'hi' ? item.qHi : item.qEn}</summary>
              <p>{language === 'hi' ? item.aHi : item.aEn}</p>
            </details>
          ))}
        </div>
      </div>

      <ReminderStub />
    </div>
  );
}
