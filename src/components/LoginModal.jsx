import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

export function LoginModal({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumpadClick = (val) => {
    if (val === 'C') {
      setPin('');
      setError('');
    } else if (val === 'DEL') {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length < 6) {
        setPin(prev => prev + val);
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    // Varsayılan Güvenlik PIN Kodu: 1973
    const savedPin = localStorage.getItem('aygun_security_pin') || '1973';

    if (pin === savedPin) {
      onLogin();
    } else {
      setError('Hatalı PIN Kodu! Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="login-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(8, 14, 26, 0.92)',
      backdropFilter: 'blur(14px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '380px',
        width: '100%',
        padding: '32px 24px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        textAlign: 'center'
      }}>
        {/* Logo & Title */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
          border: '1px solid var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)'
        }}>
          <Lock size={32} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '4px' }}>AYGÜN OTO YIKAMA</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Giriş yapmak için güvenlik PIN kodunu giriniz
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            borderRadius: '10px',
            padding: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PIN Input field */}
          <input
            type="password"
            className="form-control"
            style={{
              textAlign: 'center',
              fontSize: '1.6rem',
              letterSpacing: '10px',
              fontWeight: 700,
              marginBottom: '16px',
              padding: '12px'
            }}
            value={pin}
            maxLength={6}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
          />

          {/* Touch Numpad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((val) => (
              <button
                key={val}
                type="button"
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: val === 'C' || val === 'DEL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                  color: val === 'C' || val === 'DEL' ? '#f87171' : 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onClick={() => handleNumpadClick(val)}
              >
                {val === 'DEL' ? '⌫' : val}
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: '1rem' }}>
            <LogIn size={20} /> Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
