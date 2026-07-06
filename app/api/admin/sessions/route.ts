import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/sessions — list all sessions with conversation data
export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from('business_sessions')
      .select(`
        id,
        business_name,
        industry,
        country,
        num_employees,
        annual_revenue,
        marketing_budget,
        business_goals,
        growth_challenges,
        created_at,
        roadmaps (roadmap_data),
        conversations (messages)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
