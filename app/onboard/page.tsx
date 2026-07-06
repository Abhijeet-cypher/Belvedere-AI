'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboard.module.css';
import {
  IconBelvedereLogo,
  IconBriefcase,
  IconBarChart,
  IconTarget,
  IconZap,
  IconCheckCircle,
} from '@/lib/icons';

const INDUSTRIES = [
  'Technology', 'E-commerce', 'SaaS', 'Healthcare', 'Finance & Banking',
  'Real Estate', 'Education', 'Food & Beverage', 'Retail', 'Manufacturing',
  'Professional Services', 'Media & Entertainment', 'Travel & Hospitality',
  'Non-profit', 'Construction', 'Automotive', 'Fashion & Apparel', 'Other',
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Germany', 'France', 'Netherlands', 'Singapore', 'UAE', 'South Africa',
  'Nigeria', 'Brazil', 'Mexico', 'Other',
];

const EMPLOYEE_RANGES = [
  '1-10 (Solo/Micro)', '11-50 (Small)', '51-200 (Mid-size)',
  '201-500 (Growing)', '501-1000 (Large)', '1000+ (Enterprise)',
];

const REVENUE_RANGES = [
  'Pre-revenue (Startup)', 'Under $100K', '$100K - $500K',
  '$500K - $1M', '$1M - $5M', '$5M - $20M', '$20M+', 'Prefer not to say',
];

const BUDGET_RANGES = [
  'Under $1,000/mo', '$1,000 - $5,000/mo', '$5,000 - $15,000/mo',
  '$15,000 - $50,000/mo', '$50,000 - $100,000/mo', '$100,000+/mo',
];

const GOALS = [
  'Increase brand awareness', 'Generate more leads', 'Improve online presence',
  'Launch a new product', 'Enter new markets', 'Increase revenue',
  'Build thought leadership', 'Improve customer retention', 'Scale marketing operations',
  'Improve ROI on ad spend', 'Build a content engine', 'Improve SEO rankings',
];

const CHALLENGES = [
  'Not enough leads', 'Low brand awareness', 'High customer acquisition cost',
  'Poor online visibility', 'Inconsistent marketing', 'No clear strategy',
  'Limited budget', 'Small team', 'Competitive market', 'Poor website conversion',
  'No PR presence', 'Outdated brand positioning',
];

type FormData = {
  business_name: string;
  industry: string;
  country: string;
  num_employees: string;
  annual_revenue: string;
  marketing_budget: string;
  business_goals: string[];
  growth_challenges: string[];
  additional_context: string;
};

const INITIAL: FormData = {
  business_name: '',
  industry: '',
  country: '',
  num_employees: '',
  annual_revenue: '',
  marketing_budget: '',
  business_goals: [],
  growth_challenges: [],
  additional_context: '',
};

