import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/woocash88/dota2-pl-leaderboard/refs/heads/main/polish_top.json';

export async function GET(request: Request) {
  // Simple bearer token auth to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the Polish Top 5000 JSON
  let response: Response;
  try {
    response = await fetch(GITHUB_RAW_URL);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data from GitHub.' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub responded with ${response.status}.` },
      { status: 502 }
    );
  }

  let players: { name: string; rank: number }[];
  try {
    players = await response.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON from GitHub.' },
      { status: 502 }
    );
  }

  if (!Array.isArray(players) || players.length === 0) {
    return NextResponse.json(
      { error: 'Empty or invalid player list.' },
      { status: 502 }
    );
  }

  // Build a set of names from the fetched JSON for later cleanup
  const fetchedNames = new Set<string>();
  let upserted = 0;
  let inserted = 0;

  for (const player of players) {
    const name = player.name?.trim();
    const rank = player.rank;

    if (!name || typeof rank !== 'number') continue;

    fetchedNames.add(name);

    // Check if a record with this name already exists
    const { data: existing } = await supabaseAdmin
      .from('ranking_leaderboard')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      // Update existing record: refresh rank and mark as official
      const { error: updateError } = await supabaseAdmin
        .from('ranking_leaderboard')
        .update({
          leaderboard_rank: rank,
          is_official_leaderboard: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (!updateError) upserted++;
    } else {
      // Insert new record
      const { error: insertError } = await supabaseAdmin
        .from('ranking_leaderboard')
        .insert({
          name,
          leaderboard_rank: rank,
          is_official_leaderboard: true,
          steam_id: null,
        });

      if (!insertError) inserted++;
    }
  }

  // Cleanup: find official entries whose name is no longer in the fetched list
  const { data: staleEntries } = await supabaseAdmin
    .from('ranking_leaderboard')
    .select('id, name')
    .eq('is_official_leaderboard', true);

  let cleaned = 0;
  if (staleEntries) {
    for (const entry of staleEntries) {
      if (!fetchedNames.has(entry.name)) {
        await supabaseAdmin
          .from('ranking_leaderboard')
          .update({
            leaderboard_rank: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id);
        cleaned++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    total_in_json: players.length,
    upserted,
    inserted,
    cleaned,
  });
}
