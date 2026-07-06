'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import {
  IconBarChart, IconBriefcase, IconSettings, IconUsers, IconBelvedereLogo,
  IconPlus, IconLogOut, IconChat, IconExternalLink, IconChevronDown, IconChevronUp, IconCheckCircle,
} from '@/lib/icons';

type Config = { id: string; key: string; value: string; description: string; updated_at: string };
type Session = {
  id: string;
  business_name: string;
  industry: string;
  country: string;
  num_employees: string;
  marketing_budget: string;
  business_goals: string[];
  growth_challenges: string[];
  created_at: string;
  roadmaps?: { roadmap_data?: { executive_summary?: string } }[];
  conversations?: { messages?: unknown[] }[];
};

type AdminTab = 'overview' | 'prompts' | 'sessions' | 'users';

const NAV_ITEMS: { key: AdminTab; icon: React.ReactElement; label: string }[] = [
  { key: 'overview', icon: <IconBarChart size={16} />, label: 'Overview' },
  { key: 'prompts',  icon: <IconSettings size={16} />, label: 'System Prompts' },
  { key: 'sessions', icon: <IconBriefcase size={16} />, label: 'Sessions' },
  { key: 'users',    icon: <IconUsers size={16} />, label: 'Users' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [configs, setConfigs] = useState<Config[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('belvedere_role');
    if (role !== 'admin') { router.push('/admin/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [configRes, sessionsRes] = await Promise.all([
      fetch('/api/admin/config'),
      fetch('/api/admin/sessions'),
    ]);
    const configData = await configRes.json();
    const sessionsData = await sessionsRes.json();
    setConfigs(configData.configs || []);
    setSessions(sessionsData.sessions || []);
    setLoading(false);
  };

  const startEdit = (config: Config) => { setEditingKey(config.key); setEditValue(config.value); };

  const saveEdit = async (key: string) => {
    setSaving(true);
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: editValue }),
    });
    setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, value: editValue } : c));
    setEditingKey(null);
    setSaving(false);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  const logout = () => { localStorage.removeItem('belvedere_role'); router.push('/'); };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}><IconBelvedereLogo size={28} /></span>
          <div>
            <div className={styles.logoText}>Belvedere <span className="text-gradient">AI™</span></div>
            <div className={styles.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${tab === item.key ? styles.navItemActive : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/onboard" className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <IconPlus size={14} /> New Session
          </a>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={logout}>
            <IconLogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <span>Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className={styles.content}>
                <div className={styles.pageHeader}>
                  <h1 className={styles.pageTitle}>Overview</h1>
                  <p className={styles.pageDesc}>Monitor Belvedere AI activity and usage</p>
                </div>

                <div className={styles.statsGrid}>
                  <div className={`glass-card ${styles.statCard}`}>
                    <div className={styles.statIcon}><IconUsers size={26} /></div>
                    <div className={styles.statVal}>{sessions.length}</div>
                    <div className={styles.statLabel}>Total Sessions</div>
                  </div>
                  <div className={`glass-card ${styles.statCard}`}>
                    <div className={styles.statIcon}><IconBarChart size={26} /></div>
                    <div className={styles.statVal}>{sessions.filter(s => s.roadmaps && s.roadmaps.length > 0).length}</div>
                    <div className={styles.statLabel}>Roadmaps Generated</div>
                  </div>
                  <div className={`glass-card ${styles.statCard}`}>
                    <div className={styles.statIcon}><IconChat size={26} /></div>
                    <div className={styles.statVal}>
                      {sessions.reduce((acc, s) => acc + (s.conversations?.[0]?.messages?.length || 0), 0)}
                    </div>
                    <div className={styles.statLabel}>Total Messages</div>
                  </div>
                  <div className={`glass-card ${styles.statCard}`}>
                    <div className={styles.statIcon}><IconSettings size={26} /></div>
                    <div className={styles.statVal}>{configs.length}</div>
                    <div className={styles.statLabel}>Config Keys</div>
                  </div>
                </div>

                <div className={`glass-card ${styles.recentSessions}`}>
                  <h3 className={styles.cardTitle}>Recent Sessions</h3>
                  <div className={styles.sessionsTable}>
                    <div className={styles.tableHeader}>
                      <span>Business</span>
                      <span>Industry</span>
                      <span>Country</span>
                      <span>Date</span>
                      <span>Status</span>
                    </div>
                    {sessions.slice(0, 5).map((s) => (
                      <div key={s.id} className={styles.tableRow}>
                        <span className={styles.tableName}>{s.business_name}</span>
                        <span>{s.industry}</span>
                        <span>{s.country}</span>
                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        <span>
                          {s.roadmaps && s.roadmaps.length > 0
                            ? <span className="badge badge-low" style={{ color: '#2d7a4e' }}>Done</span>
                            : <span className="badge badge-medium" style={{ color: '#74A5AF' }}>Pending</span>
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Prompts Tab */}
            {tab === 'prompts' && (
              <div className={styles.content}>
                <div className={styles.pageHeader}>
                  <h1 className={styles.pageTitle}>System Prompts</h1>
                  <p className={styles.pageDesc}>Modify how Belvedere AI thinks and responds</p>
                </div>

                <div className={styles.configList}>
                  {configs.map((config) => (
                    <div key={config.key} className={`glass-card ${styles.configCard}`}>
                      <div className={styles.configHeader}>
                        <div>
                          <div className={styles.configKey}>{config.key}</div>
                          <div className={styles.configDesc}>{config.description}</div>
                          <div className={styles.configUpdated}>
                            Last updated: {new Date(config.updated_at).toLocaleString()}
                          </div>
                        </div>
                        <div className={styles.configActions}>
                          {savedKey === config.key && (
                            <span className="badge badge-low" style={{ color: '#2d7a4e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <IconCheckCircle size={13} /> Saved
                            </span>
                          )}
                          {editingKey !== config.key && (
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(config)}>
                              Edit
                            </button>
                          )}
                        </div>
                      </div>

                      {editingKey === config.key ? (
                        <div className={styles.configEdit}>
                          <textarea
                            className={`form-textarea ${styles.promptTextarea}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={12}
                          />
                          <div className={styles.configEditActions}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingKey(null)}>
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => saveEdit(config.key)}
                              disabled={saving}
                            >
                              {saving ? <><span className="spinner" />Saving...</> : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.configValue}>{config.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {tab === 'sessions' && (
              <div className={styles.content}>
                <div className={styles.pageHeader}>
                  <h1 className={styles.pageTitle}>All Sessions</h1>
                  <p className={styles.pageDesc}>{sessions.length} total sessions recorded</p>
                </div>

                <div className={styles.sessionsList}>
                  {sessions.map((s) => (
                    <div key={s.id} className={`glass-card ${styles.sessionCard}`}>
                      <div
                        className={styles.sessionCardHeader}
                        onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                      >
                        <div className={styles.sessionCardInfo}>
                          <div className={styles.sessionCardName}>{s.business_name}</div>
                          <div className={styles.sessionCardMeta}>
                            {s.industry} · {s.country} · {s.num_employees}
                          </div>
                        </div>
                        <div className={styles.sessionCardRight}>
                          <span className={styles.sessionCardDate}>
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                          <a
                            href={`/advisor/${s.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            View <IconExternalLink size={12} />
                          </a>
                          <span className={styles.expandIcon}>
                            {expandedSession === s.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                          </span>
                        </div>
                      </div>

                      {expandedSession === s.id && (
                        <div className={styles.sessionCardBody}>
                          <div className={styles.sessionDetail}>
                            <div className={styles.sessionDetailRow}>
                              <span className={styles.sessionDetailLabel}>Budget</span>
                              <span>{s.marketing_budget}</span>
                            </div>
                            <div className={styles.sessionDetailRow}>
                              <span className={styles.sessionDetailLabel}>Goals</span>
                              <div className={styles.sessionTags}>
                                {s.business_goals.map((g) => <span key={g} className="badge badge-gold">{g}</span>)}
                              </div>
                            </div>
                            <div className={styles.sessionDetailRow}>
                              <span className={styles.sessionDetailLabel}>Challenges</span>
                              <div className={styles.sessionTags}>
                                {s.growth_challenges.map((c) => <span key={c} className="badge badge-medium">{c}</span>)}
                              </div>
                            </div>
                            {s.roadmaps?.[0]?.roadmap_data?.executive_summary && (
                              <div className={styles.sessionDetailRow}>
                                <span className={styles.sessionDetailLabel}>AI Summary</span>
                                <p className={styles.sessionSummary}>
                                  {s.roadmaps[0].roadmap_data.executive_summary}
                                </p>
                              </div>
                            )}
                            <div className={styles.sessionDetailRow}>
                              <span className={styles.sessionDetailLabel}>Messages</span>
                              <span>{s.conversations?.[0]?.messages?.length || 0} messages</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
              <div className={styles.content}>
                <div className={styles.pageHeader}>
                  <h1 className={styles.pageTitle}>Users</h1>
                  <p className={styles.pageDesc}>All businesses that have used Belvedere AI</p>
                </div>

                <div className={`glass-card ${styles.recentSessions}`}>
                  <div className={styles.sessionsTable}>
                    <div className={`${styles.tableHeader} ${styles.usersTableHeader}`}>
                      <span>#</span>
                      <span>Business Name</span>
                      <span>Industry</span>
                      <span>Country</span>
                      <span>Team</span>
                      <span>Budget</span>
                      <span>Joined</span>
                      <span>Roadmap</span>
                      <span>Actions</span>
                    </div>
                    {sessions.map((s, idx) => (
                      <div key={s.id} className={`${styles.tableRow} ${styles.usersTableRow}`}>
                        <span className={styles.tableRowNum}>{idx + 1}</span>
                        <span className={styles.tableName}>{s.business_name}</span>
                        <span>{s.industry}</span>
                        <span>{s.country}</span>
                        <span>{s.num_employees}</span>
                        <span>{s.marketing_budget}</span>
                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        <span>
                          {s.roadmaps && s.roadmaps.length > 0
                            ? <span style={{ color: '#2d7a4e', fontWeight: 700, fontSize: '0.8rem' }}>✓ Done</span>
                            : <span style={{ color: '#74A5AF', fontWeight: 700, fontSize: '0.8rem' }}>Pending</span>
                          }
                        </span>
                        <span>
                          <a
                            href={`/advisor/${s.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            View <IconExternalLink size={11} />
                          </a>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
