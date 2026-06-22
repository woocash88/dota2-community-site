import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Dynamicznie wykrywamy, czy jesteśmy na localhost, czy na produkcji
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUrl = `${protocol}://${host}/api/auth/steam/callback`;

  const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
  
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': redirectUrl,
    'openid.realm': `${protocol}://${host}`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return NextResponse.redirect(`${steamOpenIdUrl}?${params.toString()}`);
}