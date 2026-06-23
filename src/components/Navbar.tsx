'use client';

import { useEffect, useState } from 'react';
import { Users, Mail } from 'lucide-react';
import StarBorder from '@/components/StarBorder';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { GlobalSettings } from '@/types';

export default function Navbar() {
  const [discordLink, setDiscordLink] = useState('https://discord.gg/ZxgmF7Kr4t');

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
          const val = JSON.parse(data.content) as GlobalSettings;
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

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
      
      {/* LEWA STRONA: Logo + Podstrony */}
      <div className="flex items-center gap-10">
        <Link href="/" className="hover:opacity-80 transition-opacity drop-shadow-md flex-shrink-0">
          <Image
            src="/pd2ih_logo.png" 
            alt="Dota 2 Inhouse Logo" 
            width={180}
            height={48}
            priority
            className="h-12 w-auto object-contain" 
          />
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <StarBorder as="div" color="#ff0000" speed="4s" thickness={2}>
            {/* Zmiana na /newsy i tekst Newsy */}
            <Link href="/newsy" className="w-full h-full block">Newsy</Link>
          </StarBorder>
          
          <StarBorder as="div" color="#ff5500" speed="5s" thickness={2}>
            <Link href="#" className="w-full h-full block">Turnieje</Link>
          </StarBorder>
          
          <StarBorder as="div" color="#ff0000" speed="6s" thickness={2}>
            <Link href="/ranking" className="w-full h-full block">Ranking</Link>
          </StarBorder>
        </div>
      </div>

      {/* PRAWA STRONA: Discord i Kontakt */}
      <div className="flex items-center gap-8">
        <StarBorder 
          as="a" 
          href={discordLink} 
          target="_blank"
          rel="noopener noreferrer"
          color="#ff0000" 
          speed="3s" 
          thickness={3}
          className="shadow-lg shadow-red-900/20"
        >
          <span className="font-bold">Discord</span> <Users className="w-5 h-5" />
        </StarBorder>

        <Link href="/kontakt" className="hidden sm:flex items-center gap-2 text-l text-slate-200 hover:text-white transition-colors font-bold tracking-wide">
          Kontakt <Mail className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}