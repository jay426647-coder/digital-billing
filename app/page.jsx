'use client';

import { useEffect, useState, useRef } from 'react';
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
    signupBtn: '🏛️ नई पंचायत रजिस्टर करें',
    niyam: '⚠️ नियम और चेतावनी पढ़ें',
  },
  en: {
    title: 'Jal Pay',
    tagline: 'Panchayat Water Tax - Digital Billing',
    subtitle: 'View and pay your water bill online, easily.',
    myBill: '🔍 View My Bill',
    adminLogin: '🔐 Admin Login',
    signupBtn: '🏛️ Register New Panchayat',
    niyam: '⚠️ Rules & Warning',
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
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
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

        <a href="/mybill" style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
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
