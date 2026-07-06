'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import {
  IconBelvedereLogo, IconTarget, IconBrain, IconMap, IconChat,
  IconFileText, IconBarChart, IconTrendingUp, IconZap, IconClock
} from '@/lib/icons';
import { BusinessSession } from '@/lib/supabase';

const FEATURES = [
  {
    icon: <IconTarget size={24} />,
    title: 'Business Discovery',
    desc: 'We learn your business inside out — industry, goals, challenges, and budget — to deliver truly personalised advice.',
  },
  {
    icon: <IconBrain size={24} />,
    title: 'AI-Powered Analysis',
    desc: 'Powered by advanced AI, Belvedere analyzes your business through the lens of a seasoned growth consultant.',
  },
  {
    icon: <IconMap size={24} />,
    title: 'Growth Roadmap',
    desc: 'Receive a structured action plan across Marketing, PR, SEO, GEO, Brand, and Content — ready to execute.',
  },
  {
    icon: <IconChat size={24} />,
    title: 'Live Consultation',
    desc: 'Ask follow-up questions and dive deeper into any strategy. Your AI advisor is always available.',
  },
  {
    icon: <IconFileText size={24} />,
    title: 'PDF Export',
    desc: 'Download a polished, professional strategy report to share with your team or present to stakeholders.',
  },
  {
    icon: <IconBarChart size={24} />,
    title: 'Admin Control',
    desc: "Fine-tune the AI's guidance with a powerful admin panel — manage prompts, view sessions, and more.",
  },
];

const STEPS = [
  { num: '01', title: 'Tell Us About Your Business', desc: 'Complete a guided discovery form covering your goals, challenges, and resources.' },
  { num: '02', title: 'AI Analyzes Your Context', desc: 'Our AI processes your profile against market insights and proven growth frameworks.' },
  { num: '03', title: 'Receive Your Roadmap', desc: 'Get a structured, consultant-grade growth strategy across every key channel.' },
  { num: '04', title: 'Consult & Refine', desc: 'Ask follow-up questions, explore strategies deeper, and export your plan as PDF.' },
];

const TESTIMONIALS = [
  {
    quote: "Belvedere AI gave us more actionable insights in 10 minutes than we'd gathered in months of internal strategy sessions.",
    name: 'Sarah Chen',
    role: 'CMO, TechVenture Ltd.',
    avatar: 'SC',
  },
  {
    quote: "The GEO and brand positioning recommendations were spot-on. We immediately restructured our content around them.",
    name: 'Marcus Williams',
    role: 'Founder, ScaleForward',
    avatar: 'MW',
  },
  {
    quote: "Finally, an AI tool that thinks like a real marketing consultant — not just a chatbot with generic advice.",
    name: 'Priya Sharma',
    role: 'Head of Growth, NexusB2B',
    avatar: 'PS',
  },
];

