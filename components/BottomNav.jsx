'use client';

import { useState, useEffect } from 'react';
import { getLang } from '../lib/i18n';
import { theme } from '../lib/theme';

const text = {
  hi: {
    home: 'होम',
    myBill: 'अपना बिल',
    niyam: 'नियम',
    other: 'अन्य',
  },
  en: {
    home: 'Home',
    myBill: 'My Bill',
    niyam: 'Rules',
    other: 'Other',
  },
};

export default function BottomNav({ active }) {
  const [lang, setLang] = useState('hi');

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

  const tabs = [
    { key: 'home', href: '/', icon: '🏠', label: t.home },
    { key: 'mybill', href: '/mybill', icon: '🔍', label: t.myBill },
    { key: 'niyam', href: '/niyam', icon: '⚠️', label: t.niyam },
    { key: 'other', href: '#', icon: '⋯', label: t.other },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0',
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => (
        <a
          key={tab.key}
          href={tab.href}
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: active === tab.key ? theme.primary : theme.textMuted,
            flex: 1,
          }}
        >
          <span style={{ fontSize: '20px' }}>{tab.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: active === tab.key ? 'bold' : 'normal' }}>{tab.label}</span>
        </a>
      ))}
    </div>
  );
}
