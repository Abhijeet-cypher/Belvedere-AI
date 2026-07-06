import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { streamChat } from '@/lib/gemini';

// POST /api/chat — streaming follow-up chat
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    // Fetch session
    const { data: session } = await supabase
      .from('business_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Fetch conversation history
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    const history = conv?.messages || [];

    // Fetch roadmap for context
    const { data: roadmapData } = await supabase
      .from('roadmaps')
      .select('roadmap_data')
      .eq('session_id', sessionId)
      .single();

    const roadmapSummary = roadmapData?.roadmap_data?.executive_summary || '';

    // Fetch system prompt
    const { data: configs } = await supabase
      .from('admin_config')
      .select('key, value')
      .eq('key', 'system_prompt');

    const systemPrompt = configs?.[0]?.value || '';

    // Save user message to DB (fire and forget)
    const newMessages = [...history, { role: 'user', content: message }];
    supabase
      .from('conversations')
      .update({ messages: newMessages, updated_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .then(async ({ error }) => {
        if (error) console.error('Failed to save user message:', error);
      });

    // Stream AI response
    const stream = await streamChat(session, history, message, systemPrompt, roadmapSummary);

    // Collect full response to save to DB after streaming
    const [streamForClient, streamForSave] = stream.tee();

    // Save AI response after reading (async, non-blocking)
    (async () => {
      let fullResponse = '';
      const reader = streamForSave.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }
      const finalMessages = [...newMessages, { role: 'model', content: fullResponse }];
      await supabase
        .from('conversations')
        .update({ messages: finalMessages, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    })();

    return new Response(streamForClient, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
