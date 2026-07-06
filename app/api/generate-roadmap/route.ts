import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRoadmap } from '@/lib/gemini';

// POST /api/generate-roadmap
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('business_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) throw new Error('Session not found');

    // Fetch admin config (system prompt + roadmap instruction)
    const { data: configs } = await supabase
      .from('admin_config')
      .select('key, value')
      .in('key', ['system_prompt', 'roadmap_instruction']);

    const systemPrompt = configs?.find((c) => c.key === 'system_prompt')?.value || '';
    const roadmapInstruction = configs?.find((c) => c.key === 'roadmap_instruction')?.value || '';

    // Generate roadmap via Gemini
    const rawJson = await generateRoadmap(session, systemPrompt, roadmapInstruction);
    const roadmapData = JSON.parse(rawJson);

    // Save roadmap to DB
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert([{ session_id: sessionId, roadmap_data: roadmapData }])
      .select()
      .single();

    if (roadmapError) throw new Error(roadmapError.message);

    return NextResponse.json({ roadmap: roadmap.roadmap_data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/generate-roadmap?sessionId=xxx — fetch existing roadmap
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    const { data: roadmaps, error: roadmapError } = await supabase
      .from('roadmaps')
      .select('roadmap_data')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    const roadmap = roadmaps && roadmaps.length > 0 ? roadmaps[0] : null;

    const { data: session, error: sessionError } = await supabase
      .from('business_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    const { data: conversation, error: convoError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sessionError) console.error('Session fetch error:', sessionError);
    if (roadmapError) console.error('Roadmap fetch error:', roadmapError);

    return NextResponse.json({
      roadmap: roadmap?.roadmap_data || null,
      session: session || null,
      messages: conversation?.messages || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
