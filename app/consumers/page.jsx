'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ConsumersPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [panchayatId, setPanchayatId] = useState(null);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    consumer_id_str: '',
    name: '',
    ward_number: '',
    mobile_number: '',
  });

  const [expandedId, setExpandedId] = useState(null);
  const [historyCache, setHistoryCache] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);

  const statusColors = {
    PAID: { bg: '#ecfdf5', text: '#065f46' },
    PENDING: { bg: '#fffbeb', text: '#92400e' },
    OVERDUE: { bg: '#fff1f2', text: '#9f1239' },
  };

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

  async function fetchConsumers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('consumers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setConsumers(data);
      setError('');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!checkingAuth && panchayatId) {
      fetchConsumers();
    }
  }, [checkingAuth, panchayatId]);

  function resetForm() {
    setForm({ consumer_id_str: '', name: '', ward_number: '', mobile_number: '' });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.consumer_id_str || !form.name || !form.ward_number || !form.mobile_number) {
      setError('Sabhi fields bharna zaroori hai.');
      return;
    }

    const payload = {
      consumer_id_str: form.consumer_id_str,
      name: form.name,
      ward_number: parseInt(form.ward_number, 10),
      mobile_number: form.mobile_number,
      panchayat_id: panchayatId,
    };

    let result;
    if (editingId) {
      result = await supabase.from('consumers').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('consumers').insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      return;
    }

    resetForm();
    fetchConsumers();
  }

  function handleEdit(consumer) {
    setForm({
      consumer_id_str: consumer.consumer_id_str,
      name: consumer.name,
      ward_number: String(consumer.ward_number),
      mobile_number: consumer.mobile_number,
    });
    setEditingId(consumer.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Kya aap sach me is consumer ko delete karna chahte hain?');
    if (!confirmed) return;

    const { error } = await supabase.from('consumers').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      fetchConsumers();
    }
  }

  async function toggleHistory(consumerId) {
    if (expandedId === consumerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(consumerId);

    if (!historyCache[consumerId]) {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('consumer_id', consumerId)
        .order('financial_year', { ascending: false })
        .order('month', { ascending: false });

      if (!error) {
        setHistoryCache((prev) => ({ ...prev, [consumerId]: data || [] }));
      }
      setHistoryLoading(false);
    }
  }

  const filteredConsumers = consumers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.consumer_id_str.toLowerCase().includes(q) ||
      c.mobile_number.includes(q) ||
      String(c.ward_number).includes(q)
    );
  });

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
        <h2 style={{ color: '#333', margin: 0 }}>👥 Consumers / Households</h2>
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

      {!panchayatId ? null : (
        <>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            style={{
              background: showForm ? '#6b7280' : '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '15px',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Naya Consumer Add Karo'}
          </button>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}
            >
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Consumer ID</label>
                <input
                  type="text"
                  value={form.consumer_id_str}
                  onChange={(e) => setForm({ ...form, consumer_id_str: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Naam</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Ward Number</label>
                <input
                  type="number"
                  value={form.ward_number}
                  onChange={(e) => setForm({ ...form, ward_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="text"
                  value={form.mobile_number}
                  onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
              >
                {editingId ? 'Update Karo' : 'Save Karo'}
              </button>
            </form>
          )}

          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Naam, Consumer ID, Ward ya Mobile se dhundo..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', background: '#fff' }}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : consumers.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Abhi koi consumer add nahi hua hai.</p>
          ) : filteredConsumers.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Search se koi consumer nahi mila.</p>
          ) : (
            <>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px' }}>
                {filteredConsumers.length} consumer{filteredConsumers.length !== 1 ? 's' : ''} mile
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredConsumers.map((c) => (
                  <div
                    key={c.id}
                    style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>{c.name}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          ID: {c.consumer_id_str} • Ward {c.ward_number} • {c.mobile_number}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEdit(c)}
                          style={{ background: '#eff6ff', color: '#1e40af', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ background: '#fff1f2', color: '#9f1239', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHistory(c.id)}
                      style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginTop: '10px', width: '100%' }}
                    >
                      {expandedId === c.id ? '▲ History Chhupao' : '▼ Bill History Dekho'}
                    </button>

                    {expandedId === c.id && (
                      <div style={{ marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                        {historyLoading && !historyCache[c.id] ? (
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>Loading...</p>
                        ) : (historyCache[c.id] || []).length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>Is consumer ka abhi koi bill nahi bana hai.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {historyCache[c.id].map((b) => {
                              const colors = statusColors[b.status] || statusColors.PENDING;
                              return (
                                <div
                                  key={b.id}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '6px', padding: '8px 10px' }}
                                >
                                  <span style={{ fontSize: '12px', color: '#374151' }}>
                                    {monthNames[b.month]} {b.financial_year} — ₹{b.amount}
                                  </span>
                                  <span
                                    style={{
                                      background: colors.bg,
                                      color: colors.text,
                                      padding: '2px 8px',
                                      borderRadius: '20px',
                                      fontSize: '10px',
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
