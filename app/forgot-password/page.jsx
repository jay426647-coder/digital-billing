'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendLink(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email daalein.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage('Aapki email pe ek link bheja gaya hai. Wahan tap karke naya password set karein.');
    setLoading(false);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '14px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ color: '#333', marginBottom: '5px', textAlign: 'center' }}>🔑 Password Bhool Gaye?</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
          Apni email daalein, reset link bhejenge.
        </p>

        <form onSubmit={handleSendLink}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: loading ? 'default' : 'pointer',
              width: '100%',
            }}
          >
            {loading ? 'Bhej rahe hain...' : 'Reset Link Bhejo'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '15px' }}>
          <a href="/login" style={{ color: '#2563eb' }}>← Login pe wapas jaayein</a>
        </p>
      </div>
    </div>
  );
}
