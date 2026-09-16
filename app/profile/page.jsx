'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getMonthsOverdue, getCurrentCycle } from '../../lib/billUtils';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';
import BottomNav from '../../components/BottomNav';

const text = {
  hi: {
    title: '👤 मेरी प्रोफ़ाइल',
    setupHeading: 'प्रोफ़ाइल बनाएं',
    setupDesc: 'अपनी पंचायत का कोड और मोबाइल नंबर डालें।',
    panchayatCode: 'पंचायत का कोड (जैसे HRD)',
    mobileNumber: 'मोबाइल नंबर',
    createBtn: 'प्रोफ़ाइल बनाओ',
    creating: 'बन रहा है...',
    notFound: 'कोई मैच नहीं मिला। कृपया कोड और नंबर जांचें, या सीधे अपना बिल देखें।',
    goToMyBill: 'सीधा बिल देखें →',
    idLabel: 'ID',
    ward: 'वार्ड',
    changePhoto: '📷 फ़ोटो बदलें',
    uploading: 'अपलोड हो रहा है...',
    totalDue: 'कुल बकाया',
    noDue: 'कोई बकाया नहीं',
    billHistory: 'बिल हिस्ट्री',
    noBills: 'अभी तक कोई बिल नहीं बना है।',
    overdueSuffix: 'महीने से overdue',
    qrShow: '📱 QR दिखाओ',
    qrHide: 'QR छुपाओ',
    qrNote: (amt) => `इस QR को scan करके ₹${amt} pay करें।`,
    qrUnavailable: 'अभी इस पंचायत की payment details set नहीं हैं।',
    logout: 'यह प्रोफ़ाइल हटाओ',
  },
  en: {
    title: '👤 My Profile',
    setupHeading: 'Create Profile',
    setupDesc: 'Enter your panchayat code and mobile number.',
    panchayatCode: 'Panchayat Code (e.g. HRD)',
    mobileNumber: 'Mobile Number',
    createBtn: 'Create Profile',
    creating: 'Creating...',
    notFound: 'No match found. Please check the code and number, or view your bill directly.',
    goToMyBill: 'Go to View My Bill →',
    idLabel: 'ID',
    ward: 'Ward',
    changePhoto: '📷 Change Photo',
    uploading: 'Uploading...',
    totalDue: 'Total Due',
    noDue: 'No Dues',
    billHistory: 'Bill History',
    noBills: 'No bills generated yet.',
    overdueSuffix: 'months overdue',
    qrShow: '📱 Show QR',
    qrHide: 'Hide QR',
    qrNote: (amt) => `Scan this QR to pay ₹${amt}.`,
    qrUnavailable: 'Payment details for this panchayat are not set up yet.',
    logout: 'Remove This Profile',
  },
};

function buildUpiUri(upiId, payeeName, amount, note) {
  const params = new URLSearchParams({ pa: upiId, pn: payeeName, am: String(amount), tn: note, cu: 'INR' });
  return `upi://pay?${params.toString()}`;
}

