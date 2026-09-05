'use client';

import { useState, useEffect } from 'react';
import { getLang } from '../../lib/i18n';

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
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ color: '#b91c1c', fontSize: '24px', marginBottom: '20px' }}>
        {t.heading}
      </h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '20px', lineHeight: '1.8' }}>
        <p>{t.para1}</p>
        <p style={{ marginTop: '15px' }}>{t.para2}</p>
      </div>
      <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#2563eb' }}>
        {t.back}
      </a>
    </div>
  );
}
