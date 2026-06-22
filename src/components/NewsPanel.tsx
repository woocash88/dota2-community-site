'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function NewsPanel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setNews(data);
      } catch (error) {
        console.error('Błąd pobierania newsów:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        {/* Zmiana nagłówków */}
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">Newsy</h2>
        <p className="text-slate-400 text-sm">Najnowsze wieści ze społeczności dota2inhouse.pl</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <div className="bg-slate-900/10 border border-white/5 rounded-3xl p-16 text-center backdrop-blur-md">
          {/* Zmiana tekstu pustego stanu */}
          <h3 className="text-xl font-bold text-slate-300 mb-2">Brak nowych newsów</h3>
          <p className="text-slate-500 text-sm">Wróć tu za jakiś czas, żeby sprawdzić najnowsze ogłoszenia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer backdrop-blur-sm group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  {new Date(item.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 leading-tight text-slate-200 group-hover:text-red-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}