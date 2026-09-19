'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SettingsPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [panchayatId, setPanchayatId] = useState(null);
  const [panchayat, setPanchayat] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exporting, setExporting] = useState(false);

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
    async function fetchPanchayat() {
      if (!panchayatId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('panchayats')
        .select('*')
        .eq('id', panchayatId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPanchayat(data);
        setUpiId(data.upi_id || '');
      }
      setLoading(false);
    }
    if (!checkingAuth && panchayatId) fetchPanchayat();
  }, [checkingAuth, panchayatId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { error } = await supabase
      .from('panchayats')
      .update({ upi_id: upiId.trim() })
      .eq('id', panchayatId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('UPI ID save ho gayi!');
    }
    setSaving(false);
  }

  async function handleExportData() {
    setError('');
    setExporting(true);

    const { data: consumers, error: consumersError } = await supabase
      .from('consumers')
      .select('*')
      .eq('panchayat_id', panchayatId);

    if (consumersError) {
      setError(consumersError.message);
      setExporting(false);
      return;
    }

    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('panchayat_id', panchayatId);

    if (billsError) {
      setError(billsError.message);
      setExporting(false);
      return;
    }

    const consumerMap = {};
    (consumers || []).forEach((c) => {
      consumerMap[c.id] = c;
    });

    const billRows = (bills || [])
      .map((b) => {
        const c = consumerMap[b.consumer_id] || {};
        return {
          'Consumer ID': c.consumer_id_str || '',
          'Naam': c.name || '',
          'Ward': c.ward_number || '',
          'Mobile': c.mobile_number || '',
          'Mahina': monthNames[b.month] || b.month,
          'Financial Year': b.financial_year,
          'Amount (Rs)': b.amount,
          'Status': b.status,
          'Payment Mode': b.payment_mode || '',
          'Last Update': b.updated_at ? new Date(b.updated_at).toLocaleString('en-IN') : '',
        };
      })
      .sort((a, b) => (a['Naam'] || '').localeCompare(b['Naam'] || ''));

    const consumerRows = (consumers || []).map((c) => ({
      'Consumer ID': c.consumer_id_str,
      'Naam': c.name,
      'Ward': c.ward_number,
      'Mobile': c.mobile_number,
    }));

    const wb = XLSX.utils.book_new();
    const wsConsumers = XLSX.utils.json_to_sheet(consumerRows);
    const wsBills = XLSX.utils.json_to_sheet(billRows);
    XLSX.utils.book_append_sheet(wb, wsConsumers, 'Consumers');
    XLSX.utils.book_append_sheet(wb, wsBills, 'Sabhi Bills');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${panchayat?.name || 'Panchayat'}-Full-Data-${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    setExporting(false);
  }

  if (checkingAuth) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>⚙️ Settings</h2>
        <button
          onClick={handleLogout}
          style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {panchayat && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Panchayat</p>
              <p style={{ margin: '2px 0 0 0', fontWeight: 'bold', color: '#111827' }}>{panchayat.name}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {panchayat.district}, {panchayat.state}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSave}
            style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e5e7eb' }}
          >
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Panchayat ki UPI ID
            </label>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 0, marginBottom: '8px' }}>
              Ye wahi UPI ID hogi jisme consumers ka payment jayega (jaise 9876543210@paytm). Bill QR yahi UPI ID use karega.
            </p>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="jaise 9876543210@paytm"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '12px' }}
            />

            {success && (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
                ✅ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: saving ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {saving ? 'Save ho raha hai...' : 'Save Karo'}
            </button>
          </form>

          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
              📥 पूरा Data Download करो
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 0, marginBottom: '10px' }}>
              Sabhi consumers aur sabhi bills (kisne diya, kisne nahi) ek Excel file me download karo — kisi bhi adhikari ko WhatsApp/email se bhejnе ke liye.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              style={{
                background: exporting ? '#9ca3af' : '#059669',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: exporting ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {exporting ? 'Ban raha hai...' : '📥 Poora Data Download Karo (Excel)'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
