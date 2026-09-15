'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email daalein.');
      return;
    }

    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setMessage('OTP aapki email pe bhej diya gaya hai.');
    setStep(2);
    setLoading(false);
  }

  async function handleVerifyAndReset(e) {
    e.preventDefault();
    setError('');

    if (!otp || !newPassword) {
      setError('OTP aur naya password dono daalein.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError('OTP galat hai ya expire ho gaya hai.');
      setLoading(false);
      return;
    }

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
        <h2 style={{ color: '#333', marginBottom: '5px', textAlign: 'center' }}>🔑 Password Bhool Gaye?</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
          {step === 1 ? 'Apni email daalein, OTP bhejenge.' : 'OTP daalein aur naya password set karein.'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
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
              {loading ? 'Bhej rahe hain...' : 'OTP Bhejo'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Email pe aaya OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px' }}
              />
            </div>

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

            {message && (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
                {message}
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

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '15px' }}>
          <a href="/login" style={{ color: '#2563eb' }}>← Login pe wapas jaayein</a>
        </p>
      </div>
    </div>
  );
}