const STATS = [
  { value: '500+', label: 'Businesses Advised' },
  { value: '8', label: 'Growth Categories' },
  { value: '94%', label: 'Satisfaction Rate' },
  { value: '< 2min', label: 'Roadmap Generation' },
];

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<BusinessSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.sessions) setHistorySessions(data.sessions);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className={styles.page}>
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}><IconBelvedereLogo size={24} /></span>
            <span className={styles.logoText}>
              Belvedere <span className="text-gradient">AI™</span>
            </span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#testimonials" className={styles.navLink}>Testimonials</a>
          </div>
          <div className={styles.navActions}>
            <button className="btn btn-ghost btn-sm" onClick={loadHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IconClock size={14} /> My Roadmaps
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/onboard')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className={styles.hero}
        style={{
          '--mouse-x': `${mousePos.x}%`,
          '--mouse-y': `${mousePos.y}%`,
        } as React.CSSProperties}
      >
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />
        <div className={styles.heroGrid} />

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered Business Intelligence
          </div>

          <h1 className={styles.heroTitle}>
            Your Business Deserves{' '}
            <span className="text-gradient">Expert-Level</span>{' '}
            Growth Strategy
          </h1>

          <p className={styles.heroDesc}>
            Belvedere AI is an intelligent growth advisor that analyzes your business
            and delivers a personalized, consultant-grade roadmap across Marketing,
            PR, SEO, GEO, Brand Positioning, and beyond.
          </p>

          <div className={styles.heroCta}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => router.push('/onboard')}
            >
              <span>Get Your Free Growth Strategy</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/login')}>
              View Demo
            </button>
          </div>

          <div className={styles.heroStats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{s.value}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards */}
        <div className={styles.heroFloat}>
          <div className={styles.floatCard} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className={styles.floatCardIcon} style={{ color: 'var(--brand-gold)' }}><IconTrendingUp size={22} /></div>
            <div>
              <div className={styles.floatCardTitle}>Revenue Growth</div>
              <div className={styles.floatCardVal}>+127%</div>
            </div>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard2}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className={styles.floatCardIcon} style={{ color: 'var(--brand-gold)' }}><IconZap size={22} /></div>
            <div>
              <div className={styles.floatCardTitle}>Lead Quality</div>
              <div className={styles.floatCardVal}>Top 5%</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="badge badge-gold">Features</div>
            <h2 className={styles.sectionTitle}>
              Everything You Need to <span className="text-gradient">Grow Faster</span>
            </h2>
            <p className={styles.sectionDesc}>
              A complete growth intelligence suite, built for ambitious businesses.
            </p>
          </div>

          <div className={`grid-3 ${styles.featuresGrid}`}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card ${styles.featureCard}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className={`${styles.section} ${styles.sectionDark}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="badge badge-gold">Process</div>
            <h2 className={styles.sectionTitle}>
              From <span className="text-gradient">Discovery</span> to Roadmap in Minutes
            </h2>
          </div>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={styles.stepItem}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={`glass-card ${styles.stepCard}`}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="badge badge-gold">Coverage</div>
            <h2 className={styles.sectionTitle}>
              8 Growth <span className="text-gradient">Dimensions</span> Covered
            </h2>
          </div>
          <div className={styles.categoriesGrid}>
            {['Marketing Strategy', 'Digital Advertising', 'Public Relations', 'SEO', 'GEO Optimization', 'Brand Positioning', 'Lead Generation', 'Content Strategy'].map((cat, i) => (
              <div key={cat} className={`glass-card ${styles.categoryPill}`}>
                <span className={styles.categoryNum}>0{i + 1}</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section id="testimonials" className={`${styles.section} ${styles.sectionDark}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="badge badge-gold">Testimonials</div>
            <h2 className={styles.sectionTitle}>
              Trusted by <span className="text-gradient">Growth Leaders</span>
            </h2>
          </div>

          <div className="grid-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={`glass-card ${styles.testimonialCard}`}>
                <div className={styles.testimonialQuote}>"</div>
                <p className={styles.testimonialText}>{t.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} />
        <div className={`container ${styles.ctaContent}`}>
          <h2 className={styles.ctaTitle}>
            Ready to <span className="text-gradient">Accelerate</span> Your Growth?
          </h2>
          <p className={styles.ctaDesc}>
            Join hundreds of businesses getting smarter about growth. Your personalized roadmap is free.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/onboard')}
          >
            Start Your Free Strategy Session
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>Belvedere <span className="text-gradient">AI™</span></span>
          </div>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Belvedere Marketing & PR. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="/admin/login" className={styles.footerLink}>Admin</a>
          </div>
        </div>
      </footer>

      {/* ── HISTORY MODAL ── */}
      {showHistory && (
        <div className={styles.historyModalOverlay} onClick={() => setShowHistory(false)}>
          <div className={styles.historyModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.historyModalHeader}>
              <h2 className={styles.historyModalTitle}>Your Recent Roadmaps</h2>
              <button className={styles.historyModalClose} onClick={() => setShowHistory(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.historyModalBody}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
              ) : historySessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent roadmaps found.</div>
              ) : (
                <div className={styles.historyList}>
                  {historySessions.map(hs => (
                    <a key={hs.id} href={`/advisor/${hs.id}`} className={styles.historyItem}>
                      <div className={styles.historyItemTitle}>{hs.business_name}</div>
                      <div className={styles.historyItemMeta}>{hs.industry} · {new Date(hs.created_at).toLocaleDateString()}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
