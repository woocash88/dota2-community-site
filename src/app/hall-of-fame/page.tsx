import Navbar from '@/components/Navbar';
import ClientLightPillar from '@/components/ClientLightPillar';
import TrophyRoom, { type TournamentData, type PlayerInfo } from '@/components/TrophyRoom';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types for the OpenDota API response
// ---------------------------------------------------------------------------

interface OpenDotaProfile {
  personaname: string;
  avatarfull: string;
}

interface OpenDotaResponse {
  profile: OpenDotaProfile | null;
}

// ---------------------------------------------------------------------------
// Shape of a row in the hall_of_fame_tournaments table
// ---------------------------------------------------------------------------

interface DbPlayer {
  name: string;
  friend_id?: number;
  is_substitute: boolean;
}

interface DbTournament {
  id: string;
  tournament_name: string;
  tournament_date: string;
  tournament_id: string;
  dotabuff_link: string;
  players: DbPlayer[];
}

// ---------------------------------------------------------------------------
// Data fetching helpers
// ---------------------------------------------------------------------------

async function fetchPlayer(friendId: number): Promise<PlayerInfo> {
  try {
    const response = await fetch(
      `https://api.opendota.com/api/players/${friendId}`,
      { next: { revalidate: 86400 } },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: OpenDotaResponse = await response.json();
    return {
      friendId,
      name: '',
      personaname: data.profile?.personaname ?? null,
      avatarfull: data.profile?.avatarfull ?? null,
    };
  } catch {
    return { friendId, name: '', personaname: null, avatarfull: null };
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function HallOfFamePage() {
  // 1. Fetch all tournaments from Supabase
  const { data: dbTournaments, error } = await supabase
    .from('hall_of_fame_tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !dbTournaments) {
    console.error('Failed to fetch hall of fame tournaments:', error?.message);
  }

  const tournaments: DbTournament[] = dbTournaments ?? [];

  // 2. Collect all unique friend_ids that exist across all tournaments
  const allFriendIds = new Set<number>();
  for (const t of tournaments) {
    for (const p of t.players) {
      if (p.friend_id != null) {
        allFriendIds.add(p.friend_id);
      }
    }
  }

  // 3. Fetch OpenDota data for all unique friend_ids (deduped)
  const playerInfoMap = new Map<number, PlayerInfo>();
  const results = await Promise.all(
    Array.from(allFriendIds).map(fetchPlayer),
  );
  for (const info of results) {
    playerInfoMap.set(info.friendId!, info);
  }

  // 4. Shape data for TrophyRoom
  const tournamentData: TournamentData[] = tournaments.map((t) => ({
    name: t.tournament_name,
    date: t.tournament_date,
    teamName: t.players.find((p) => !p.is_substitute)?.name ?? '',
    dotabuffLink: t.dotabuff_link,
    tournamentId: t.tournament_id,
    players: t.players.map((p) => {
      const fetched = p.friend_id != null ? playerInfoMap.get(p.friend_id) : undefined;
      return {
        friendId: p.friend_id,
        name: p.name,
        personaname: fetched?.personaname ?? null,
        avatarfull: fetched?.avatarfull ?? null,
        isSubstitute: p.is_substitute,
      };
    }),
  }));

  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <ClientLightPillar
          topColor="#ff0000"
          bottomColor="#ff5500"
          intensity={0.7}
          rotationSpeed={0.2}
          glowAmount={0.002}
          pillarWidth={2.5}
          pillarHeight={0.3}
          noiseIntensity={0.5}
          pillarRotation={90}
          interactive={false}
          mixBlendMode="screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <Navbar />

      {/* Page heading */}
      <section className="relative z-10 text-center pt-16 pb-8 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Hall of Fame
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {tournamentData.length > 0
            ? 'Zwycięzcy naszych dotychczasowych turniejów Dota 2.'
            : 'Brak zapisanych turniejów — wróć później.'}
        </p>
      </section>

      {tournamentData.length > 0 ? (
        <TrophyRoom tournaments={tournamentData} />
      ) : (
        <section className="relative z-10 text-center py-20">
          <p className="text-slate-500 text-lg">
            Brak turniejów w bazie. Dodaj pierwszy w panelu admina.
          </p>
        </section>
      )}
    </main>
  );
}
