import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/sessions — create a new business session + generate roadmap
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data: session, error: sessionError } = await supabase
      .from('business_sessions')
      .insert([{
        business_name: body.business_name,
        industry: body.industry,
        country: body.country,
        num_employees: body.num_employees,
        annual_revenue: body.annual_revenue || null,
        marketing_budget: body.marketing_budget,
        business_goals: body.business_goals,
        growth_challenges: body.growth_challenges,
        additional_context: body.additional_context || null,
      }])
      .select()
      .single();

    if (sessionError) throw new Error(sessionError.message);

    // Initialize empty conversation
    await supabase.from('conversations').insert([{
      session_id: session.id,
      messages: [],
    }]);

    // Return the session ID immediately. The client will trigger roadmap generation.
    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/sessions — list all sessions (for history)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('business_sessions')
      .select('id, business_name, industry, country, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return NextResponse.json({ sessions: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
