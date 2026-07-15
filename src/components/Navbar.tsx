'use client';

import { useEffect, useState } from 'react';
import { Users, Mail } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [discordLink, setDiscordLink] = useState('https://discord.gg/ZxgmF7Kr4t');
  const [pdlLinked, setPdlLinked] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data) => setPdlLinked(data.linked === true))
      .catch(() => setPdlLinked(false));
  }, []);

  useEffect(() => {
    async function fetchDiscordLink() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('category', 'SystemSettings')
          .eq('title', 'global_settings')
          .maybeSingle();
        if (!error && data && data.content) {
          const val = JSON.parse(data.content);
          if (val.discord_link) {
            setDiscordLink(val.discord_link);
          }
        }
      } catch {
        // Ignorujemy błędy i zostajemy przy domyślnym linku
      }
    }
    fetchDiscordLink();
  }, []);

  const navLinks = [
    { href: '/newsy', label: 'Newsy' },
    { href: '#', label: 'Turnieje' },
    { href: '/ranking', label: 'Ranking' },
    { href: '/hall-of-fame', label: 'Hall of Fame' },
    { href: '/basher', label: 'Basher' },
    { href: '/streamy', label: 'Streamy' },
  ];

  return (
    <nav className="relative z-40 border-b border-white/10">
      <div className="flex items-center max-w-7xl mx-auto px-6 py-6">
        <Link href="/" className="hover:opacity-80 transition-opacity drop-shadow-md flex-shrink-0 mr-10">
          <img 
            src="/pd2ih_logo.png" 
            alt="Dota 2 Inhouse Logo" 
            className="h-14 w-auto object-contain" 
          />
        </Link>

        <div className="hidden md:flex items-stretch flex-1">
          <div className="flex w-full">
            {navLinks.map((link) =>
              link.label === 'Turnieje' ? (
                <div key={link.href} className="relative flex-1 flex group">
                  <button className="btn-nav-tile text-lg tracking-wider px-3 py-2.5 not-italic flex-1">
                    <span className="not-italic">TURNIEJE</span>
                  </button>
                  <div className="absolute top-full left-0 flex flex-col bg-[#1A181A]/95 backdrop-blur-md border border-white/10 rounded-b-lg py-2 min-w-[200px] z-50 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
                    <a href="https://dota2inhouse.pl/wiosenna" className="px-4 py-2 text-base text-white hover:bg-white/10 hover:text-red-500 font-bold transition-colors">
                      Wiosenna Furia
                    </a>
                    <a href="https://dota2inhouse.pl/pdl" className="px-4 py-2 text-base text-white hover:bg-white/10 hover:text-red-500 font-bold transition-colors">
                      PDL #1
                    </a>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-nav-tile text-lg tracking-wider px-3 py-2.5 not-italic flex-1"
                >
                  <span className="not-italic">{link.label}</span>
                </Link>
              )
            )}
            <Link
              href="/kontakt"
              className="btn-nav-tile text-lg tracking-wider px-4 py-2.5 not-italic hidden sm:inline-flex flex-1"
            >
              <span className="flex items-center gap-1.5 not-italic">
                Kontakt <Mail className="w-3.5 h-3.5" />
              </span>
            </Link>
            {pdlLinked === false && (
              <a
                href="/api/auth/steam"
                className="btn-nav-tile text-lg tracking-wider px-4 py-2.5 not-italic hidden sm:inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="flex items-center gap-1.5 not-italic">
                  Dołącz <Users className="w-3.5 h-3.5" />
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
