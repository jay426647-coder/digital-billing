'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(true);
    });
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage('Password badal diya gaya hai! Ab login karein.');
    setLoading(false);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '14px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ color: '#333', marginBottom: '5px', textAlign: 'center' }}>🔑 Naya Password Set Karo</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
          Apna naya password daalein.
        </p>

        {!ready ? (
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Loading...</p>
        ) : message ? (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>
            {message}
            <br />
            <a href="/login" style={{ color: '#2563eb', display: 'inline-block', marginTop: '10px' }}>Login Karo →</a>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Naya Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#059669',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: loading ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              {loading ? 'Set ho raha hai...' : 'Password Set Karo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
