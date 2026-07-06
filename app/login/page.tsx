'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

type LoginMode = 'user' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('user');
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple credential check (V1 prototype)
    const validUser = { username: process.env.NEXT_PUBLIC_USER_USERNAME || 'user', password: process.env.NEXT_PUBLIC_USER_PASSWORD || 'belvedere2025' };
    const validAdmin = { username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'belvedere2025' };

    await new Promise((r) => setTimeout(r, 800));

    if (mode === 'admin') {
      if (username === validAdmin.username && password === validAdmin.password) {
        localStorage.setItem('belvedere_role', 'admin');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Try admin / belvedere2025');
      }
    } else {
      if (username === validUser.username && password === validUser.password) {
        localStorage.setItem('belvedere_role', 'user');
        router.push('/onboard');
      } else {
        setError('Invalid credentials. Try user / belvedere2025');
      }
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
          <h1 className={styles.title}>
            {tab === 'login' ? 'Welcome back' : 'Get started'}
          </h1>
          <p className={styles.subtitle}>
            {tab === 'login'
              ? 'Sign in to access your growth advisor'
              : 'Create your account to get started'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'user' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('user')}
          >
            User
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'admin' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('admin')}
          >
            Admin
          </button>
        </div>

        {/* Tab selector */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="John Smith" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder={mode === 'admin' ? 'admin' : 'user'}
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
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.hint}>
          <span className={styles.hintLabel}>Default credentials:</span>
          <span className={styles.hintVal}>{mode === 'admin' ? 'admin / belvedere2025' : 'user / belvedere2025'}</span>
        </div>
      </div>
    </div>
  );
}
