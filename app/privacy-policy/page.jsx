'use client';

import { useState, useEffect } from 'react';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';

const text = {
  hi: {
    heading: '🔒 गोपनीयता नीति (Privacy Policy)',
    intro: 'Jal Pay app aapki niji jaankari (privacy) ka khayal rakhता hai। Ye page batाता hai hum kaunsi jaankari lete hain, aur usका kya use karte hain।',
    sections: [
      {
        title: '1. Hum kaunsi jaankari lete hain',
        desc: 'Consumer ka naam, mobile number, ward number, aur agar consumer khud daale to unki photo। Panchayat admin ka email aur account ki jaankari। Bill aur payment se juडी jaankari (kitna diya, kitna baki hai).',
      },
      {
        title: '2. Is jaankari ka kya use hota hai',
        desc: 'Sirf water tax bill banane, dikhाने, aur payment collect karne ke liye। Kisi tarah ki marketing ya kisi teesre insaan/company ko becha nahi jata.',
      },
      {
        title: '3. Jaankari kahan store hoti hai',
        desc: 'Sabhi jaankari surakshित server (Supabase) pe rakhी jाती hai। Consumer photos ek public storage me rakhी jati hain, jo sirf app ke andar hi dikhती hain.',
      },
      {
        title: '4. Payment ki jaankari',
        desc: 'Payment seedha panchayat ki UPI ID pe hoti hai (UPI app ke through)। Jal Pay khud consumer ka card/bank detail store nahi karta.',
      },
      {
        title: '5. Apni jaankari hatana',
        desc: 'Apni Profile ko "Remove This Profile" dabakar apne phone se hata sakte hain। Poori jaankari hatаने ke liye apni panchayat office se sampark karein.',
      },
      {
        title: '6. Sampark',
        desc: 'Kisi bhi sawaal ke liye apni panchayat office ya app operator se sampark karein।',
      },
    ],
    back: '← वापस जाएं',
  },
  en: {
    heading: '🔒 Privacy Policy',
    intro: 'Jal Pay respects your privacy. This page explains what information we collect and how it is used.',
    sections: [
      {
        title: '1. What information we collect',
        desc: "Consumer's name, mobile number, ward number, and their photo if they choose to add one. Panchayat admin's email and account details. Bill and payment related information (amount paid, amount due).",
      },
      {
        title: '2. How this information is used',
        desc: 'Only to generate, display, and collect payment for water tax bills. It is never used for marketing or sold to any third party.',
      },
      {
        title: '3. Where information is stored',
        desc: 'All data is stored on a secure server (Supabase). Consumer photos are stored in a public storage location that is only shown within the app.',
      },
      {
        title: '4. Payment information',
        desc: "Payments go directly to the panchayat's UPI ID via the UPI app. Jal Pay does not itself store any consumer card or bank details.",
      },
      {
        title: '5. Removing your information',
        desc: 'You can remove your Profile from your device using "Remove This Profile". To remove your data entirely, please contact your panchayat office.',
      },
      {
        title: '6. Contact',
        desc: 'For any questions, please contact your panchayat office or the app operator.',
      },
    ],
    back: '← Go Back',
  },
};

export default function PrivacyPolicyPage() {
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
          padding: '24px 20px',
          color: '#fff',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px' }}>{t.heading}</h1>
        <p style={{ fontSize: '13px', opacity: 0.9, margin: '6px 0 0 0' }}>{t.intro}</p>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {t.sections.map((s, idx) => (
            <div key={idx} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: '16px', boxShadow: theme.shadow }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: theme.textDark, fontSize: '14px' }}>{s.title}</p>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px', lineHeight: '1.7' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: theme.accent, fontWeight: 'bold', textDecoration: 'none' }}>
          {t.back}
        </a>
      </div>
    </div>
  );
}
