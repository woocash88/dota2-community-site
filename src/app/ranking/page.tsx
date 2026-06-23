import { Users, Trophy, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ClientLightPillar from '@/components/ClientLightPillar';
import RankingControls from '@/components/RankingControls';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { PlayerData } from '@/types';

export const revalidate = 3600;

const estimateMmrFromTier = (tier: number): number => {
  if (!tier || tier === 0) return 0;
  const baseRank = Math.floor(tier / 10);
  const stars = tier % 10;
  if (baseRank === 8) return 5600;
  const baseMmr = (baseRank - 1) * 760;
  const starsMmr = stars * 150;
  return baseMmr + starsMmr;
};

export default async function RankingPage() {
  let players: PlayerData[] = [];

  try {
    const { data: dbPlayers, error } = await supabase.from('players').select('steam_id');
    
    if (!error && dbPlayers && dbPlayers.length > 0) {
      const activeIds = dbPlayers.map(p => parseInt(p.steam_id, 10));

      const results = await Promise.allSettled(
        activeIds.map(async (id) => {
          try {
            const profileRes = await fetch(`https://api.opendota.com/api/players/${id}`);
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();

            // Ogólny WinRate
            const wlRes = await fetch(`https://api.opendota.com/api/players/${id}/wl`);
            const wlData = await wlRes.json();
            const totalMatches = (wlData.win || 0) + (wlData.lose || 0);
            const winRate = totalMatches > 0 ? ((wlData.win / totalMatches) * 100).toFixed(1) + '%' : '0%';

            // Forma z ostatnich 7 dni (Win - Lose)
            const wl7DaysRes = await fetch(`https://api.opendota.com/api/players/${id}/wl?date=7`);
            const wl7DaysData = await wl7DaysRes.json();
            const trend = (wl7DaysData.win || 0) - (wl7DaysData.lose || 0);

            const openDotaEstimatedMmr = profileData.mmr_estimate?.estimate;
            const finalMmr = openDotaEstimatedMmr || estimateMmrFromTier(profileData.rank_tier || 0);

            return {
              id,
              name: profileData.profile?.personaname || `Gracz #${id}`,
              avatar: profileData.profile?.avatarfull || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
              rankTier: profileData.rank_tier || 0,
              leaderboardRank: profileData.leaderboard_rank || null,
              winRate,
              mmr: finalMmr,
              trend
            };
          } catch (err) {
            console.error(`Error fetching data for player ${id}:`, err);
            return null;
          }
        })
      );

      const data = results
        .filter((res): res is PromiseFulfilledResult<PlayerData | null> => res.status === 'fulfilled')
        .map(res => res.value)
        .filter((p): p is PlayerData => p !== null);

      players = data.sort((a, b) => b.mmr - a.mmr);
    }
  } catch (error) {
    console.error("Błąd ładowania danych na serwerze:", error);
  }

  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <ClientLightPillar topColor="#ff0000" bottomColor="#ff5500" intensity={0.7} rotationSpeed={0.2} glowAmount={0.002} pillarWidth={2.5} pillarHeight={0.3} noiseIntensity={0.5} pillarRotation={90} interactive={false} mixBlendMode="screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <Navbar />

      {/* LEADERBOARD CONTAINER */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20"><Trophy className="w-6 h-6" /></div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Leaderboard PL</h1>
              <p className="text-slate-400 text-sm">Najlepsi polscy gracze w naszej społeczności.</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <a href="/api/auth/steam" className="inline-flex flex-col items-center gap-3 bg-gradient-to-r from-white/[0.03] to-white/[0.08] border border-white/10 hover:border-red-500/30 hover:from-red-950/20 hover:to-red-900/10 px-6 py-4 rounded-2xl text-base font-bold transition-all group backdrop-blur-sm shadow-xl">
              <span className="text-slate-200 group-hover:text-white transition-colors">Dołącz do rankingu</span>
              <Image
                src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
                alt="Steam"
                width={180}
                height={35}
                className="h-6 w-auto group-hover:scale-105 transition-transform"
              />
            </a>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="bg-slate-900/10 border border-white/5 rounded-3xl p-16 text-center backdrop-blur-md">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">Brak graczy w rankingu</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Zainauguruj tabelę! Kliknij przycisk powyżej i zaloguj się przez Steam, aby wskoczyć do zestawienia.
            </p>
          </div>
        ) : (
          <RankingControls players={players} />
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-white/[0.01] p-4 rounded-xl border border-white/5">
          <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Profil gracza musi być ustawiony jako publiczny w ustawieniach gry Dota 2.</span>
        </div>
      </section>

    </main>
  );
}