'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ConsumersPage() {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    consumer_id_str: '',
    name: '',
    ward_number: '',
    mobile_number: '',
  });

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
    fetchConsumers();
  }, []);

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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>👥 Consumers / Households</h2>

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

      {error && (
        <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

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

      {loading ? (
        <p>Loading...</p>
      ) : consumers.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Abhi koi consumer add nahi hua hai.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {consumers.map((c) => (
            <div
              key={c.id}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>{c.name}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  ID: {c.consumer_id_str} • Ward {c.ward_number} • {c.mobile_number}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
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
          ))}
        </div>
      )}
    </div>
  );
}
