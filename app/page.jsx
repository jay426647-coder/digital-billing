'use client';

import { useEffect, useState } from 'react';
import LangToggle from '../components/LangToggle';
import { getLang } from '../lib/i18n';
import { theme } from '../lib/theme';

const text = {
  hi: {
    title: 'Jal Pay',
    tagline: 'पंचायत जल कर - डिजिटल बिलिंग',
    subtitle: 'अपना पानी का बिल आसानी से देखें और ऑनलाइन भुगतान करें।',
    myBill: '🔍 अपना बिल देखें',
    adminLogin: '🔐 एडमिन लॉगिन',
    signupPrompt: 'नई पंचायत हैं?',
    signupBtn: 'यहाँ रजिस्टर करें',
    niyam: '⚠️ नियम और चेतावनी पढ़ें',
  },
  en: {
    title: 'Jal Pay',
    tagline: 'Panchayat Water Tax - Digital Billing',
    subtitle: 'View and pay your water bill online, easily.',
    myBill: '🔍 View My Bill',
    adminLogin: '🔐 Admin Login',
    signupPrompt: 'New Panchayat?',
    signupBtn: 'Register Here',
    niyam: '⚠️ Rules & Warning',
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState('hi');

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '30px' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          padding: '40px 20px 50px 20px',
          color: '#fff',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LangToggle />
        </div>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>💧</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{t.title}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>{t.tagline}</p>
      </div>

      <div style={{ padding: '0 20px', marginTop: '-24px' }}>
        <div
          style={{
            background: theme.card,
            borderRadius: theme.radius,
            padding: '20px',
            boxShadow: theme.shadow,
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{t.subtitle}</p>
        </div>

        <a href="/mybill" style={{ textDecoration: 'none', display: 'block', marginBottom: '14px' }}>
          <div
            style={{
              background: theme.primary,
              color: '#fff',
              textAlign: 'center',
              padding: '18px',
              borderRadius: theme.radius,
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: theme.shadow,
            }}
          >
            {t.myBill}
          </div>
        </a>

        <a href="/login" style={{ textDecoration: 'none', display: 'block', marginBottom: '14px' }}>
          <div
            style={{
              background: theme.accent,
              color: '#fff',
              textAlign: 'center',
              padding: '18px',
              borderRadius: theme.radius,
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: theme.shadow,
            }}
          >
            {t.adminLogin}
          </div>
        </a>

        <p style={{ textAlign: 'center', fontSize: '13px', color: theme.textMuted, marginBottom: '20px' }}>
          {t.signupPrompt}{' '}
          <a href="/signup" style={{ color: theme.primary, fontWeight: 'bold', textDecoration: 'none' }}>
            {t.signupBtn}
          </a>
        </p>

        <a href="/niyam" style={{ textDecoration: 'none', display: 'block' }}>
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
      </div>
    </div>
  );
}
