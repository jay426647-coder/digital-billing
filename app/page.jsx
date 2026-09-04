'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import LangToggle from '../components/LangToggle';
import { getLang } from '../lib/i18n';

const text = {
  hi: {
    title: '📱 डिजिटल बिलिंग - पंचायत डैशबोर्ड',
    consumers: '👥 उपभोक्ता',
    bills: '🧾 बिल',
    myBill: '🔍 अपना बिल देखें',
    loading: 'लोड हो रहा है...',
    totalCollected: 'कुल जमा राशि',
    paidBills: 'भुगतान किए गए बिल',
    totalPending: 'कुल बकाया राशि',
    unpaidBills: 'अवैतनिक बिल',
    activeConnections: 'सक्रिय कनेक्शन',
    totalConsumers: 'कुल उपभोक्ता',
    overdueAccounts: 'अतिदेय खाते',
    requiresNotice: 'ध्यान देने की जरूरत',
    report: '📊 महीने वाइज रिपोर्ट',
    niyam: '⚠️ नियम और चेतावनी पढ़ें',
  },  
  en: {
    title: '📱 Digital Billing - Panchayat Dashboard',
    consumers: '👥 Consumers',
    bills: '🧾 Bills',
    myBill: '🔍 View My Bill',
    loading: 'Loading...',
    totalCollected: 'Total Collected',
    paidBills: 'Paid Bills',
    totalPending: 'Total Pending Dues',
    unpaidBills: 'Unpaid Bills',
    activeConnections: 'Active Connections',
    totalConsumers: 'Total Consumers',
    overdueAccounts: 'Overdue Accounts',
    requiresNotice: 'Requires Notice',
    report: '📊 Monthly Report',
    niyam: '⚠️ Rules & Warning',
  },
};

export default function DigitalBillingDashboard() {
  const [lang, setLang] = useState('hi');
  const [stats, setStats] = useState({
    totalCollected: 0,
    paidCount: 0,
    totalPending: 0,
    unpaidCount: 0,
    activeConnections: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLang(getLang());
  }, []);

  const t = text[lang];

  useEffect(() => {
    async function fetchStats() {
      const { data: bills } = await supabase.from('bills').select('amount, status');
      const { count: consumerCount } = await supabase
        .from('consumers')
        .select('*', { count: 'exact', head: true });

      const paidBills = (bills || []).filter((b) => b.status === 'PAID');
      const pendingBills = (bills || []).filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE');
      const overdueBills = (bills || []).filter((b) => b.status === 'OVERDUE');

      setStats({
        totalCollected: paidBills.reduce((sum, b) => sum + Number(b.amount), 0),
        paidCount: paidBills.length,
        totalPending: pendingBills.reduce((sum, b) => sum + Number(b.amount), 0),
        unpaidCount: pendingBills.length,
        activeConnections: consumerCount || 0,
        overdueCount: overdueBills.length,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LangToggle />
      </div>

      <h2 style={{ color: '#333', marginBottom: '20px' }}>{t.title}</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <a href="/consumers" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ background: '#2563eb', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px' }}>
            {t.consumers}
          </div>
        </a>
        <a href="/bills" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ background: '#111827', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px' }}>
            {t.bills}
          </div>
        </a>
      </div>

      <a href="/mybill" style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
        <div style={{ background: '#059669', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px' }}>
          {t.myBill}
        </div>
      </a>

      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ color: '#065f46', fontSize: '14px', margin: '0 0 5px 0' }}>{t.totalCollected}</h3>
            <p style={{ color: '#064e3b', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹ {stats.totalCollected.toLocaleString('en-IN')}
            </p>
            <span style={{ color: '#047857', fontSize: '12px' }}>{stats.paidCount} {t.paidBills}</span>
          </div>

          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ color: '#9f1239', fontSize: '14px', margin: '0 0 5px 0' }}>{t.totalPending}</h3>
            <p style={{ color: '#881337', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹ {stats.totalPending.toLocaleString('en-IN')}
            </p>
            <span style={{ color: '#be123c', fontSize: '12px' }}>{stats.unpaidCount} {t.unpaidBills}</span>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ color: '#1e40af', fontSize: '14px', margin: '0 0 5px 0' }}>{t.activeConnections}</h3>
            <p style={{ color: '#1e3a8a', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.activeConnections}</p>
            <span style={{ color: '#2563eb', fontSize: '12px' }}>{t.totalConsumers}</span>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ color: '#92400e', fontSize: '14px', margin: '0 0 5px 0' }}>{t.overdueAccounts}</h3>
            <p style={{ color: '#78350f', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.overdueCount}</p>
            <span style={{ color: '#b45309', fontSize: '12px' }}>{t.requiresNotice}</span>
          </div>
        </div>
      )}
      <a href="/reports" style={{ textDecoration: 'none', display: 'block', marginTop: '20px' }}>
        <div style={{ background: '#7c3aed', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }}>
          {t.report}
        </div>
      </a>
      <a href="/niyam" style={{ textDecoration: 'none', display: 'block', marginTop: '20px' }}>
        <div style={{ background: '#b91c1c', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }}>
          {t.niyam}
        </div>
      </a>
    </div>
  );
}
