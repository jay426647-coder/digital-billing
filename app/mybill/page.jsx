'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getMonthsOverdue, getCurrentCycle } from '../../lib/billUtils';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';

const text = {
  hi: {
    title: 'अपना बिल देखें',
    subtitle: 'Consumer ID ya Mobile Number daal kar apna billing status dekhein.',
    inputLabel: 'Consumer ID ya Mobile Number',
    placeholder: 'Jaise: C001 ya 9876543210',
    searching: 'Dhundh rahe hain...',
    searchBtn: '🔍 Search Karo',
    emptyInput: 'Consumer ID ya Mobile Number daalein.',
    noRecord: 'Koi record nahi mila. Consumer ID ya Mobile Number check karein.',
    idLabel: 'ID',
    ward: 'Ward',
    totalDue: 'Total Bakaya (Due)',
    noDue: 'Koi Bakaya Nahi',
    billHistory: 'Bill History',
    noBills: 'Abhi tak koi bill generate nahi hua hai.',
    overdueSuffix: 'mahine se overdue',
    noRecordFound: 'Koi record nahi mila.',
  },
  en: {
    title: 'View My Bill',
    subtitle: 'Enter Consumer ID or Mobile Number to check your billing status.',
    inputLabel: 'Consumer ID or Mobile Number',
    placeholder: 'e.g. C001 or 9876543210',
    searching: 'Searching...',
    searchBtn: '🔍 Search',
    emptyInput: 'Please enter Consumer ID or Mobile Number.',
    noRecord: 'No record found. Please check Consumer ID or Mobile Number.',
    idLabel: 'ID',
    ward: 'Ward',
    totalDue: 'Total Due',
    noDue: 'No Dues',
    billHistory: 'Bill History',
    noBills: 'No bills generated yet.',
    overdueSuffix: 'months overdue',
    noRecordFound: 'No record found.',
  },
};

export default function MyBillPage() {
  const [lang, setLang] = useState('hi');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consumer, setConsumer] = useState(null);
  const [bills, setBills] = useState([]);
  const [searched, setSearched] = useState(false);

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

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setSearched(true);

    const trimmed = query.trim();
    if (!trimmed) {
      setError(t.emptyInput);
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
      setError(t.noRecord);
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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '20px' }}>
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
        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>🔍 {t.title}</h2>
        <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>{t.subtitle}</p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <form onSubmit={handleSearch} style={{ background: theme.card, padding: '16px', borderRadius: theme.radius, marginBottom: '20px', boxShadow: theme.shadow }}>
          <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>
            {t.inputLabel}
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '12px', fontSize: '15px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : theme.primary,
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: theme.radiusSmall,
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loading ? 'default' : 'pointer',
              width: '100%',
            }}
          >
            {loading ? t.searching : t.searchBtn}
          </button>
        </form>

        {error && (
          <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {consumer && (
          <>
            <div style={{ background: theme.accentLight, border: '1px solid #bfdbfe', padding: '16px', borderRadius: theme.radius, marginBottom: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: theme.accent }}>{consumer.name}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.accent }}>
                {t.idLabel}: {consumer.consumer_id_str} • {t.ward} {consumer.ward_number} • {consumer.mobile_number}
              </p>
            </div>

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
                  return (
                    <div
                      key={b.id}
                      style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: '14px', boxShadow: theme.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: theme.textDark }}>
                          {formatBillPeriod(b)}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: theme.textDark }}>
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
                  );
                })}
              </div>
            )}
          </>
        )}

        {searched && !consumer && !loading && !error && (
          <p style={{ color: theme.textMuted }}>{t.noRecordFound}</p>
        )}
      </div>
    </div>
  );
}