const STEPS = [
  { label: 'Business', icon: <IconBriefcase size={22} /> },
  { label: 'Scale', icon: <IconBarChart size={22} /> },
  { label: 'Goals', icon: <IconTarget size={22} /> },
  { label: 'Challenges', icon: <IconZap size={22} /> },
  { label: 'Review', icon: <IconCheckCircle size={22} /> },
];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = (key: 'business_goals' | 'growth_challenges', val: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
  };

  const canProceed = () => {
    if (step === 0) return form.business_name && form.industry && form.country;
    if (step === 1) return form.num_employees && form.marketing_budget;
    if (step === 2) return form.business_goals.length > 0;
    if (step === 3) return form.growth_challenges.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      router.push(`/advisor/${data.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}><IconBelvedereLogo size={22} /></span>
          <span>Belvedere <span className="text-gradient">AI™</span></span>
        </a>
      </div>

      <div className={styles.wrapper}>
        {/* Progress steps */}
        <div className={styles.progress}>
          {STEPS.map((s, i) => (
            <div key={s.label} className={styles.progressItem}>
              <div className={`${styles.progressDot} ${i < step ? styles.progressDone : ''} ${i === step ? styles.progressActive : ''}`}>
                {i < step ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{s.icon}</span>
                )}
              </div>
              <span className={`${styles.progressLabel} ${i === step ? styles.progressLabelActive : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`${styles.progressLine} ${i < step ? styles.progressLineDone : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className={`glass-card ${styles.card}`}>
          {/* Step 0: Business basics */}
          {step === 0 && (
            <div className={styles.stepContent} key="step0">
              <div className={styles.stepHeader}>
                <h1 className={styles.stepTitle}>Tell us about your business</h1>
                <p className={styles.stepDesc}>This helps us personalize your growth strategy</p>
              </div>
              <div className={styles.fields}>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Acme Marketing Ltd" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
                </div>
                <div className={styles.row}>
                  <div className="form-group">
                    <label className="form-label">Industry *</label>
                    <select className="form-select" value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <select className="form-select" value={form.country} onChange={(e) => update('country', e.target.value)}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Scale & Financials */}
          {step === 1 && (
            <div className={styles.stepContent} key="step1">
              <div className={styles.stepHeader}>
                <h1 className={styles.stepTitle}>Scale & resources</h1>
                <p className={styles.stepDesc}>Help us understand your current position</p>
              </div>
              <div className={styles.fields}>
                <div className="form-group">
                  <label className="form-label">Number of Employees *</label>
                  <select className="form-select" value={form.num_employees} onChange={(e) => update('num_employees', e.target.value)}>
                    <option value="">Select range</option>
                    {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Revenue (optional)</label>
                  <select className="form-select" value={form.annual_revenue} onChange={(e) => update('annual_revenue', e.target.value)}>
                    <option value="">Select range</option>
                    {REVENUE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Marketing Budget *</label>
                  <select className="form-select" value={form.marketing_budget} onChange={(e) => update('marketing_budget', e.target.value)}>
                    <option value="">Select range</option>
                    {BUDGET_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className={styles.stepContent} key="step2">
              <div className={styles.stepHeader}>
                <h1 className={styles.stepTitle}>What are your business goals?</h1>
                <p className={styles.stepDesc}>Select all that apply — we'll tailor your roadmap accordingly</p>
              </div>
              <div className={styles.chipGrid}>
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`${styles.chip} ${form.business_goals.includes(g) ? styles.chipActive : ''}`}
                    onClick={() => toggleArray('business_goals', g)}
                  >
                    {form.business_goals.includes(g) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {g}
                  </button>
                ))}
              </div>
              {form.business_goals.length > 0 && (
                <div className={styles.selectedCount}>
                  {form.business_goals.length} goal{form.business_goals.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Step 3: Challenges */}
          {step === 3 && (
            <div className={styles.stepContent} key="step3">
              <div className={styles.stepHeader}>
                <h1 className={styles.stepTitle}>Your biggest growth challenges</h1>
                <p className={styles.stepDesc}>Be honest — the AI provides better advice the more context you share</p>
              </div>
              <div className={styles.chipGrid}>
                {CHALLENGES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.chip} ${form.growth_challenges.includes(c) ? styles.chipActive : ''}`}
                    onClick={() => toggleArray('growth_challenges', c)}
                  >
                    {form.growth_challenges.includes(c) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {c}
                  </button>
                ))}
              </div>
              <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
                <label className="form-label">Additional context (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Anything else you'd like the AI advisor to know about your business..."
                  value={form.additional_context}
                  onChange={(e) => update('additional_context', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className={styles.stepContent} key="step4">
              <div className={styles.stepHeader}>
                <h1 className={styles.stepTitle}>Review & generate</h1>
                <p className={styles.stepDesc}>Everything looks good? Let's build your growth roadmap.</p>
              </div>
              <div className={styles.reviewGrid}>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Business</span>
                  <span className={styles.reviewVal}>{form.business_name}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Industry</span>
                  <span className={styles.reviewVal}>{form.industry}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Country</span>
                  <span className={styles.reviewVal}>{form.country}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Team Size</span>
                  <span className={styles.reviewVal}>{form.num_employees}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Revenue</span>
                  <span className={styles.reviewVal}>{form.annual_revenue || 'Not provided'}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Mktg Budget</span>
                  <span className={styles.reviewVal}>{form.marketing_budget}</span>
                </div>
                <div className={styles.reviewItemFull}>
                  <span className={styles.reviewLabel}>Goals</span>
                  <div className={styles.reviewTags}>
                    {form.business_goals.map((g) => <span key={g} className="badge badge-gold">{g}</span>)}
                  </div>
                </div>
                <div className={styles.reviewItemFull}>
                  <span className={styles.reviewLabel}>Challenges</span>
                  <div className={styles.reviewTags}>
                    {form.growth_challenges.map((c) => <span key={c} className="badge badge-medium">{c}</span>)}
                  </div>
                </div>
              </div>

              {error && (
                <div className={styles.error}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className={styles.nav}>
            <button
              className="btn btn-secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Continue →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    🚀 Generate My Roadmap
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
