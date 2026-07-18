'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Shield, TrendingUp, Star } from 'lucide-react';
import ClientLightPillar from '@/components/ClientLightPillar';
import Navbar from '@/components/Navbar';
import SplitText from '@/components/SplitText';
import BorderGlow from '@/components/ui/BorderGlow';
import { supabase } from '@/lib/supabase';

const MOCK_TESTIMONIALS = [
  { id: 1, name: "Kamil", handle: "@kamil_dota", rating: 5, headline: "Najlepsze inhouse'y w Polsce", text: "Świetna organizacja turniejów i super poziom. Polecam każdemu kto chce się rozwijać!", avatar_url: null },
  { id: 2, name: "Zadymka", handle: "@zadymka", rating: 5, headline: "Świetna społeczność", text: "Znalazłem tu stałą ekipę do gry. Zero toksyczności, pełen profesjonalizm i super zabawa.", avatar_url: null },
  { id: 3, name: "Ciptok", handle: "@ciptok3", rating: 5, headline: "Liga PDL wymiata", text: "Rozgrywki w lidze to czysta przyjemność. Admini zawsze pomocni i bardzo szybko reagują na problemy.", avatar_url: null },
  { id: 4, name: "Pocieszny", handle: "@pocieszny", rating: 5, headline: "Super atmosfera", text: "Nigdy nie widziałem tak dobrze zorganizowanego discorda do Doty w Polsce. Mega szacun dla ekipy.", avatar_url: null },
  { id: 5, name: "Damianexis", handle: "@damian", rating: 5, headline: "Czegoś takiego szukałem", text: "Codziennie mnóstwo ludzi do grania. Od kiedy dołączyłem, w ogóle nie gram już solo matchmakingu.", avatar_url: null },
];

