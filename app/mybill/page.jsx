'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getMonthsOverdue, getCurrentCycle } from '../../lib/billUtils';

export default function MyBillPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consumer, setConsumer] = useState(null);
  const [bills, setBills] = useState([]);
  const [searched, setSearched] = useState(false);

  const { month: currentMonth, financial_year: currentFinancialYear } = getCurrentCycle();

  const statusColors = {
    PAID: { bg: '#ecfdf5', text: '#065f46' },
    PENDING: { bg: '#fffbeb', text: '#92400e' },
    OVERDUE: { bg: '#fff1f2', text: '#9f1239' },
  };

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setSearched(true);

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Consumer ID ya Mobile Number daalein.');
      setConsumer(null);
      setBills([]);
      return;
    }

    setLoading(true);

    const { data: consumerData, error: consumerError } = await supabase
      .from('consumers')
      .select('*')
      .or(`mobile_number.eq.${trimmed},consumer_id_str.eq.${trimmed}`)
      .limit(1)
      .maybeSingle();

    if (consumerError) {
      setError(consumerError.message);
      setLoading(false);
      return;
    }

    if (!consumerData) {
      setConsumer(null);
      setBills([]);
      setError('Koi record nahi mila. Consumer ID ya Mobile Number check karein.');
      setLoading(false);
      return;
    }

    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('consumer_id', consumerData.id)
      .order('financial_year', { ascending: false })
      .order('month', { ascending: false });

    if (billsError) {
      setError(billsError.message);
    }

    setConsumer(consumerData);
    setBills(billsData || []);
    setLoading(false);
  }

  const totalDue = bills
    .filter((b) => b.status !== 'PAID')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#333', marginBottom: '5px' }}>🔍 Apna Bill Dekhein</h2>
      <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
        Consumer ID ya Mobile Number daal kar apna billing status dekhein.
      </p>

      <form onSubmit={handleSearch} style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
        <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>
          Consumer ID ya Mobile Number
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jaise: C001 ya 9876543210"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '12px', fontSize: '15px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: loading ? 'default' : 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Dhundh rahe hain...' : '🔍 Search Karo'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {consumer && (
        <>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#1e3a8a' }}>{consumer.name}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1e40af' }}>
              ID: {consumer.consumer_id_str} • Ward {consumer.ward_number} • {consumer.mobile_number}
            </p>
          </div>

          <div
            style={{
              background: totalDue > 0 ? '#fff1f2' : '#ecfdf5',
              border: `1px solid ${totalDue > 0 ? '#fecdd3' : '#a7f3d0'}`,
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: totalDue > 0 ? '#9f1239' : '#065f46' }}>
              {totalDue > 0 ? 'Total Bakaya (Due)' : 'Koi Bakaya Nahi'}
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: totalDue > 0 ? '#881337' : '#064e3b' }}>
              ₹ {totalDue.toLocaleString('en-IN')}
            </p>
          </div>

          <h3 style={{ fontSize: '15px', color: '#374151', marginBottom: '10px' }}>Bill History</h3>

          {bills.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Abhi tak koi bill generate nahi hua hai.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bills.map((b) => {
                const colors = statusColors[b.status] || statusColors.PENDING;
                const monthsOverdue = getMonthsOverdue(b, currentMonth, currentFinancialYear);
                return (
                  <div
                    key={b.id}
                    style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>
                        {formatBillPeriod(b)}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                        ₹ {b.amount}
                      </p>
                      {b.status === 'OVERDUE' && monthsOverdue > 0 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9f1239', fontWeight: 'bold' }}>
                          ⏰ {monthsOverdue} mahine se overdue
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
                );
              })}
            </div>
          )}
        </>
      )}

      {searched && !consumer && !loading && !error && (
        <p style={{ color: '#6b7280' }}>Koi record nahi mila.</p>
      )}
    </div>
  );
}
