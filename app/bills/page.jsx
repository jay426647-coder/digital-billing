'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getMonthsOverdue, getAbsoluteMonthIndex } from '../../lib/billUtils';
import { getLang } from '../../lib/i18n';

const text = {
  hi: {
    pageTitle: '🧾 बिल / बिलिंग',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    currentCycle: 'वर्तमान चक्र',
    amountLabel: 'प्रति उपभोक्ता राशि (₹)',
    generating: 'जनरेट हो रहा है...',
    generateBtn: (label) => `⚡ सभी उपभोक्ताओं के लिए ${label} का बिल जनरेट करो`,
    paymentBoxTitle: '💰 भुगतान जमा करो',
    paymentBoxSub: 'उपभोक्ता चुनो, जितना पैसा मिला उतना डालो — सबसे पुराने बकाया महीने से automatically जमा हो जाएगा।',
    noDues: 'अभी कोई बकाया बिल नहीं है।',
    selectConsumer: '-- उपभोक्ता चुनो --',
    ward: 'वार्ड',
    totalDueLabel: 'कुल बकाया',
    monthsWord: 'महीने',
    overdueSuffix: 'महीने से overdue',
    amountReceivedPlaceholder: 'कितना पैसा मिला? (₹)',
    depositing: 'जमा हो रहा है...',
    depositBtn: '✅ जमा करो (Auto)',
    qrBtn: '📱 QR',
    qrNote: (amt) => `कुल ₹${amt} के लिए QR। भुगतान आने के बाद amount डालकर "जमा करो" दबाएं।`,
    settingsFirst: 'पहले',
    settingsFirstEnd: 'में अपनी पंचायत की UPI ID डालो, तभी QR बनेगा।',
    filterAll: 'सभी',
    filterPending: 'बकाया',
    filterPaid: 'भुगतान हुआ',
    filterOverdue: 'Overdue',
    loading: 'लोड हो रहा है...',
    noBillFound: 'कोई बिल नहीं मिला।',
    unknown: 'अज्ञात',
    markPaid: 'भुगतान हुआ (नकद)',
    markOverdue: 'Overdue करें',
    qrShow: '📱 QR दिखाओ',
    qrHide: 'QR छुपाओ',
    qrConsumerNote: (amt) => `उपभोक्ता इसे scan करके ₹${amt} pay कर सकता है। भुगतान आने के बाद bank/UPI app में check करके "भुगतान हुआ" दबाएं।`,
    genericAmount: 'सही राशि डालो।',
    chooseConsumerFirst: 'पहले उपभोक्ता चुनो।',
  },
  en: {
    pageTitle: '🧾 Bills / Billing',
    settings: 'Settings',
    logout: 'Logout',
    currentCycle: 'Current cycle',
    amountLabel: 'Amount per Consumer (₹)',
    generating: 'Generating...',
    generateBtn: (label) => `⚡ Generate ${label} Bill for All Consumers`,
    paymentBoxTitle: '💰 Record Payment',
    paymentBoxSub: 'Select a consumer, enter the amount received — it will auto-apply to the oldest unpaid month first.',
    noDues: 'No dues pending right now.',
    selectConsumer: '-- Select Consumer --',
    ward: 'Ward',
    totalDueLabel: 'Total Due',
    monthsWord: 'months',
    overdueSuffix: 'months overdue',
    amountReceivedPlaceholder: 'Amount received? (₹)',
    depositing: 'Depositing...',
    depositBtn: '✅ Deposit (Auto)',
    qrBtn: '📱 QR',
    qrNote: (amt) => `QR for total ₹${amt}. After payment arrives, enter the amount and press "Deposit".`,
    settingsFirst: 'First add your panchayat\'s UPI ID in',
    settingsFirstEnd: ', only then a QR will generate.',
    filterAll: 'All',
    filterPending: 'Pending',
    filterPaid: 'Paid',
    filterOverdue: 'Overdue',
    loading: 'Loading...',
    noBillFound: 'No bills found.',
    unknown: 'Unknown',
    markPaid: 'Mark Paid (Cash)',
    markOverdue: 'Mark Overdue',
    qrShow: '📱 Show QR',
    qrHide: 'Hide QR',
    qrConsumerNote: (amt) => `Consumer can scan this to pay ₹${amt}. After the payment arrives, check your bank/UPI app then press "Mark Paid".`,
    genericAmount: 'Please enter a valid amount.',
    chooseConsumerFirst: 'Please select a consumer first.',
  },
};

