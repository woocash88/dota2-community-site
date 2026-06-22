import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Importujemy naszą bazę

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimedId = searchParams.get('openid.claimed_id');

  if (!claimedId) {
    return NextResponse.json({ error: 'Autoryzacja Steam nie powiodła się.' }, { status: 400 });
  }

  const steamId64 = claimedId.replace('https://steamcommunity.com/openid/id/', '');
  const steamId32 = (BigInt(steamId64) - BigInt('76561197960265728')).toString();

  try {
    // Zmieniamy tę linię, aby przechwycić błąd bezpośrednio z Supabase
    const { error: dbError } = await supabase.from('players').upsert([{ steam_id: steamId32 }]);
    
    if (dbError) {
      console.error('Błąd zapisu do Supabase:', dbError.message);
    } else {
      console.log('Pomyślnie zapisano gracza w bazie ID:', steamId32);
    }
  } catch (dbError) {
    console.error('Błąd krytyczny sieci bazy danych:', dbError);
  }

  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  
  // Przekierowujemy czysto na ranking – bez żadnych parametrów w adresie URL!
  return NextResponse.redirect(`${protocol}://${host}/ranking`);
}