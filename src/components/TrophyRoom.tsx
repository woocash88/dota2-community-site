'use client';

import { motion } from 'framer-motion';
import { User, ExternalLink } from 'lucide-react';

export interface PlayerInfo {
  friendId?: number;
  name: string;
  personaname: string | null;
  avatarfull: string | null;
  isSubstitute?: boolean;
}

export interface TournamentData {
  name: string;
  date: string;
  teamName: string;
  dotabuffLink: string;
  tournamentId: string;
  players: PlayerInfo[];
}

interface TrophyRoomProps {
  tournaments: TournamentData[];
}

function PlayerTile({ player }: { player: PlayerInfo }) {
  const size = player.isSubstitute
    ? 'w-16 h-16 md:w-20 md:h-20'
    : 'w-20 h-20 md:w-24 md:h-24';

  const displayName = player.personaname ?? player.name;
  const hasFriendId = player.friendId != null;

  const content = (
    <>
      <motion.div
        whileHover={hasFriendId ? { scale: 1.1 } : undefined}
        className={`${size} rounded-full overflow-hidden border-2 border-slate-600/50 ${
          hasFriendId
            ? 'group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]'
            : ''
        } transition-all duration-300 relative`}
      >
        {player.avatarfull ? (
          <img
            src={player.avatarfull}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {player.isSubstitute && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-600/90 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
            Rezerwowy
          </span>
        )}
      </motion.div>

      <span
        className={`font-medium group-hover:text-amber-300 transition-colors duration-300 text-center ${
          player.isSubstitute
            ? 'text-slate-400 text-xs'
            : 'text-slate-300 text-sm'
        }`}
      >
        {displayName}
      </span>
    </>
  );

  if (hasFriendId) {
    return (
      <a
        href={`https://www.dotabuff.com/players/${player.friendId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-2"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {content}
    </div>
  );
}

export default function TrophyRoom({ tournaments }: TrophyRoomProps) {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-24">
      {tournaments.map((tournament, index) => {
        const mainPlayers = tournament.players.filter((p) => !p.isSubstitute);
        const substitute = tournament.players.find((p) => p.isSubstitute);
        const tournamentUrl =
          tournament.dotabuffLink ||
          (tournament.tournamentId
            ? `https://www.dotabuff.com/esports/tournaments/${tournament.tournamentId}`
            : null);

        return (
          <motion.section
            key={tournament.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.15 }}
            className="backdrop-blur-xl bg-slate-900/20 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            {/* Tournament header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-2">
                {tournamentUrl ? (
                  <a
                    href={tournamentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-2"
                  >
                    {tournament.name}
                    <ExternalLink className="w-5 h-5 text-amber-400/70 inline" />
                  </a>
                ) : (
                  tournament.name
                )}
              </h2>
              <p className="text-slate-400 text-sm uppercase tracking-widest">
                {tournament.date}
              </p>
              <p className="text-slate-200 text-lg mt-3 font-semibold">
                {tournament.teamName}
              </p>
            </div>

            {/* Main players row */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              {mainPlayers.map((player, i) => (
                <PlayerTile key={player.friendId ?? `player-${i}`} player={player} />
              ))}
            </div>

            {/* Substitute row */}
            {substitute && (
              <div className="border-t border-white/5 pt-8 mt-8">
                <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                  Rezerwowy
                </p>
                <div className="flex justify-center">
                  <PlayerTile player={substitute} />
                </div>
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
