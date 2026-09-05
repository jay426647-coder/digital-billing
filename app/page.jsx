'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import LangToggle from '../components/LangToggle';
import { getLang } from '../lib/i18n';
import { theme } from '../lib/theme';

const text = {
  hi: {
    title: 'डिजिटल बिलिंग',
    subtitle: 'पंचायत डैशबोर्ड',
    consumers: 'उपभोक्ता',
    bills: 'बिल',
    myBill: 'अपना बिल देखें',
    report: 'रिपोर्ट',
    loading: 'लोड हो रहा है...',
    totalCollected: 'कुल जमा राशि',
    paidBills: 'भुगतान किए गए बिल',
    totalPending: 'कुल बकाया राशि',
    unpaidBills: 'अवैतनिक बिल',
    activeConnections: 'सक्रिय कनेक्शन',
    totalConsumers: 'कुल उपभोक्ता',
    overdueAccounts: 'अतिदेय खाते',
    requiresNotice: 'ध्यान देने की जरूरत',
    niyam: '⚠️ नियम और चेतावनी पढ़ें',
  },
  en: {
    title: 'Digital Billing',
    subtitle: 'Panchayat Dashboard',
    consumers: 'Consumers',
    bills: 'Bills',
    myBill: 'View My Bill',
    report: 'Report',
    loading: 'Loading...',
    totalCollected: 'Total Collected',
    paidBills: 'Paid Bills',
    totalPending: 'Total Pending Dues',
    unpaidBills: 'Unpaid Bills',
    activeConnections: 'Active Connections',
    totalConsumers: 'Total Consumers',
    overdueAccounts: 'Overdue Accounts',
    requiresNotice: 'Requires Notice',
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

  const gridItems = [
    { href: '/consumers', label: t.consumers, icon: '👥', color: theme.accent },
    { href: '/bills', label: t.bills, icon: '🧾', color: theme.primaryDark },
    { href: '/mybill', label: t.myBill, icon: '🔍', color: theme.primary },
    { href: '/reports', label: t.report, icon: '📊', color: '#7c3aed' },
  ];

  const statCards = [
    {
      label: t.totalCollected,
      value: `₹ ${stats.totalCollected.toLocaleString('en-IN')}`,
      sub: `${stats.paidCount} ${t.paidBills}`,
      colors: theme.status.paid,
    },
    {
      label: t.totalPending,
      value: `₹ ${stats.totalPending.toLocaleString('en-IN')}`,
      sub: `${stats.unpaidCount} ${t.unpaidBills}`,
      colors: theme.status.overdue,
    },
    {
      label: t.activeConnections,
      value: stats.activeConnections,
      sub: t.totalConsumers,
      colors: { bg: theme.accentLight, text: theme.accent, border: '#bfdbfe' },
    },
    {
      label: t.overdueAccounts,
      value: stats.overdueCount,
      sub: t.requiresNotice,
      colors: theme.status.pending,
    },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '30px' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          padding: '24px 20px 40px 20px',
          color: '#fff',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LangToggle />
        </div>
        <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '2px' }}>{t.subtitle}</div>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>💧 {t.title}</h1>
      </div>

      <div style={{ padding: '0 20px', marginTop: '-24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {gridItems.map((item) => (
            <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: theme.card,
                  borderRadius: theme.radius,
                  padding: '18px 14px',
                  boxShadow: theme.shadow,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    margin: '0 auto 10px auto',
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textDark }}>{item.label}</span>
              </div>
            </a>
          ))}
        </div>

        {loading ? (
          <p style={{ color: theme.textMuted }}>{t.loading}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {statCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: card.colors.bg,
                  border: `1px solid ${card.colors.border}`,
                  padding: '16px',
                  borderRadius: theme.radius,
                }}
              >
                <h3 style={{ color: card.colors.text, fontSize: '13px', margin: '0 0 6px 0', fontWeight: '600' }}>
                  {card.label}
                </h3>
                <p style={{ color: card.colors.text, fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                  {card.value}
                </p>
                <span style={{ color: card.colors.text, fontSize: '12px', opacity: 0.85 }}>{card.sub}</span>
              </div>
            ))}
          </div>
        )}

        <a href="/niyam" style={{ textDecoration: 'none', display: 'block' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #fecdd3',
              color: '#b91c1c',
              textAlign: 'center',
              padding: '14px',
              borderRadius: theme.radius,
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t.niyam}
          </div>
        </a>
      </div>
    </div>
  );
}
