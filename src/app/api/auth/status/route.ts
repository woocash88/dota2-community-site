import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSessionSteamId } from '@/lib/session';

export async function GET() {
  const steamId = await getSessionSteamId();

  if (!steamId) {
    return NextResponse.json({ linked: false });
  }

  const { data } = await supabaseAdmin
    .from('players')
    .select('steam_id')
    .eq('steam_id', steamId)
    .maybeSingle();

  const linked = !!data;
  return NextResponse.json({ linked });
}
