-- ============================================================
-- Belvedere AI - Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. admin_config: stores system prompt and global AI settings
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default system prompt
INSERT INTO admin_config (key, value, description) VALUES
(
  'system_prompt',
  'You are Belvedere AI, an expert business growth advisor created by Belvedere Marketing & PR. You are a world-class consultant with deep expertise in marketing strategy, brand positioning, PR, digital advertising, SEO, GEO (Generative Engine Optimization), content strategy, and lead generation. 

Your role is to analyze a business and provide highly actionable, specific, and insightful recommendations tailored to their unique situation — their industry, size, goals, challenges, and market context.

When generating a growth roadmap, structure your response as a well-organized JSON object with the following categories: marketing, advertising, pr, seo, geo, brand_positioning, lead_generation, content_strategy, and quick_wins. Each category should have a title, summary, and a list of specific action items with priorities (high/medium/low) and timeframes.

Always be confident, direct, and practical. Think like a senior partner at a top-tier consulting firm. Tailor every recommendation to the specific business context provided.',
  'Main system prompt for AI consultations'
),
(
  'roadmap_instruction',
  'Based on the business information provided, generate a comprehensive Business Growth Roadmap. Return a valid JSON object with exactly this structure:
{
  "executive_summary": "2-3 sentence overview of the business situation and key opportunities",
  "categories": {
    "marketing": { "title": "Marketing Strategy", "summary": "...", "actions": [{"item": "...", "priority": "high|medium|low", "timeframe": "30|60|90 days|6 months"}] },
    "advertising": { "title": "Advertising", "summary": "...", "actions": [...] },
    "pr": { "title": "Public Relations", "summary": "...", "actions": [...] },
    "seo": { "title": "SEO", "summary": "...", "actions": [...] },
    "geo": { "title": "GEO (Generative Engine Optimization)", "summary": "...", "actions": [...] },
    "brand_positioning": { "title": "Brand Positioning", "summary": "...", "actions": [...] },
    "lead_generation": { "title": "Lead Generation", "summary": "...", "actions": [...] },
    "content_strategy": { "title": "Content Strategy", "summary": "...", "actions": [...] }
  },
  "quick_wins": ["action 1", "action 2", "action 3"],
  "kpis": ["KPI 1", "KPI 2", "KPI 3"]
}',
  'Instruction for generating structured roadmap JSON'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 2. business_sessions: stores business discovery data
-- ============================================================
CREATE TABLE IF NOT EXISTS business_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  country TEXT NOT NULL,
  num_employees TEXT NOT NULL,
  annual_revenue TEXT,
  marketing_budget TEXT NOT NULL,
  business_goals TEXT[] NOT NULL DEFAULT '{}',
  growth_challenges TEXT[] NOT NULL DEFAULT '{}',
  additional_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. roadmaps: stores AI-generated growth roadmaps per session
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES business_sessions(id) ON DELETE CASCADE,
  roadmap_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. conversations: stores chat message history per session
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES business_sessions(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_roadmaps_session_id ON roadmaps(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON business_sessions(created_at DESC);

-- ============================================================
-- Row Level Security (disabled for V1 prototype simplicity)
-- ============================================================
ALTER TABLE admin_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