export default function Home() {
  const [testimonials, setTestimonials] = useState(MOCK_TESTIMONIALS);

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    }
    fetchTestimonials();
  }, []);
  const [discordCount, setDiscordCount] = useState(2400);
  const [partnerLink, setPartnerLink] = useState('https://dreammachines.pl/pl/?utm_content=dota2');

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(
          'https://discord.com/api/guilds/849440713947971595/widget.json'
        );
        if (res.ok) {
          const data = await res.json();
          setDiscordCount(Math.floor(data.presence_count / 100) * 100);
        }
      } catch {
        // fallback
      }

      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('category', 'SystemSettings')
          .eq('title', 'global_settings')
          .maybeSingle();
        if (!error && data && data.content) {
          const val = JSON.parse(data.content);
          if (val.partner_link) setPartnerLink(val.partner_link);
        }
      } catch {
        // fallback
      }
    }
    fetchAll();
  }, []);

  return (
    <main className="relative bg-[#050505] text-slate-100 overflow-x-hidden" style={{ overflowY: 'visible' }}>
      
      {/* ─── TECH GRID OVERLAY ─── */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ─── RED RADIAL GLOW ─── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── LIGHT PILLAR BACKGROUND ─── */}
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

      <div className="relative">
        <img
          src="/images/ET.webp"
          alt="Elder Titan"
          className="hidden lg:block absolute top-0 bottom-0 h-full w-auto max-w-[22%] object-contain object-bottom opacity-50 pointer-events-none select-none z-0"
          style={{ left: 'calc(4% + 300px)' }}
        />
        <img
          src="/images/Zeus.webp"
          alt="Zeus"
          className="hidden lg:block absolute top-0 bottom-0 h-full w-auto max-w-[22%] object-contain object-bottom opacity-50 pointer-events-none select-none z-0"
          style={{ right: 'calc(4% + 300px)' }}
        />

        {/* ─── HERO SECTION ─── */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-[60px] pb-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl relative z-10"
          >
            <div className="flex flex-col items-center justify-center space-y-1">
              <SplitText
                text="POLSKA"
                tag="h1"
                className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase"
                delay={40}
                duration={0.6}
                ease="power4.out"
                splitType="chars"
              />
              <div className="flex flex-wrap items-center justify-center gap-x-3">
                <SplitText
                  text="SPOŁECZNOŚĆ"
                  tag="h1"
                  className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase"
                  delay={60}
                  duration={0.6}
                  ease="power4.out"
                  splitType="chars"
                />
                <SplitText
                  text="DOTA 2"
                  tag="h1"
                  className="text-4xl md:text-5xl font-black text-red-600 tracking-tighter uppercase"
                  delay={70}
                  duration={0.6}
                  ease="power4.out"
                  splitType="chars"
                />
                <img
                  src="/images/dota2.png"
                  alt="Dota 2 logo"
                  className="inline-block w-8 h-8 md:w-10 md:h-10 object-contain align-middle"
                />
              </div>
            </div>
            <p className="text-slate-300 text-lg md:text-lg max-w-3xl mx-auto leading-relaxed drop-shadow-md mb-12 mt-8">
              Zorganizowana społeczność dla polskich graczy Dota 2. Regularne turnieje, liga drużynowa lub poprostu miejsce gdzie znajdziesz kompanów do gry. Dołącz do nas na Discordzie!
            </p>

            {/* ─── CALL-TO-ACTION BUTTONS ─── */}
            <div className="flex flex-wrap justify-center gap-6">
              <div className="glow-container">
                <a href="https://discord.com/invite/ZxgmF7Kr4t" target="_blank" rel="noopener noreferrer" className="btn-hero h-12 flex items-center px-8 gap-3 text-xl">
                  <span>DOŁĄCZ DO NAS <img src="/images/discord_logo.png" alt="Discord" className="w-7 h-7 object-contain shrink-0" /></span>
                </a>
              </div>
              <div className="glow-container">
                <button className="btn-hero h-12 flex items-center px-8 text-xl">
                  <span>ZOBACZ TURNIEJE</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── SKEWED STATS BAR (12°) ─── */}
        <div className="relative mt-20 z-10 max-w-4xl mx-auto px-4">
          <div className="bg-[#111]/60 border -skew-x-[12deg] shadow-2xl overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 stats-glow h-22">

            {/* Stat 1: Discord */}
            <div className="flex-1 hover:bg-white/[0.02] transition-colors flex">
              <div className="flex-1 py-2 px-4 flex flex-row items-center justify-center gap-4 skew-x-[12deg] text-left">
                <Users className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex flex-col justify-center">
                  <div className="text-xl font-black text-white leading-none">{discordCount}+</div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 mt-1 uppercase">Użytkowników</div>
                </div>
              </div>
            </div>

            {/* Stat 2: Tournaments */}
            <div className="flex-1 hover:bg-white/[0.02] transition-colors flex">
              <div className="flex-1 py-2 px-4 flex flex-row items-center translate-x-3 justify-center gap-4 skew-x-[12deg] text-left">
                <Trophy className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex flex-col justify-center">
                  <div className="text-xl font-black text-white leading-none">Regularne</div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 mt-1 uppercase">Turnieje dla społeczności</div>
                </div>
              </div>
            </div>

            {/* Stat 3: PDL */}
            <div className="flex-1 hover:bg-white/[0.02] transition-colors flex">
              <div className="flex-1 py-2 px-4 flex flex-row items-center justify-center gap-4 skew-x-[12deg] text-left">
                <Shield className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex flex-col justify-center">
                  <div className="text-xl font-black text-white leading-none">PDL</div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 mt-1 uppercase">
                    <div>Polska Liga</div>
                    <div>Dota 2</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat 4: Community */}
            <div className="flex-1 hover:bg-white/[0.02] transition-colors flex">
              <div className="flex-1 py-2 px-4 flex flex-row items-center justify-center gap-4 skew-x-[12deg] text-left">
                <TrendingUp className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex flex-col justify-center">
                  <div className="text-xl font-black text-white uppercase tracking-tight leading-none">Rozwijająca</div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 mt-1 uppercase">Się społeczność</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── TESTIMONIALS MARQUEE ─── */}
      <section className="relative z-10 w-full mt-12 mb-10 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center w-full">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Co o nas mówią</p>
        </div>

        <div
          className="relative w-full max-w-7xl mx-auto overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          }}
        >
          <div className="animate-marquee gap-6 px-3 hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((review, idx) => (
              <BorderGlow
                key={`${review.id}-${idx}`}
                className="w-[340px] md:w-[400px] shrink-0"
                colors={["#ef4444", "#f59e0b", "#8b5cf6"]}
                backgroundColor="#17181c"
                borderRadius={16}
                edgeSensitivity={30}
                glowRadius={40}
                glowIntensity={1.2}
              >
              <a
                href="https://disboard.org/server/947158056381337630"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 flex flex-col gap-4 cursor-pointer h-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.avatar_url ? (
                      <img
                        src={review.avatar_url}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${
                        idx % 3 === 0 ? 'from-red-500 to-purple-600' :
                        idx % 3 === 1 ? 'from-blue-500 to-emerald-500' :
                        'from-orange-500 to-red-600'
                      }`}>
                        {review.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-bold text-base">{review.name}</div>
                      <div className="text-slate-500 text-xs">{review.handle}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-slate-200 text-base mb-1.5">{review.headline}</div>
                  <div className="text-slate-400 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</div>
                </div>
              </a>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNERS SECTION ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mt-10">
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-8">Współpracujemy z</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          <a
            href={partnerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block border border-white/10 rounded-xl overflow-hidden hover:border-red-500/40 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors z-10" />
            <img
              src="/DM.png"
              alt="Dream Machines"
              className="h-20 w-auto object-contain brightness-90 group-hover:brightness-110 transition-all"
            />
          </a>
        </div>
      </section>

    </main>
  );
}
