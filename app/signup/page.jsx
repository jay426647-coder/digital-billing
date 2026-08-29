'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignupPage() {
  const [panchayatName, setPanchayatName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError('');

    if (!panchayatName || !district || !state || !email || !password) {
      setError('Sabhi fields bharna zaroori hai.');
      return;
    }

    if (password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      setError('Account banane me dikkat hui, dobara try karein.');
      setLoading(false);
      return;
    }

    const { data: panchayatData, error: panchayatError } = await supabase
      .from('panchayats')
      .insert([{ name: panchayatName, district, state }])
      .select('id')
      .single();

    if (panchayatError) {
      setError(panchayatError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userId, panchayat_id: panchayatData.id, role: 'admin' }]);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '25px', borderRadius: '14px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <h2 style={{ color: '#065f46', marginBottom: '10px' }}>✅ Account Ban Gaya!</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Aapki panchayat "{panchayatName}" register ho gayi hai. Ab login karke shuru karein.
          </p>
          <a
            href="/login"
            style={{
              display: 'block',
              background: '#2563eb',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            Login Karo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '14px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ color: '#333', marginBottom: '5px', textAlign: 'center' }}>🏛️ Apni Panchayat Register Karo</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
          Digital Billing - Panchayat Dashboard
        </p>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Panchayat ka Naam</label>
            <input
              type="text"
              value={panchayatName}
              onChange={(e) => setPanchayatName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
            />
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
            {loading ? 'Register ho raha hai...' : 'Register Karo'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '15px' }}>
          Pehle se account hai? <a href="/login" style={{ color: '#2563eb' }}>Login karein</a>
        </p>
      </div>
    </div>
  );
}
