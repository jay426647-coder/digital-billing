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
    <button
      onClick={handleToggle}
      style={{
        background: '#111827',
        color: '#fff',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        cursor: 'pointer',
      }}
    >
      🌐 {lang === 'hi' ? 'हिंदी' : 'English'}
    </button>
  );
}
