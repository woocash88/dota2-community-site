import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sign } from '@/lib/session';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const claimedId = url.searchParams.get('openid.claimed_id');

  if (!claimedId) {
    return NextResponse.json({ error: 'Brak openid.claimed_id w żądaniu.' }, { status: 400 });
  }

  // --- OpenID 2.0 verification ---
  // Forward all openid.* params back to Steam with mode=check_authentication
  const verifyParams = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (key.startsWith('openid.')) {
      verifyParams.set(key, value);
    }
  }
  verifyParams.set('openid.mode', 'check_authentication');

  let verifyResponse: Response;
  try {
    verifyResponse = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    });
  } catch {
    return NextResponse.json({ error: 'Nie udało się zweryfikować odpowiedzi Steam.' }, { status: 502 });
  }

  const verifyText = await verifyResponse.text();

  // Steam responds with newline-separated key:value pairs; check for is_valid:true
  const isValid = verifyText.split('\n').some(
    (line) => line.trim().toLowerCase() === 'is_valid:true'
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Weryfikacja OpenID nie powiodła się – odpowiedź Steam nie jest ważna.' }, { status: 403 });
  }

  // --- Extract Steam ID ---
  const steamId64 = claimedId.replace('https://steamcommunity.com/openid/id/', '');
  const steamId32 = (BigInt(steamId64) - BigInt('76561197960265728')).toString();

  // --- Upsert into players table (service role – bypasses RLS) ---
  const { error: upsertError } = await supabaseAdmin
    .from('players')
    .upsert({ steam_id: steamId32 }, { onConflict: 'steam_id', ignoreDuplicates: true });

  if (upsertError) {
    console.error('Błąd upsertu do Supabase:', upsertError.message);
    return NextResponse.json({ error: 'Nie udało się zapisać gracza w bazie danych.' }, { status: 500 });
  }

  // --- Set signed session cookie ---
  const sessionToken = sign(steamId32);
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const response = NextResponse.redirect(`${protocol}://${host}/ranking`);

  response.cookies.set('pdl_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // No maxAge/expires = session cookie (cleared when browser closes)
    // Set a long maxAge for persistent sessions (e.g. 1 year)
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
