import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/config — fetch all config values
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('*')
      .order('key');

    if (error) throw new Error(error.message);
    return NextResponse.json({ configs: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/config — update a config value
export async function PUT(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    const { data, error } = await supabase
      .from('admin_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ config: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
