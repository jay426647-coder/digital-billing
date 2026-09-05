'use client';

import { useState, useEffect } from 'react';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';

const text = {
  hi: {
    heading: '⚠️ नियम और चेतावनी',
    para1:
      'समय पर जल कर बिल जमा करना सभी उपभोक्ताओं के लिए अनिवार्य है। बिल का भुगतान न करने पर पंचायत द्वारा नियमानुसार उचित कार्रवाई की जा सकती है, जिसमें विलंब शुल्क (late fee) या जल आपूर्ति बाधित करना शामिल हो सकता है।',
    para2:
      'कृपया अपना बिल समय पर जमा करें और किसी भी असुविधा से बचें। अधिक जानकारी के लिए अपनी पंचायत कार्यालय से संपर्क करें।',
    back: '← वापस जाएं',
  },
  en: {
    heading: '⚠️ Rules & Warning',
    para1:
      'Paying the water tax bill on time is mandatory for all consumers. Failure to pay the bill may lead to appropriate action by the Panchayat as per rules, which may include a late fee or disruption of water supply.',
    para2:
      'Please deposit your bill on time to avoid any inconvenience. For more information, please contact your Panchayat office.',
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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '20px' }}>
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
        <h1 style={{ margin: 0, fontSize: '22px' }}>{t.heading}</h1>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div
          style={{
            background: theme.card,
            border: '1px solid #fecdd3',
            borderRadius: theme.radius,
            padding: '20px',
            lineHeight: '1.8',
            boxShadow: theme.shadow,
            color: theme.textDark,
          }}
        >
          <p>{t.para1}</p>
          <p style={{ marginTop: '15px' }}>{t.para2}</p>
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: theme.accent, fontWeight: 'bold', textDecoration: 'none' }}>
          {t.back}
        </a>
      </div>
    </div>
  );
}
