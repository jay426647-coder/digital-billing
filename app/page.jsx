'use client';

import { useEffect, useState, useRef } from 'react';
import LangToggle from '../components/LangToggle';
import BottomNav from '../components/BottomNav';
import { getLang } from '../lib/i18n';
import { theme } from '../lib/theme';

const text = {
  hi: {
    title: 'Jal Pay',
    tagline: 'पंचायत जल कर - डिजिटल बिलिंग',
    subtitle: 'अपना पानी का बिल आसानी से देखें और ऑनलाइन भुगतान करें।',
    myBill: '🔍 अपना बिल देखें',
    adminLogin: '🔐 एडमिन लॉगिन',
    signupBtn: '🏛️ नई पंचायत रजिस्टर करें',
    niyam: '⚠️ नियम और चेतावनी पढ़ें',
    howItWorks: 'कैसे काम करता है',
    step1Title: 'ID/मोबाइल डालें',
    step1Desc: 'अपनी Consumer ID या मोबाइल नंबर डालकर अपना बिल खोजें।',
    step2Title: 'बिल देखें',
    step2Desc: 'अपना total बकाया और पूरी bill history देखें।',
    step3Title: 'QR से Pay करें',
    step3Desc: 'QR code scan करके सीधा अपनी पंचायत को भुगतान करें।',
    footer: '💧 गांव-गांव डिजिटल जल कर सेवा',
  },
  en: {
    title: 'Jal Pay',
    tagline: 'Panchayat Water Tax - Digital Billing',
    subtitle: 'View and pay your water bill online, easily.',
    myBill: '🔍 View My Bill',
    adminLogin: '🔐 Admin Login',
    signupBtn: '🏛️ Register New Panchayat',
    niyam: '⚠️ Rules & Warning',
    howItWorks: 'How It Works',
    step1Title: 'Enter ID/Mobile',
    step1Desc: 'Find your bill using your Consumer ID or mobile number.',
    step2Title: 'View Your Bill',
    step2Desc: 'See your total due and complete bill history.',
    step3Title: 'Pay via QR',
    step3Desc: 'Scan the QR code to pay directly to your panchayat.',
    footer: '💧 Digital Water Billing for Every Village',
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState('hi');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setLang(getLang());
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = text[lang];

  const steps = [
    { num: '1', title: t.step1Title, desc: t.step1Desc, icon: '🔍' },
    { num: '2', title: t.step2Title, desc: t.step2Desc, icon: '📄' },
    { num: '3', title: t.step3Title, desc: t.step3Desc, icon: '📱' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '30px' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          padding: '40px 20px 60px 20px',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <LangToggle />
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚙️
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  background: '#fff',
                  borderRadius: theme.radiusSmall,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  width: '220px',
                  zIndex: 10,
                }}
              >
                <a
                  href="/login"
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textDark,
                    textDecoration: 'none',
                    fontSize: '13px',
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  {t.adminLogin}
                </a>
                <a
                  href="/signup"
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textDark,
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  {t.signupBtn}
                </a>
              </div>
            )}
          </div>
        </div>
        <img src="/logo192.png" alt="Jal Pay" style={{ width: '80px', height: '80px', borderRadius: '18px', marginBottom: '10px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{t.title}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>{t.tagline}</p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div
          style={{
            background: theme.card,
            borderRadius: theme.radius,
            padding: '20px',
            boxShadow: theme.shadow,
            textAlign: 'center',
            marginTop: '-30px',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{t.subtitle}</p>
        </div>

        <a href="/mybill" style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
          <div
            style={{
              background: theme.primary,
              color: '#fff',
              textAlign: 'center',
              padding: '20px',
              borderRadius: theme.radius,
              fontSize: '17px',
              fontWeight: 'bold',
              boxShadow: theme.shadow,
            }}
          >
            {t.myBill}
          </div>
        </a>

        <h3 style={{ color: theme.textDark, fontSize: '15px', marginBottom: '14px', textAlign: 'center' }}>
          {t.howItWorks}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                background: theme.card,
                borderRadius: theme.radius,
                padding: '16px',
                boxShadow: theme.shadow,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  background: theme.accentLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {step.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: theme.textDark }}>
                  {step.num}. {step.title}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: theme.textMuted }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <a href="/niyam" style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #fecdd3',
              color: '#b91c1c',
              textAlign: 'center',
              padding: '14px',
              borderRadius: theme.radius,
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t.niyam}
          </div>
        </a>

        <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted }}>{t.footer}</p>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
