'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Email ya Password galat hai.');
      setLoading(false);
      return;
    }

     window.location.href = '/dashboard';
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '14px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '360px' }}>
        <h2 style={{ color: '#333', marginBottom: '5px', textAlign: 'center' }}>🔐 Admin Login</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
          Digital Billing - Panchayat Dashboard
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <p style={{ textAlign: 'right', marginBottom: '15px', marginTop: 0 }}>
            <a href="/forgot-password" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>
              Password Bhool Gaye?
            </a>
          </p>

          {error && (
            <div style={{ background: '#fff1f2', color: '#9f1239', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
              {error}
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
            {loading ? 'Login ho raha hai...' : 'Login Karo'}
          </button>
        </form>
      </div>
    </div>
  );
}
