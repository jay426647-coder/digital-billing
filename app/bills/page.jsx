'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

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

  async function handleGenerateBills() {
    setError('');
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Sahi amount daalo.');
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

    if (newBills.length === 0) {
      setError(`Is mahine (${label}) ke bills pehle se ban chuke hain sabhi consumers ke liye.`);
      setGenerating(false);
      return;
    }

    const { error: insertError } = await supabase.from('bills').insert(newBills);

    if (insertError) {
      setError(insertError.message);
    } else {
      fetchData();
    }
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

  const filteredBills = bills.filter((b) => filter === 'ALL' || b.status === filter);

  const statusColors = {
    PAID: { bg: '#ecfdf5', text: '#065f46' },
    PENDING: { bg: '#fffbeb', text: '#92400e' },
    OVERDUE: { bg: '#fff1f2', text: '#9f1239' },
  };

  if (checkingAuth) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>🧾 Bills / Billing</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          
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
            ⚙️ Settings
          </a>
          <button
            onClick={handleLogout}
            style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
          >
            Logout
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
            Current cycle: {label}
          </p>

          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Amount per Consumer (₹)
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
              {generating ? 'Generate ho raha hai...' : `⚡ Sabhi Consumers ke liye ${label} ka Bill Generate Karo`}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? '#111827' : '#e5e7eb',
                  color: filter === f ? '#fff' : '#374151',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredBills.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Koi bill nahi mila.</p>
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

                return (
                  <div
                    key={b.id}
                    style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>
                          {b.consumers?.name || 'Unknown'}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          ID: {b.consumers?.consumer_id_str} • Ward {b.consumers?.ward_number} • {b.financial_year}, Month {b.month}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                          ₹ {b.amount}
                        </p>
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
                          Mark Paid (Cash)
                        </button>
                        {b.status !== 'OVERDUE' && (
                          <button
                            onClick={() => markOverdue(b.id)}
                            style={{ background: '#fff1f2', color: '#9f1239', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Mark Overdue
                          </button>
                        )}
                        <button
                          onClick={() => toggleQr(b.id)}
                          style={{ background: '#eff6ff', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {qrBillId === b.id ? 'QR Chhupao' : '📱 QR Dikhao'}
                        </button>
                      </div>
                    )}

                    {qrBillId === b.id && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center' }}>
                        {qrSrc ? (
                          <>
                            <img src={qrSrc} alt="Payment QR" style={{ width: '180px', height: '180px' }} />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                              Consumer isko scan karke ₹{b.amount} pay kar sakta hai. Payment aane ke baad bank/UPI app me check karke "Mark Paid" dabayein.
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '13px', color: '#9f1239' }}>
                            Pehle{' '}
                            <a href="/settings" style={{ color: '#1e40af' }}>
                              Settings
                            </a>{' '}
                            me apni panchayat ki UPI ID daalo, tabhi QR banega.
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
