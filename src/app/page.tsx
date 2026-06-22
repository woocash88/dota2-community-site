'use client';

import { motion } from 'framer-motion';
import ClientLightPillar from '@/components/ClientLightPillar';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">
      
      {/* BACKGROUND ANIMATION */}
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

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 drop-shadow-lg">
              Polska <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Społeczność
              </span> <br />
              Dota 2
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-lg leading-relaxed drop-shadow-md">
              Zintegrowana społeczność polskich graczy. Codzienne lobby, profesjonalna Liga PDL i miejsce dla każdego pasjonata.
            </p>
            {/* Przyciski zostały usunięte */}
          </motion.div>
        </div>

        <div className="flex-1 hidden md:block"></div>
      </section>

      {/* SPONSORZY */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 bg-slate-900/20 rounded-[40px] mb-20 border border-white/5 backdrop-blur-sm mt-10">
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Współpracujemy z</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="text-2xl font-bold">SPONSOR 1</span>
          <span className="text-2xl font-bold">PARTNER 2</span>
          <span className="text-2xl font-bold">DOTA PRO</span>
        </div>
      </section>

    </main>
  );
}