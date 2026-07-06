'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { RoadmapData, BusinessSession, Message } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import styles from './advisor.module.css';
import {
  IconBelvedereLogo, IconDownload, IconPlus, IconSend, IconZap, IconBarChart,
  IconCheckCircle, IconClock, IconTrendingUp, IconGlobe, IconTarget,
  IconChat, IconFileText, IconBriefcase,
} from '@/lib/icons';


// ── SVG ICONS per category ──────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  marketing: <IconTrendingUp size={20} />,
  advertising: <IconBarChart size={20} />,
  pr: <IconFileText size={20} />,
  seo: <IconGlobe size={20} />,
  geo: <IconGlobe size={20} />,
  brand_positioning: <IconTarget size={20} />,
  lead_generation: <IconTarget size={20} />,
  content_strategy: <IconFileText size={20} />,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

// ── Simple Markdown → JSX renderer ─────────────────────────────────────────
function renderMarkdown(text: string): React.ReactElement {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i++;
      }
      elements.push(
        <ol key={elements.length} style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.25rem' }}>{inlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (/^[-*•]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(lines[i].replace(/^[-*•]\s/, '').trim());
        i++;
      }
      elements.push(
        <ul key={elements.length} style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.25rem' }}>{inlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Heading
    if (line.startsWith('### ')) {
      elements.push(<strong key={elements.length} style={{ display: 'block', marginTop: '0.5rem' }}>{line.slice(4)}</strong>);
      i++;
      continue;
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      elements.push(<strong key={elements.length} style={{ display: 'block', fontSize: '1rem', marginTop: '0.5rem' }}>{line.replace(/^#+\s/, '')}</strong>);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(<p key={elements.length} style={{ margin: '0.3rem 0', lineHeight: '1.65' }}>{inlineMarkdown(line)}</p>);
    i++;
  }

  return <>{elements}</>;
}

function inlineMarkdown(text: string): React.ReactNode {
  // Handle **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 3, padding: '0 3px', fontFamily: 'monospace', fontSize: '0.85em' }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// ── PDF Export (programmatic jsPDF) ────────────────────────────────────────
async function exportPDF(session: BusinessSession, roadmap: RoadmapData) {
  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;   // A4 width mm
  const H = 297;   // A4 height mm
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;
  const BRAND = [11, 61, 87] as [number, number, number]; // navy #0b3d57
  const DARK = [10, 31, 43] as [number, number, number]; // #0a1f2b
  const MID = [30, 58, 74] as [number, number, number]; // #1e3a4a
  const LIGHT = [200, 223, 233] as [number, number, number]; // soft blue

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── PAGE 1: COVER PAGE ──────────────────────────────────────────────────
  // Navy header band
  pdf.setFillColor(...BRAND);
  pdf.rect(0, 0, W, 75, 'F');

  // "BELVEDERE AI" wordmark
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('BELVEDERE AI™', MARGIN, 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Business Growth Advisor', MARGIN, 29);

  // Report title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text('Growth Strategy Report', MARGIN, 50);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(session.business_name, MARGIN, 60);

  pdf.setFontSize(9);
  pdf.text(dateStr, MARGIN, 68);

  // Business metadata grid
  let y = 90;
  pdf.setTextColor(...DARK);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('BUSINESS PROFILE', MARGIN, y);

  y += 6;
  pdf.setFillColor(...LIGHT);
  pdf.rect(MARGIN, y, CONTENT_W, 0.5, 'F');
  y += 6;

  const meta = [
    ['Industry', session.industry],
    ['Country', session.country],
    ['Team Size', session.num_employees],
    ['Marketing Budget', session.marketing_budget],
  ];
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  for (const [label, val] of meta) {
    pdf.setTextColor(...MID);
    pdf.text(label.toUpperCase(), MARGIN, y);
    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(val), MARGIN + 40, y);
    pdf.setFont('helvetica', 'normal');
    y += 7;
  }

  // Goals
  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text('BUSINESS GOALS', MARGIN, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...MID);
  for (const goal of session.business_goals) {
    pdf.text(`• ${goal}`, MARGIN + 3, y);
    y += 6;
  }

  // Executive Summary
  y += 5;
  pdf.setFillColor(...BRAND);
  pdf.rect(MARGIN, y, CONTENT_W, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('EXECUTIVE SUMMARY', MARGIN + 4, y + 5);
  y += 11;

  pdf.setTextColor(...DARK);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const summaryLines = pdf.splitTextToSize(roadmap.executive_summary || '', CONTENT_W);
  for (const line of summaryLines) {
    if (y > H - 30) { pdf.addPage(); y = MARGIN + 10; }
    pdf.text(line, MARGIN, y);
    y += 5;
  }

  // Quick Wins
  if (roadmap.quick_wins && roadmap.quick_wins.length > 0) {
    y += 8;
    if (y > H - 50) { pdf.addPage(); y = MARGIN + 10; }
    pdf.setFillColor(...BRAND);
    pdf.rect(MARGIN, y, CONTENT_W, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('QUICK WINS — NEXT 30 DAYS', MARGIN + 4, y + 5);
    y += 11;

    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    for (let idx = 0; idx < roadmap.quick_wins.length; idx++) {
      const winLines = pdf.splitTextToSize(`${idx + 1}.  ${roadmap.quick_wins[idx]}`, CONTENT_W - 5);
      if (y + winLines.length * 5 > H - 20) { pdf.addPage(); y = MARGIN + 10; }
      for (const l of winLines) { pdf.text(l, MARGIN + 3, y); y += 5; }
      y += 2;
    }
  }

  // KPIs
  if (roadmap.kpis && roadmap.kpis.length > 0) {
    y += 8;
    if (y > H - 50) { pdf.addPage(); y = MARGIN + 10; }
    pdf.setFillColor(...BRAND);
    pdf.rect(MARGIN, y, CONTENT_W, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('KEY PERFORMANCE INDICATORS', MARGIN + 4, y + 5);
    y += 11;

    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    for (const kpi of roadmap.kpis) {
      const kpiLines = pdf.splitTextToSize(`• ${kpi}`, CONTENT_W - 5);
      if (y + kpiLines.length * 5 > H - 20) { pdf.addPage(); y = MARGIN + 10; }
      for (const l of kpiLines) { pdf.text(l, MARGIN + 3, y); y += 5; }
      y += 2;
    }
  }

  // ── CATEGORY PAGES ──────────────────────────────────────────────────────
  const categories = roadmap.categories || {};
  for (const [key, cat] of Object.entries(categories)) {
    pdf.addPage();
    y = MARGIN;

    // Section header
    pdf.setFillColor(...BRAND);
    pdf.rect(0, 0, W, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(cat.title.toUpperCase(), MARGIN, 13);
    y = 28;

    // Summary
    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    const summLines = pdf.splitTextToSize(cat.summary || '', CONTENT_W);
    for (const l of summLines) { pdf.text(l, MARGIN, y); y += 5; }
    y += 5;

    // Divider
    pdf.setFillColor(...LIGHT);
    pdf.rect(MARGIN, y, CONTENT_W, 0.5, 'F');
    y += 8;

    // Actions table header
    pdf.setFillColor(240, 247, 251);
    pdf.rect(MARGIN, y - 1, CONTENT_W, 8, 'F');
    pdf.setTextColor(...MID);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('ACTION ITEM', MARGIN + 2, y + 5);
    pdf.text('PRIORITY', MARGIN + CONTENT_W - 35, y + 5);
    pdf.text('TIMEFRAME', MARGIN + CONTENT_W - 12, y + 5, { align: 'right' });
    y += 11;

    pdf.setFont('helvetica', 'normal');
    for (const action of cat.actions || []) {
      const actionLines = pdf.splitTextToSize(action.item || '', CONTENT_W - 50);
      const rowH = Math.max(actionLines.length * 4.5 + 4, 10);
      if (y + rowH > H - 20) {
        pdf.addPage();
        pdf.setFillColor(...BRAND);
        pdf.rect(0, 0, W, 14, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(cat.title.toUpperCase() + ' (continued)', MARGIN, 10);
        y = 24;
      }

      const priorityColor: [number, number, number] =
        action.priority === 'high' ? [166, 69, 56] :
          action.priority === 'medium' ? [116, 165, 175] : [89, 126, 179];

      pdf.setFontSize(8.5);
      pdf.setTextColor(...DARK);
      let lineY = y + 3;
      for (const l of actionLines) { pdf.text(l, MARGIN + 2, lineY); lineY += 4.5; }

      pdf.setFillColor(...priorityColor);
      pdf.roundedRect(MARGIN + CONTENT_W - 40, y + 1, 18, 6, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text((action.priority || '').toUpperCase(), MARGIN + CONTENT_W - 31, y + 5.5, { align: 'center' });

      pdf.setTextColor(...MID);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(action.timeframe || '', MARGIN + CONTENT_W, y + 4, { align: 'right' });

      y += rowH;

      // Row separator
      pdf.setFillColor(235, 242, 246);
      pdf.rect(MARGIN, y, CONTENT_W, 0.3, 'F');
      y += 2;
    }
  }

  // Footer on every page
  const pageCount = (pdf as any).internal?.getNumberOfPages 
    ? (pdf as any).internal.getNumberOfPages() 
    : (pdf as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setTextColor(160, 180, 190);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text(`Belvedere AI™ Growth Strategy Report — ${session.business_name} — ${dateStr}`, MARGIN, H - 8);
    pdf.text(`Page ${p} of ${pageCount}`, W - MARGIN, H - 8, { align: 'right' });
  }

  pdf.save(`${session.business_name.replace(/\s+/g, '_')}_Growth_Strategy.pdf`);
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdvisorPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [session, setSession] = useState<BusinessSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState('marketing');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<BusinessSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch(`/api/generate-roadmap?sessionId=${sessionId}`);
    const data = await res.json();

    if (data.session) setSession(data.session);
    if (data.messages) setMessages(data.messages);

    if (data.roadmap) {
      setRoadmap(data.roadmap);
      setLoading(false);
      setActiveTab(Object.keys(data.roadmap.categories)[0]);
    } else {
      setGenerating(true);
      try {
        const postRes = await fetch(`/api/generate-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const postData = await postRes.json();

        if (postData.roadmap) {
          setRoadmap(postData.roadmap);
          setActiveTab(Object.keys(postData.roadmap.categories)[0]);
        } else if (!postRes.ok || postData.error) {
          setGenerateError("The AI is currently processing high traffic. Please try again in 30 seconds.");
        }
      } catch (err) {
        console.error('Failed to generate roadmap', err);
        setGenerateError("The AI is currently processing high traffic. Please try again in 30 seconds.");
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    }
  };

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {

    if (railRef.current && !isClickScrolling.current) {
      let currentKey = activeTab;
      const railRect = railRef.current.getBoundingClientRect();
      const triggerY = railRect.bottom + 60; // Just below the sticky header

      for (const key of Object.keys(roadmap?.categories || {})) {
        const el = document.getElementById(`category-${key}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element spans across our trigger line, it's the active one
          if (rect.top <= triggerY && rect.bottom > triggerY) {
            currentKey = key;
            break;
          }
        }
      }

      if (currentKey !== activeTab) {
        setActiveTab(currentKey);
        // Safely scroll horizontal tab bar without jank
        const btn = railRef.current.querySelector(`[data-tab-key="${currentKey}"]`);
        if (btn) {
          const btnRect = btn.getBoundingClientRect();
          const scrollLeft = railRef.current.scrollLeft + (btnRect.left - railRect.left) - (railRect.width / 2) + (btnRect.width / 2);
          railRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  };

  const sendMessage = async (overrideMsg?: string) => {
    const userMsg = (overrideMsg || chatInput).trim();
    if (!userMsg || chatLoading) return;
    if (!overrideMsg) setChatInput('');

    setChatLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg, roadmapSummary: roadmap?.executive_summary }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setStreamingText(full);
      }
      setMessages((prev) => [...prev, { role: 'model', content: full }]);
      setStreamingText('');
    } catch {
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setChatLoading(false);
  };

  if (generateError) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingIcon} style={{ color: '#d32f2f' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className={styles.loadingTitle}>High Traffic Detected</h2>
          <p className={styles.loadingDesc} style={{ color: '#d32f2f', fontWeight: 500 }}>
            {generateError}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  if (loading || generating) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingOrb} />
          <div className={styles.loadingIcon}><IconBelvedereLogo size={48} /></div>
          <h2 className={styles.loadingTitle}>
            {generating ? 'Generating Your Growth Roadmap' : 'Loading...'}
          </h2>
          <p className={styles.loadingDesc}>
            {generating
              ? 'Belvedere AI is analyzing your business and crafting personalized recommendations across all growth channels...'
              : 'Loading your advisory session...'}
          </p>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
          {generating && (
            <div className={styles.loadingSteps}>
              {['Analyzing business context', 'Researching market opportunities', 'Crafting marketing strategy', 'Building growth roadmap'].map((s, i) => (
                <div key={s} className={styles.loadingStep} style={{ animationDelay: `${i * 0.5}s` }}>
                  <div className={styles.loadingStepDot} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!roadmap || !session) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <h2 className={styles.loadingTitle}>Session not found</h2>
          <a href="/onboard" className="btn btn-primary">Start New Session</a>
        </div>
      </div>
    );
  }

  const categories = roadmap.categories || {};
  const categoryKeys = Object.keys(categories);

  // ── CHART DATA PREPARATION ──
  const priorityCounts = { high: 0, medium: 0, low: 0 };
  const categoryCounts: Record<string, number> = {};

  categoryKeys.forEach(key => {
    const cat = categories[key];
    categoryCounts[cat.title] = cat.actions?.length || 0;
    cat.actions?.forEach(a => {
      if (a.priority === 'high') priorityCounts.high++;
      if (a.priority === 'medium') priorityCounts.medium++;
      if (a.priority === 'low') priorityCounts.low++;
    });
  });

  const doughnutData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        // Smooth sequential gradient from dark Navy to light Sky Blue
        backgroundColor: [
          '#061d2a', // Extra Dark Navy
          '#0B3D57', // Deep Brand Navy
          '#124d6d',
          '#1a5c7f',
          '#247096',
          '#2e84ae',
          '#368EB9',
          '#429dc9',
          '#4EACDA',
          '#61baea',
          '#71C8F6',
          '#A1DDF9', // Lightest Sky Blue
        ],
        borderWidth: 0,
        hoverOffset: 4,
      }
    ]
  };

  const barData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Action Items',
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        // Monochromatic Navy scale for urgency
        backgroundColor: [
          '#0B3D57', // Deep Navy (High priority - most visual weight)
          '#368EB9', // Mid Blue (Medium priority)
          '#A1DDF9', // Light Sky Blue (Low priority - least visual weight)
        ],
        borderRadius: 4,
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#666', font: { size: 10, family: 'Inter, sans-serif' }, padding: 15, usePointStyle: true } },
    }
  };

  return (
    <div className={styles.page}>
      {/* ── TOP BAR ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoIcon}><IconBelvedereLogo size={22} /></span>
            <span>Belvedere <span className="text-gradient">AI™</span></span>
          </a>
          <div className={styles.sessionInfo}>
            <span className={styles.sessionName}>{session.business_name}</span>
            <span className={styles.sessionMeta}>{session.industry} · {session.country}</span>
          </div>
        </div>
        <div className={styles.topbarRight}>
          <button className="btn btn-ghost btn-sm" onClick={loadHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <IconClock size={14} /> History
          </button>
          <a href="/onboard" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <IconPlus size={14} /> New Session
          </a>
          <button className="btn btn-primary btn-sm" onClick={() => exportPDF(session, roadmap)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <IconDownload size={14} />
            Export PDF
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* ── LEFT: ROADMAP ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className={styles.roadmapPanel} ref={roadmapRef} onScroll={handleScroll}>
            {/* Executive Summary */}
            <div className={`glass-card ${styles.execSummary}`}>
              <div className={styles.execTop}>
                <div className={styles.execLeft}>
                  <div className="badge badge-gold">Executive Summary</div>
                  <h1 className={styles.execTitle}>{session.business_name} Growth Roadmap</h1>
                  <p className={styles.execText}>{roadmap.executive_summary}</p>
                </div>
                <div className={styles.execRight}>
                  <div className={styles.metaChip}>
                    <span className={styles.metaChipLabel}>Industry</span>
                    <span className={styles.metaChipVal}>{session.industry}</span>
                  </div>
                  <div className={styles.metaChip}>
                    <span className={styles.metaChipLabel}>Location</span>
                    <span className={styles.metaChipVal}>{session.country}</span>
                  </div>
                  <div className={styles.metaChip}>
                    <span className={styles.metaChipLabel}>Team Size</span>
                    <span className={styles.metaChipVal}>{session.num_employees}</span>
                  </div>
                  <div className={styles.metaChip}>
                    <span className={styles.metaChipLabel}>Mktg Budget</span>
                    <span className={styles.metaChipVal}>{session.marketing_budget}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Overview Charts */}
            <div className={`glass-card ${styles.chartsCard}`}>
              <h3 className={styles.sectionLabel} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IconBarChart size={16} /> Strategy Overview
              </h3>
              <div className={styles.chartsGrid}>
                <div className={styles.chartWrapper}>
                  <h4 className={styles.chartTitle}>Focus Areas</h4>
                  <div style={{ height: '220px', width: '100%' }}>
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </div>
                <div className={styles.chartWrapper}>
                  <h4 className={styles.chartTitle}>Priority Distribution</h4>
                  <div style={{ height: '220px', width: '100%' }}>
                    <Bar
                      data={barData}
                      options={{
                        ...chartOptions,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            {roadmap.quick_wins && roadmap.quick_wins.length > 0 && (
              <div className={`glass-card ${styles.quickWins}`}>
                <h3 className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconZap size={16} />
                  Quick Wins (Next 30 Days)
                </h3>
                <ul className={styles.quickWinsList}>
                  {roadmap.quick_wins.map((w, i) => (
                    <li key={i} className={styles.quickWinItem}>
                      <span className={styles.quickWinNum}>{i + 1}</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* KPIs */}
            {roadmap.kpis && roadmap.kpis.length > 0 && (
              <div className={`glass-card ${styles.kpisCard}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <h3 className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                    <IconCheckCircle size={16} />
                    Key Performance Indicators
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <IconChat size={12} /> Click any KPI to ask AI
                  </span>
                </div>
                <div className={styles.kpisList}>
                  {roadmap.kpis.map((kpi, i) => (
                    <button
                      key={i}
                      className={styles.kpiItem}
                      onClick={() => sendMessage(`How should I measure this KPI: ${kpi}?`)}
                      disabled={chatLoading}
                    >
                      {kpi}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Navigation (Sticky) */}
            <div className={styles.tabBar} ref={railRef}>
              {categoryKeys.map((key) => {
                const isHigh = categories[key].actions.some(a => a.priority === 'high');
                const isMed = categories[key].actions.some(a => a.priority === 'medium');
                const priorityLabel = isHigh ? 'HIGH' : (isMed ? 'MED' : 'LOW');

                return (
                  <button
                    key={key}
                    data-tab-key={key}
                    className={`${styles.tabBtn} ${activeTab === key ? styles.tabBtnActive : ''}`}
                    onClick={(e) => {
                      setActiveTab(key);

                      isClickScrolling.current = true;
                      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                      scrollTimeout.current = setTimeout(() => {
                        isClickScrolling.current = false;
                      }, 1000);

                      const btn = e.currentTarget;
                      const rail = railRef.current;
                      if (rail) {
                        const btnRect = btn.getBoundingClientRect();
                        const railRect = rail.getBoundingClientRect();
                        const scrollLeft = rail.scrollLeft + (btnRect.left - railRect.left) - (railRect.width / 2) + (btnRect.width / 2);
                        rail.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                      }

                      const section = document.getElementById(`category-${key}`);
                      const container = roadmapRef.current;
                      if (section && container && rail) {
                        const containerRect = container.getBoundingClientRect();
                        const sectionRect = section.getBoundingClientRect();
                        const offset = sectionRect.top - containerRect.top;

                        container.scrollTo({
                          top: container.scrollTop + offset - rail.getBoundingClientRect().height - 10,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    <span className={styles.tabIcon}>{CATEGORY_ICONS[key] || <IconTarget size={16} />}</span>
                    <span>{categories[key].title}</span>
                    <span className={styles.tabDivider}>·</span>
                    <span className={`${styles.tabPriority} ${styles[`tabPriority${priorityLabel}`]}`}>
                      {priorityLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* All Categories Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingBottom: 'var(--space-3xl)' }}>
              {categoryKeys.map((key) => {
                const category = categories[key];
                return (
                  <div className={`glass-card ${styles.categoryCard}`} key={key} id={`category-${key}`}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.categoryIcon}>{CATEGORY_ICONS[key] || <IconTarget size={28} />}</span>
                      <div>
                        <h2 className={styles.categoryTitle}>{category.title}</h2>
                        <p className={styles.categorySummary}>{category.summary}</p>
                      </div>
                    </div>

                    <div className={styles.actionsList}>
                      {(category.actions || []).map((action, i) => (
                        <div key={i} className={styles.actionItem}>
                          <div className={styles.actionBullet} />
                          <div className={styles.actionContent}>
                            <p className={styles.actionText}>{action.item}</p>
                            <div className={styles.actionMeta}>
                              <div className={`${styles.priorityBadge} ${styles[`priorityBadge${action.priority.toUpperCase()}`]}`}>
                                <span className={styles.priorityLabel}>{action.priority}</span>
                                <span className={styles.priorityTimeframe}>
                                  <IconClock size={10} />
                                  {action.timeframe}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: CHAT PANEL ── */}
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderIcon}><IconBelvedereLogo size={18} /></div>
            <div>
              <h3 className={styles.chatTitle}>Ask Belvedere AI</h3>
              <p className={styles.chatSubtitle}>Follow-up questions, deeper dives, specific advice</p>
            </div>
          </div>

          <div className={`${styles.chatMessages} chat-scroll`}>
            {messages.length === 0 && !streamingText && (
              <div className={styles.chatEmpty}>
                <div className={styles.chatEmptyIcon}><IconChat size={36} /></div>
                <p>Your roadmap is ready. Ask anything about your growth strategy!</p>
                <div className={styles.chatSuggestions}>
                  {[
                    'What should I focus on first?',
                    'How do I improve my SEO quickly?',
                    'Give me a 90-day action plan',
                    'What budget should I allocate to ads?',
                  ].map((s) => (
                    <button
                      key={s}
                      className={styles.suggestionBtn}
                      onClick={() => { setChatInput(s); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgUser : styles.msgAI}`}
              >
                {msg.role === 'model' && (
                  <div className={styles.msgAIAvatar}><IconBelvedereLogo size={14} /></div>
                )}
                <div className={styles.msgContent}>
                  {msg.role === 'model'
                    ? renderMarkdown(msg.content)
                    : msg.content.split('\n').map((line, j) => <p key={j}>{line}</p>)
                  }
                </div>
              </div>
            ))}

            {streamingText && (
              <div className={`${styles.msgBubble} ${styles.msgAI}`}>
                <div className={styles.msgAIAvatar}><IconBelvedereLogo size={14} /></div>
                <div className={styles.msgContent}>
                  {renderMarkdown(streamingText)}
                  <span className={styles.cursor} />
                </div>
              </div>
            )}

            {chatLoading && !streamingText && (
              <div className={`${styles.msgBubble} ${styles.msgAI}`}>
                <div className={styles.msgAIAvatar}><IconBelvedereLogo size={14} /></div>
                <div className={styles.typingIndicator}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input
              className={`form-input ${styles.chatInput}`}
              type="text"
              placeholder="Ask a follow-up question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button
              className={`btn btn-primary ${styles.sendBtn}`}
              onClick={() => sendMessage()}
              disabled={!chatInput.trim() || chatLoading}
            >
              <IconSend size={16} />
            </button>
          </div>
        </div>
      </div>
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