function getCurrentMonthYear() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const financial_year = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return { month, financial_year, label: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }) };
}

function buildUpiUri(upiId, payeeName, amount, note) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: String(amount),
    tn: note,
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
}

export default function BillsPage() {
  const [lang, setLang] = useState('hi');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [panchayatId, setPanchayatId] = useState(null);
  const [panchayat, setPanchayat] = useState(null);
  const [bills, setBills] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('100');
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [qrBillId, setQrBillId] = useState(null);

  const [payConsumerId, setPayConsumerId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [showPayQr, setShowPayQr] = useState(false);

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

  const { month, financial_year, label } = getCurrentMonthYear();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = '/login';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('panchayat_id')
        .eq('id', data.session.user.id)
        .single();

      if (profileError || !profile) {
        setError('Aapka account kisi panchayat se link nahi hai. Admin se sampark karein.');
        setCheckingAuth(false);
        return;
      }

      setPanchayatId(profile.panchayat_id);
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  async function fetchData() {
    setLoading(true);
    setError('');

    const { data: panchayatData, error: panchayatError } = await supabase
      .from('panchayats')
      .select('*')
      .eq('id', panchayatId)
      .single();

    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .select('*, consumers(name, consumer_id_str, ward_number)')
      .order('updated_at', { ascending: false });

    const { data: consumersData, error: consumersError } = await supabase
      .from('consumers')
      .select('*');

    if (panchayatError) setError(panchayatError.message);
    if (billsError) setError(billsError.message);
    if (consumersError) setError(consumersError.message);

    setPanchayat(panchayatData || null);
    setBills(billsData || []);
    setConsumers(consumersData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!checkingAuth && panchayatId) {
      fetchData();
    }
  }, [checkingAuth, panchayatId]);

  async function markOldPendingAsOverdue() {
    const { data: pendingBills } = await supabase
      .from('bills')
      .select('id, month, financial_year')
      .eq('panchayat_id', panchayatId)
      .eq('status', 'PENDING');

    const overdueIds = (pendingBills || [])
      .filter((b) => !(b.month === month && b.financial_year === financial_year))
      .map((b) => b.id);

    if (overdueIds.length > 0) {
      await supabase
        .from('bills')
        .update({ status: 'OVERDUE', updated_at: new Date().toISOString() })
        .in('id', overdueIds);
    }
  }

  async function handleGenerateBills() {
    setError('');
    if (!amount || isNaN(parseFloat(amount))) {
      setError(t.genericAmount);
      return;
    }
    setGenerating(true);

    const { data: existingBills } = await supabase
      .from('bills')
      .select('consumer_id')
      .eq('month', month)
      .eq('financial_year', financial_year);

    const existingConsumerIds = new Set((existingBills || []).map((b) => b.consumer_id));

    const newBills = consumers
      .filter((c) => !existingConsumerIds.has(c.id))
      .map((c) => ({
        consumer_id: c.id,
        panchayat_id: panchayatId,
        financial_year,
        month,
        amount: parseFloat(amount),
        status: 'PENDING',
        payment_mode: 'NONE',
      }));

    if (newBills.length > 0) {
      const { error: insertError } = await supabase.from('bills').insert(newBills);
      if (insertError) {
        setError(insertError.message);
        setGenerating(false);
        return;
      }
    }

    await markOldPendingAsOverdue();

    if (newBills.length === 0) {
      setError(`Is mahine (${label}) ke bills pehle se ban chuke hain sabhi consumers ke liye. Purane bakaya bills check kar liye gaye hain.`);
    }

    fetchData();
    setGenerating(false);
  }

  async function markPaid(billId) {
    const { error } = await supabase
      .from('bills')
      .update({ status: 'PAID', payment_mode: 'CASH', updated_at: new Date().toISOString() })
      .eq('id', billId);

    if (error) {
      setError(error.message);
    } else {
      setQrBillId(null);
      fetchData();
    }
  }

  async function markOverdue(billId) {
    const { error } = await supabase
      .from('bills')
      .update({ status: 'OVERDUE', updated_at: new Date().toISOString() })
      .eq('id', billId);

    if (error) {
      setError(error.message);
    } else {
      fetchData();
    }
  }

  function toggleQr(billId) {
    setQrBillId(qrBillId === billId ? null : billId);
  }

  async function handleAutoAllocate() {
    setPayMsg('');
    setError('');

    if (!payConsumerId) {
      setPayMsg(t.chooseConsumerFirst);
      return;
    }
    const amountReceived = parseFloat(payAmount);
    if (!amountReceived || amountReceived <= 0) {
      setPayMsg(t.genericAmount);
      return;
    }

    setAllocating(true);

    const consumerBills = bills
      .filter((b) => b.consumer_id === payConsumerId && b.status !== 'PAID')
      .sort((a, b) => getAbsoluteMonthIndex(a.financial_year, a.month) - getAbsoluteMonthIndex(b.financial_year, b.month));

    let remaining = amountReceived;

    for (const bill of consumerBills) {
      if (remaining <= 0) break;
      const billAmount = Number(bill.amount);
      if (remaining >= billAmount) {
        await supabase
          .from('bills')
          .update({ status: 'PAID', payment_mode: 'CASH', updated_at: new Date().toISOString() })
          .eq('id', bill.id);
        remaining -= billAmount;
      } else {
        await supabase
          .from('bills')
          .update({ amount: billAmount - remaining, updated_at: new Date().toISOString() })
          .eq('id', bill.id);
        remaining = 0;
      }
    }

    setPayMsg(
      remaining > 0
        ? `Payment jama ho gaya. ₹${remaining.toLocaleString('en-IN')} extra bacha (koi aur bakaya bill nahi tha).`
        : 'Payment sabhi purane bakaya bills me sahi se jama kar diya gaya (sabse purane mahine se pehle).'
    );
    setPayAmount('');
    setShowPayQr(false);
    setAllocating(false);
    fetchData();
  }

  const filteredBills = bills.filter((b) => filter === 'ALL' || b.status === filter);

  const statusColors = {
    PAID: { bg: '#ecfdf5', text: '#065f46' },
    PENDING: { bg: '#fffbeb', text: '#92400e' },
    OVERDUE: { bg: '#fff1f2', text: '#9f1239' },
  };

  const unpaidByConsumer = {};
  bills.forEach((b) => {
    if (b.status !== 'PAID') {
      if (!unpaidByConsumer[b.consumer_id]) unpaidByConsumer[b.consumer_id] = [];
      unpaidByConsumer[b.consumer_id].push(b);
    }
  });

  const consumersWithDues = consumers.filter((c) => (unpaidByConsumer[c.id] || []).length > 0);

  const selectedConsumerBills = payConsumerId ? (unpaidByConsumer[payConsumerId] || []) : [];
  const selectedConsumerTotalDue = selectedConsumerBills.reduce((sum, b) => sum + Number(b.amount), 0);
  const selectedConsumer = consumers.find((c) => c.id === payConsumerId);

  const payNote = selectedConsumer ? `${selectedConsumer.consumer_id_str || ''} Total Due` : '';
  const payUpiUri =
    panchayat && panchayat.upi_id && selectedConsumer
      ? buildUpiUri(panchayat.upi_id, panchayat.name || 'Panchayat', selectedConsumerTotalDue, payNote)
      : null;
  const payQrSrc = payUpiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payUpiUri)}`
    : null;

  if (checkingAuth) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>{t.pageTitle}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
         <a 
            href="/settings"
            style={{
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {t.settings}
          </a>
          <button
            onClick={handleLogout}
            style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginTop: '15px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {!panchayatId ? null : (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
            {t.currentCycle}: {label}
          </p>

          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>
              {t.amountLabel}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              onClick={handleGenerateBills}
              disabled={generating}
              style={{
                background: generating ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: generating ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {generating ? t.generating : t.generateBtn(label)}
            </button>
          </div>

          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#111827' }}>{t.paymentBoxTitle}</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280' }}>
              {t.paymentBoxSub}
            </p>

            {consumersWithDues.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#6b7280' }}>{t.noDues}</p>
            ) : (
              <>
                <select
                  value={payConsumerId}
                  onChange={(e) => {
                    setPayConsumerId(e.target.value);
                    setShowPayQr(false);
                    setPayMsg('');
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }}
                >
                  <option value="">{t.selectConsumer}</option>
                  {consumersWithDues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.consumer_id_str}) - {t.ward} {c.ward_number}
                    </option>
                  ))}
                </select>

                {payConsumerId && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9f1239' }}>{t.totalDueLabel} ({selectedConsumerBills.length} {t.monthsWord})</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#881337' }}>
                      ₹ {selectedConsumerTotalDue.toLocaleString('en-IN')}
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedConsumerBills.map((b) => (
                        <p key={b.id} style={{ margin: 0, fontSize: '12px', color: '#9f1239' }}>
                          • {formatBillPeriod(b)} — ₹{b.amount}
                          {getMonthsOverdue(b, month, financial_year) > 0
                            ? ` (${getMonthsOverdue(b, month, financial_year)} ${t.overdueSuffix})`
                            : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {payConsumerId && (
                  <>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={t.amountReceivedPlaceholder}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleAutoAllocate}
                        disabled={allocating}
                        style={{
                          flex: 1,
                          background: allocating ? '#9ca3af' : '#059669',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: allocating ? 'default' : 'pointer',
                        }}
                      >
                        {allocating ? t.depositing : t.depositBtn}
                      </button>
                      <button
                        onClick={() => setShowPayQr(!showPayQr)}
                        style={{ background: '#eff6ff', color: '#1e40af', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                      >
                        {t.qrBtn}
                      </button>
                    </div>

                    {showPayQr && (
                      <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        {payQrSrc ? (
                          <>
                            <img src={payQrSrc} alt="Payment QR" style={{ width: '180px', height: '180px' }} />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                              {t.qrNote(selectedConsumerTotalDue)}
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '13px', color: '#9f1239' }}>
                            {t.settingsFirst}{' '}
                            <a href="/settings" style={{ color: '#1e40af' }}>
                              {t.settings}
                            </a>
                            {t.settingsFirstEnd}
                          </p>
                        )}
                      </div>
                    )}

                    {payMsg && (
                      <p style={{ fontSize: '12px', color: '#065f46', marginTop: '10px' }}>{payMsg}</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: t.filterAll },
              { key: 'PENDING', label: t.filterPending },
              { key: 'PAID', label: t.filterPaid },
              { key: 'OVERDUE', label: t.filterOverdue },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  background: filter === f.key ? '#111827' : '#e5e7eb',
                  color: filter === f.key ? '#fff' : '#374151',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p>{t.loading}</p>
          ) : filteredBills.length === 0 ? (
            <p style={{ color: '#6b7280' }}>{t.noBillFound}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredBills.map((b) => {
                const colors = statusColors[b.status] || statusColors.PENDING;
                const note = `${b.consumers?.consumer_id_str || ''} M${b.month} ${b.financial_year}`;
                const upiUri =
                  panchayat && panchayat.upi_id
                    ? buildUpiUri(panchayat.upi_id, panchayat.name || 'Panchayat', b.amount, note)
                    : null;
                const qrSrc = upiUri
                  ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`
                  : null;
                const monthsOverdue = getMonthsOverdue(b, month, financial_year);

                return (
                  <div
                    key={b.id}
                    style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>
                          {b.consumers?.name || t.unknown}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          ID: {b.consumers?.consumer_id_str} • {t.ward} {b.consumers?.ward_number} • {formatBillPeriod(b)}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                          ₹ {b.amount}
                        </p>
                        {b.status === 'OVERDUE' && monthsOverdue > 0 && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9f1239', fontWeight: 'bold' }}>
                            ⏰ {monthsOverdue} {t.overdueSuffix}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {b.status}
                      </span>
                    </div>

                    {b.status !== 'PAID' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => markPaid(b.id)}
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {t.markPaid}
                        </button>
                        {b.status !== 'OVERDUE' && (
                          <button
                            onClick={() => markOverdue(b.id)}
                            style={{ background: '#fff1f2', color: '#9f1239', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            {t.markOverdue}
                          </button>
                        )}
                        <button
                          onClick={() => toggleQr(b.id)}
                          style={{ background: '#eff6ff', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {qrBillId === b.id ? t.qrHide : t.qrShow}
                        </button>
                      </div>
                    )}

                    {qrBillId === b.id && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center' }}>
                        {qrSrc ? (
                          <>
                            <img src={qrSrc} alt="Payment QR" style={{ width: '180px', height: '180px' }} />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                              {t.qrConsumerNote(b.amount)}
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '13px', color: '#9f1239' }}>
                            {t.settingsFirst}{' '}
                            <a href="/settings" style={{ color: '#1e40af' }}>
                              {t.settings}
                            </a>
                            {t.settingsFirstEnd}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
