import { Users, Mail } from 'lucide-react';
import StarBorder from '@/components/StarBorder';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
      
      {/* LEWA STRONA: Logo + Podstrony */}
      <div className="flex items-center gap-10">
        <Link href="/" className="hover:opacity-80 transition-opacity drop-shadow-md flex-shrink-0">
          <img 
            src="/pd2ih_logo.png" 
            alt="Dota 2 Inhouse Logo" 
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
          href="https://discord.gg/ZxgmF7Kr4t" 
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