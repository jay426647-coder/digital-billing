'use client';

import { useState, useEffect } from 'react';
import { getLang, toggleLang } from '../lib/i18n';

export default function LangToggle() {
  const [lang, setLangState] = useState('hi');

  useEffect(() => {
    setLangState(getLang());
  }, []);

  function handleToggle() {
    const next = toggleLang();
    setLangState(next);
    window.location.reload();
  }

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
      <button
        onClick={handleToggle}
        style={{
          background: '#111827',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        🌐 {lang === 'hi' ? 'English' : 'हिंदी'}
      </button>
    </div>
  );
}
