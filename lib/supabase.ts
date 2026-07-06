import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BusinessSession = {
  id: string;
  business_name: string;
  industry: string;
  country: string;
  num_employees: string;
  annual_revenue?: string;
  marketing_budget: string;
  business_goals: string[];
  growth_challenges: string[];
  additional_context?: string;
  created_at: string;
};

export type Roadmap = {
  id: string;
  session_id: string;
  roadmap_data: RoadmapData;
  created_at: string;
};

export type RoadmapData = {
  executive_summary: string;
  categories: {
    [key: string]: {
      title: string;
      summary: string;
      actions: { item: string; priority: 'high' | 'medium' | 'low'; timeframe: string }[];
    };
  };
  quick_wins: string[];
  kpis: string[];
};

export type Message = {
  role: 'user' | 'model';
  content: string;
};

export type Conversation = {
  id: string;
  session_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
};