export default function ProfilePage() {
  const [lang, setLang] = useState('hi');
  const [loading, setLoading] = useState(true);
  const [consumer, setConsumer] = useState(null);
  const [panchayat, setPanchayat] = useState(null);
  const [bills, setBills] = useState([]);
  const [qrBillId, setQrBillId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [code, setCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];
  const { month: currentMonth, financial_year: currentFinancialYear } = getCurrentCycle();

  const statusColors = {
    PAID: { bg: '#ecfdf5', text: '#065f46' },
    PENDING: { bg: '#fffbeb', text: '#92400e' },
    OVERDUE: { bg: '#fff1f2', text: '#9f1239' },
  };

  async function loadConsumer(consumerId) {
    const { data: consumerData } = await supabase.from('consumers').select('*').eq('id', consumerId).single();
    if (!consumerData) {
      localStorage.removeItem('jalpay_consumer_id');
      setLoading(false);
      return;
    }

    const { data: billsData } = await supabase
      .from('bills')
      .select('*')
      .eq('consumer_id', consumerId)
      .order('financial_year', { ascending: false })
      .order('month', { ascending: false });

    const { data: panchayatData } = await supabase
      .from('panchayats')
      .select('name, upi_id')
      .eq('id', consumerData.panchayat_id)
      .single();

    setConsumer(consumerData);
    setBills(billsData || []);
    setPanchayat(panchayatData || null);
    setLoading(false);
  }

  useEffect(() => {
    const savedId = localStorage.getItem('jalpay_consumer_id');
    if (savedId) {
      loadConsumer(savedId);
    } else {
      setLoading(false);
    }
  }, []);

  async function handleCreateProfile(e) {
    e.preventDefault();
    setError('');

    if (!code || !mobile) {
      setError('Dono fields bharein.');
      return;
    }

    setCreating(true);

    const { data: panchayatData } = await supabase
      .from('panchayats')
      .select('id')
      .ilike('code', code.trim())
      .maybeSingle();

    if (!panchayatData) {
      setError(t.notFound);
      setCreating(false);
      return;
    }

    const { data: consumerData } = await supabase
      .from('consumers')
      .select('id')
      .eq('panchayat_id', panchayatData.id)
      .eq('mobile_number', mobile.trim())
      .maybeSingle();

    if (!consumerData) {
      setError(t.notFound);
      setCreating(false);
      return;
    }

    localStorage.setItem('jalpay_consumer_id', consumerData.id);
    await loadConsumer(consumerData.id);
    setCreating(false);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file || !consumer) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${consumer.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('consumer-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('consumer-photos').getPublicUrl(filePath);
    const photoUrl = publicUrlData.publicUrl;

    await supabase.from('consumers').update({ photo_url: photoUrl }).eq('id', consumer.id);

    setConsumer({ ...consumer, photo_url: photoUrl });
    setUploading(false);
  }

  function handleRemoveProfile() {
    localStorage.removeItem('jalpay_consumer_id');
    setConsumer(null);
    setBills([]);
    setPanchayat(null);
  }

  function toggleQr(billId) {
    setQrBillId(qrBillId === billId ? null : billId);
  }

  const totalDue = bills.filter((b) => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.amount), 0);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!consumer) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '80px' }}>
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
          <h2 style={{ margin: 0, fontSize: '20px' }}>{t.setupHeading}</h2>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0 0' }}>{t.setupDesc}</p>
        </div>

        <div style={{ padding: '0 20px', maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleCreateProfile} style={{ background: theme.card, padding: '16px', borderRadius: theme.radius, boxShadow: theme.shadow }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>{t.panchayatCode}</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px', textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>{t.mobileNumber}</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
                {error}
                <br />
                <a href="/mybill" style={{ color: theme.accent, fontWeight: 'bold' }}>{t.goToMyBill}</a>
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              style={{
                background: creating ? '#9ca3af' : theme.primary,
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: theme.radiusSmall,
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: creating ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {creating ? t.creating : t.createBtn}
            </button>
          </form>
        </div>
        <BottomNav active="other" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '80px' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          padding: '30px 20px',
          color: '#fff',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ position: 'relative', width: '90px', margin: '0 auto 10px auto' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: consumer.photo_url ? `url(${consumer.photo_url})` : 'rgba(255,255,255,0.2)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              border: '3px solid #fff',
              margin: '0 auto',
            }}
          >
            {!consumer.photo_url && '👤'}
          </div>
          <label
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#fff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            📷
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </label>
        </div>
        <h2 style={{ margin: 0, fontSize: '20px' }}>{consumer.name}</h2>
        <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0' }}>
          {t.idLabel}: {consumer.consumer_id_str} • {t.ward} {consumer.ward_number}
        </p>
        {uploading && <p style={{ fontSize: '11px', marginTop: '6px' }}>{t.uploading}</p>}
      </div>

      <div style={{ padding: '0 20px' }}>
        <div
          style={{
            background: totalDue > 0 ? '#fff1f2' : '#ecfdf5',
            border: `1px solid ${totalDue > 0 ? '#fecdd3' : '#a7f3d0'}`,
            padding: '16px',
            borderRadius: theme.radius,
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: totalDue > 0 ? '#9f1239' : '#065f46' }}>
            {totalDue > 0 ? t.totalDue : t.noDue}
          </h3>
          <p style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: totalDue > 0 ? '#881337' : '#064e3b' }}>
            ₹ {totalDue.toLocaleString('en-IN')}
          </p>
        </div>

        <h3 style={{ fontSize: '15px', color: theme.textDark, marginBottom: '10px' }}>{t.billHistory}</h3>

        {bills.length === 0 ? (
          <p style={{ color: theme.textMuted }}>{t.noBills}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bills.map((b) => {
              const colors = statusColors[b.status] || statusColors.PENDING;
              const monthsOverdue = getMonthsOverdue(b, currentMonth, currentFinancialYear);
              const note = `${consumer.consumer_id_str} M${b.month} ${b.financial_year}`;
              const upiUri = panchayat && panchayat.upi_id ? buildUpiUri(panchayat.upi_id, panchayat.name || 'Panchayat', b.amount, note) : null;
              const qrSrc = upiUri ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}` : null;

              return (
                <div key={b.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: '14px', boxShadow: theme.shadow }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: theme.textDark }}>{formatBillPeriod(b)}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: theme.textDark }}>₹ {b.amount}</p>
                      {b.status === 'OVERDUE' && monthsOverdue > 0 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9f1239', fontWeight: 'bold' }}>
                          ⏰ {monthsOverdue} {t.overdueSuffix}
                        </p>
                      )}
                    </div>
                    <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                      {b.status}
                    </span>
                  </div>

                  {b.status !== 'PAID' && (
                    <button
                      onClick={() => toggleQr(b.id)}
                      style={{ background: theme.accentLight, color: theme.accent, border: 'none', padding: '8px 12px', borderRadius: theme.radiusSmall, fontSize: '12px', cursor: 'pointer', marginTop: '10px', width: '100%' }}
                    >
                      {qrBillId === b.id ? t.qrHide : t.qrShow}
                    </button>
                  )}

                  {qrBillId === b.id && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center' }}>
                      {qrSrc ? (
                        <>
                          <img src={qrSrc} alt="Payment QR" style={{ width: '180px', height: '180px' }} />
                          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '8px' }}>{t.qrNote(b.amount)}</p>
                        </>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#9f1239' }}>{t.qrUnavailable}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleRemoveProfile}
          style={{ background: 'none', border: 'none', color: '#9f1239', fontSize: '12px', marginTop: '20px', width: '100%', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {t.logout}
        </button>
      </div>
      <BottomNav active="other" />
    </div>
  );
}
