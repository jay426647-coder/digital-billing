'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getAbsoluteMonthIndex } from '../../lib/billUtils';
import { getLang } from '../../lib/i18n';
import { theme } from '../../lib/theme';

const text = {
  hi: {
    title: '📊 महीने वाइज रिपोर्ट',
    subtitle: 'हर महीने कितना पैसा collect हुआ, उसकी पूरी list।',
    totalCollected: 'कुल जमा राशि (सभी महीने)',
    loading: 'लोड हो रहा है...',
    noPayments: 'अभी तक कोई payment collect नहीं हुई है।',
    billsPaid: 'बिल भुगतान हुए',
  },
  en: {
    title: '📊 Monthly Report',
    subtitle: 'Full breakdown of money collected each month.',
    totalCollected: 'Total Collected (All Months)',
    loading: 'Loading...',
    noPayments: 'No payments collected yet.',
    billsPaid: 'Bills Paid',
  },
};

export default function ReportsPage() {
  const [lang, setLang] = useState('hi');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [panchayatId, setPanchayatId] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

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

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      const { data, error: billsError } = await supabase
        .from('bills')
        .select('amount, status, month, financial_year');

      if (billsError) setError(billsError.message);
      setBills(data || []);
      setLoading(false);
    }

    if (!checkingAuth && panchayatId) {
      fetchBills();
    }
  }, [checkingAuth, panchayatId]);

  const monthlyMap = {};
  bills
    .filter((b) => b.status === 'PAID')
    .forEach((b) => {
      const key = `${b.financial_year}-${b.month}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: b.month,
          financial_year: b.financial_year,
          total: 0,
          count: 0,
        };
      }
      monthlyMap[key].total += Number(b.amount);
      monthlyMap[key].count += 1;
    });

  const monthlyList = Object.values(monthlyMap).sort(
    (a, b) => getAbsoluteMonthIndex(b.financial_year, b.month) - getAbsoluteMonthIndex(a.financial_year, a.month)
  );

  const grandTotal = monthlyList.reduce((sum, m) => sum + m.total, 0);

  if (checkingAuth) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh' }}>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '20px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
          padding: '24px 20px',
          color: '#fff',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>{t.title}</h2>
        <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>{t.subtitle}</p>
      </div>

      <div style={{ padding: '0 20px' }}>
        {error && (
          <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {!panchayatId ? null : (
          <>
            <div style={{ background: theme.status.paid.bg, border: `1px solid ${theme.status.paid.border}`, padding: '16px', borderRadius: theme.radius, marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.status.paid.text }}>{t.totalCollected}</h3>
              <p style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: theme.status.paid.text }}>
                ₹ {grandTotal.toLocaleString('en-IN')}
              </p>
            </div>

            {loading ? (
              <p>{t.loading}</p>
            ) : monthlyList.length === 0 ? (
              <p style={{ color: theme.textMuted }}>{t.noPayments}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {monthlyList.map((m) => (
                  <div
                    key={`${m.financial_year}-${m.month}`}
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: theme.radius,
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: theme.shadow,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: theme.textDark, fontSize: '15px' }}>
                        {formatBillPeriod(m)}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                        {m.count} {t.billsPaid}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: theme.primaryDark }}>
                      ₹ {m.total.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
