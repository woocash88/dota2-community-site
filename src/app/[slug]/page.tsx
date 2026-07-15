import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import ClientLightPillar from '@/components/ClientLightPillar';

const PAGE_TITLES: Record<string, string> = {
  rekrutacja: 'Rekrutacja',
  'o-nas': 'O nas',
  'polityka-prywatnosci': 'Polityka Prywatności',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;

  let page: { title: string; content: string } | null = null;

  try {
    const { data } = await supabase
      .from('news')
      .select('title, content')
      .eq('category', 'ContentPage')
      .eq('title', slug)
      .maybeSingle();
    if (data) {
      page = { title: PAGE_TITLES[slug] || slug, content: data.content as string };
    }
  } catch {
    // Fall through to placeholder
  }

  return (
    <main className="relative bg-[#050505] text-slate-100 overflow-x-hidden min-h-screen">
      {/* BACKGROUND */}
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
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        {page ? (
          <>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-12">
              {page.title}
            </h1>
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed
                prose-a:text-red-400 prose-a:no-underline hover:prose-a:text-red-300
                prose-strong:text-slate-100 prose-ul:text-slate-300"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </>
        ) : (
          <div className="text-center py-24">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-slate-600">
              {slug === 'rekrutacja' ? 'Rekrutacja' : slug === 'o-nas' ? 'O nas' : 'Polityka Prywatności'}
            </h1>
            <p className="text-slate-500 text-lg">
              Ta strona jest w trakcie konfiguracji.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
