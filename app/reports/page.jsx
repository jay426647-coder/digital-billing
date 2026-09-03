'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatBillPeriod, getAbsoluteMonthIndex } from '../../lib/billUtils';

export default function ReportsPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [panchayatId, setPanchayatId] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#333', marginBottom: '5px' }}>📊 Mahine Wise Report</h2>
      <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
        Har mahine kitna paisa collect hua, uski poori list.
      </p>

      {error && (
        <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {!panchayatId ? null : (
        <>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#065f46' }}>Total Collected (Sabhi Mahine)</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#064e3b' }}>
              ₹ {grandTotal.toLocaleString('en-IN')}
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : monthlyList.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Abhi tak koi payment collect nahi hui hai.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {monthlyList.map((m) => (
                <div
                  key={`${m.financial_year}-${m.month}`}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#111827', fontSize: '15px' }}>
                      {formatBillPeriod(m)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                      {m.count} Bills Paid
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                    ₹ {m.total.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
