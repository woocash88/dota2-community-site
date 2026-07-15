'use client';

import { useEffect, useState } from 'react';

export default function JoinSteamButton() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data) => setHidden(data.linked === true))
      .catch(() => setHidden(false));
  }, []);

  if (hidden) return null;

  return (
    <a
      href="/api/auth/steam"
      className="inline-flex flex-col items-center gap-3 bg-gradient-to-r from-white/[0.03] to-white/[0.08] border border-white/10 hover:border-red-500/30 hover:from-red-950/20 hover:to-red-900/10 px-6 py-4 rounded-2xl text-base font-bold transition-all group backdrop-blur-sm shadow-xl"
    >
      <span className="text-slate-200 group-hover:text-white transition-colors">Dołącz do rankingu</span>
      <img
        src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
        alt="Steam"
        className="h-10 w-auto group-hover:scale-105 transition-transform"
      />
    </a>
  );
}
