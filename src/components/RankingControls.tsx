'use client';

import { useState, useRef, useEffect } from 'react';
// IMPORTUJEMY NOWĄ IKONĘ PŁOMIENIA (Flame)
import { Search, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react'; 
import Image from 'next/image';
import { PlayerData } from '@/types';

interface RankingControlsProps {
  players: PlayerData[];
}

const getRankName = (tier: number, leaderRank: number | null) => {
  if (leaderRank) return `Immortal #${leaderRank}`;
  if (tier === 0) return 'Nieznana';
  const badges = ['Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'];
  return `${badges[Math.floor(tier / 10) - 1] || 'Ranga'} ${tier % 10}`;
};

const getRankEnglishName = (tier: number) => {
  if (!tier || tier === 0) return 'unranked';
  const badges = ['herald', 'guardian', 'crusader', 'archon', 'legend', 'ancient', 'divine', 'immortal'];
  const baseRank = Math.floor(tier / 10) - 1;
  return badges[baseRank] || 'unranked';
};

export default function RankingControls({ players }: RankingControlsProps) {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rankFilter, setRankFilter] = useState('all');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const baseRank = Math.floor(p.rankTier / 10);
    const matchesRank = rankFilter === 'all' || baseRank === parseInt(rankFilter);
    return matchesSearch && matchesRank;
  });

  const suggestions = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const handleSuggestionClick = (name: string) => {
    setSearch(name);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="relative flex-1" ref={searchContainerRef}>
          <Search className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            value={search}
            placeholder="Wpisz nick gracza..." 
            className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:border-red-500 outline-none transition-all"
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          
          {showSuggestions && search.length > 0 && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl backdrop-blur-md">
              {suggestions.map(p => (
                <div 
                  key={p.id}
                  className="px-5 py-3 hover:bg-white/[0.05] cursor-pointer flex items-center gap-4 transition-colors"
                  onClick={() => handleSuggestionClick(p.name)}
                >
                  <Image
                    src={p.avatar}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg border border-white/10"
                  />
                  <div>
                    <span className="block text-slate-200 font-bold">{p.name}</span>
                    <span className="block text-xs text-slate-500">{getRankName(p.rankTier, p.leaderboardRank)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select 
          className="bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-red-500 transition-all cursor-pointer min-w-[200px]"
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
        >
          <option value="all">Wszystkie rangi</option>
          <option value="0">Brak rangi / Nieznana</option>
          <option value="1">Herald</option>
          <option value="2">Guardian</option>
          <option value="3">Crusader</option>
          <option value="4">Archon</option>
          <option value="5">Legend</option>
          <option value="6">Ancient</option>
          <option value="7">Divine</option>
          <option value="8">Immortal</option>
        </select>
      </div>

      <div className="bg-slate-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 text-base font-bold uppercase tracking-wider bg-white/5">
              <th className="py-5 px-6 text-center w-24">Miejsce</th>
              <th className="py-5 px-6">Gracz</th>
              <th className="py-5 px-6">Ranga Dota 2</th>
              <th className="py-5 px-6 text-center w-36">Est. MMR</th>
              <th className="py-5 px-6 text-center">Forma (7 dni)</th>
              <th className="py-5 px-6 text-right">Win Rate (Ogólny)</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => (
                <tr 
                  key={player.id}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-5 px-6 text-center font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    #{index + 1}
                  </td>
                  <td className="py-5 px-6 flex items-center gap-4">
                    <Image
                      src={player.avatar}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl border border-white/10 object-cover"
                    />
                    <span className="font-bold text-2xl text-slate-200 hover:text-red-400 transition-colors">{player.name}</span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/ranks/${getRankEnglishName(player.rankTier)}.png`} 
                        alt="Ikona rangi" 
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain drop-shadow-md"
                      />
                      <span className="text-xl font-medium text-slate-300">
                        {getRankName(player.rankTier, player.leaderboardRank)}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-6 text-center text-2xl font-bold font-mono text-white">
                    {player.mmr > 0 ? player.mmr : '—'}
                  </td>

                  {/* KOSMICZNA KOLUMNA FORMY */}
                  <td className="py-5 px-6 text-center font-mono">
                    {player.trend >= 5 ? (
                      // 🔥 EFEKT "ON FIRE" DLA +5 I WIĘCEJ 🔥
                      <div className="flex items-center justify-center gap-1.5 text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)] font-black text-2xl" title="ON FIRE! Niesamowity winstreak!">
                        <Flame className="w-6 h-6 fill-orange-500 animate-pulse" />
                        <span>+{player.trend}</span>
                      </div>
                    ) : player.trend > 0 ? (
                      // Zwykły wzrost
                      <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xl" title="Więcej wygranych niż przegranych">
                        <TrendingUp className="w-5 h-5" />
                        <span>+{player.trend}</span>
                      </div>
                    ) : player.trend < 0 ? (
                      // Zwykły spadek
                      <div className="flex items-center justify-center gap-1 text-red-500 font-bold text-xl" title="Więcej przegranych niż wygranych">
                        <TrendingDown className="w-5 h-5" />
                        <span>{player.trend}</span>
                      </div>
                    ) : (
                      // Brak zmian
                      <div className="flex items-center justify-center gap-1 text-slate-500 font-bold text-xl" title="Brak zmian / Równy bilans">
                        <Minus className="w-5 h-5" />
                      </div>
                    )}
                  </td>

                  <td className="py-5 px-6 text-right font-mono font-bold text-2xl text-emerald-400">
                    {player.winRate}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                  Brak graczy spełniających kryteria wyszukiwania.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}