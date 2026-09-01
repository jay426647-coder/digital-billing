export default function NiyamPage() {
  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ color: '#b91c1c', fontSize: '24px', marginBottom: '20px' }}>
        ⚠️ नियम और चेतावनी
      </h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '20px', lineHeight: '1.8' }}>
        <p>
          समय पर जल कर बिल जमा करना सभी उपभोक्ताओं के लिए अनिवार्य है। बिल का भुगतान न करने पर पंचायत द्वारा नियमानुसार उचित कार्रवाई की जा सकती है, जिसमें विलंब शुल्क (late fee) या जल आपूर्ति बाधित करना शामिल हो सकता है।
        </p>
        <p style={{ marginTop: '15px' }}>
          कृपया अपना बिल समय पर जमा करें और किसी भी असुविधा से बचें। अधिक जानकारी के लिए अपनी पंचायत कार्यालय से संपर्क करें।
        </p>
      </div>
      <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#2563eb' }}>
        ← वापस जाएं
      </a>
    </div>
  );
}
