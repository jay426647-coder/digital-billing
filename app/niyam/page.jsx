'use client';

import { useState, useEffect } from 'react';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';
import BottomNav from '../../components/BottomNav';

const text = {
  hi: {
    heading: '⚠️ पंचायत जल कर: मुख्य नियम और सख्त चेतावनी',
    rules: [
      {
        title: '1. समय पर बिल भुगतान',
        desc: 'हर उपभोक्ता को तय समय पर अपना जल कर (Water Tax) जमा करना अनिवार्य है, जिससे गाँव में पानी की सप्लाई चालू रहे।',
      },
      {
        title: '2. सरकारी योजनाओं पर रोक & कनेक्शन काटना',
        desc: 'लंबे समय तक बिल बकाया रखने पर पानी का कनेक्शन काट दिया जाएगा, और भविष्य में मिलने वाली सरकारी योजनाओं का लाभ या जरूरी प्रमाण-पत्र भी रोके जा सकते हैं।',
      },
      {
        title: '3. पूरी जिम्मेदारी आपकी',
        desc: 'बिल समय पर न भरने के कारण पानी कटने या किसी भी असुविधा की पूरी जिम्मेदारी स्वयं उपभोक्ता की होगी, पंचायत जिम्मेदार नहीं होगी।',
      },
      {
        title: '4. पानी व्यर्थ न बहाएं',
        desc: 'नलों पर पानी खुला छोड़ना या मोटर से अवैध पानी खींचना दंडनीय है, इसपर जुर्माना लग सकता है।',
      },
      {
        title: '5. बिल में गलती',
        desc: 'नाम या राशि में कोई भूल होने पर तुरंत पंचायत कार्यालय या ऑपरेटर से संपर्क करें।',
      },
    ],
    back: '← वापस जाएं',
  },
  en: {
    heading: '⚠️ Panchayat Water Tax: Key Rules & Strict Warning',
    rules: [
      {
        title: '1. Timely Bill Payment',
        desc: 'Every consumer must deposit their water tax on time, so that the village water supply remains uninterrupted.',
      },
      {
        title: '2. Government Scheme Hold & Connection Cutting',
        desc: 'If a bill remains unpaid for a long time, the water connection will be disconnected, and future government scheme benefits or necessary certificates may also be withheld.',
      },
      {
        title: '3. Full Responsibility Is Yours',
        desc: 'The consumer is fully responsible for any inconvenience or water disconnection caused by not paying the bill on time; the panchayat will not be responsible.',
      },
      {
        title: "4. Don't Waste Water",
        desc: 'Leaving taps running or illegally drawing water with a motor is punishable and may attract a fine.',
      },
      {
        title: '5. Error In Bill',
        desc: 'If there is any mistake in the name or amount, immediately contact the panchayat office or the operator.',
      },
    ],
    back: '← Go Back',
  },
};

export default function NiyamPage() {
  const [lang, setLang] = useState('hi');

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '80px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
          padding: '24px 20px',
          color: '#fff',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '19px', lineHeight: '1.4' }}>{t.heading}</h1>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {t.rules.map((rule, idx) => (
            <div
              key={idx}
              style={{
                background: theme.card,
                border: '1px solid #fecdd3',
                borderRadius: theme.radius,
                padding: '16px',
                boxShadow: theme.shadow,
              }}
            >
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#b91c1c', fontSize: '14px' }}>
                {rule.title}
              </p>
              <p style={{ margin: 0, color: theme.textDark, fontSize: '13px', lineHeight: '1.7' }}>{rule.desc}</p>
            </div>
          ))}
        </div>

        <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: theme.accent, fontWeight: 'bold', textDecoration: 'none' }}>
          {t.back}
        </a>
      </div>
      <BottomNav active="niyam" />
    </div>
  );
}
