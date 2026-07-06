'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/login/login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const validAdmin = { username: 'admin', password: 'belvedere2025' };
    if (username === validAdmin.username && password === validAdmin.password) {
      localStorage.setItem('belvedere_role', 'admin');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Try admin / belvedere2025');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span>Belvedere <span className="text-gradient">AI™</span></span>
          </a>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Sign in with your administrator credentials</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className={styles.hint}>
          <span className={styles.hintLabel}>Default:</span>
          <span className={styles.hintVal}>admin / belvedere2025</span>
        </div>
      </div>
    </div>
  );
}
