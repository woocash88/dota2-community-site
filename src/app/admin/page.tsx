'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClientLightPillar from '@/components/ClientLightPillar';
import Navbar from '@/components/Navbar';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function AdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stan formularza
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ogólne');
  const [content, setContent] = useState('');

  // Pobieranie newsów
  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchNews();
    };
    init();
  }, []);

  // Obsługa zapisu (Dodawanie lub Edycja)
  // Strip HTML tags for empty-check (Tiptap emits '<p></p>' on empty)
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !stripHtml(content)) return;

    if (editingId) {
      // Edycja istniejącego
      await supabase
        .from('news')
        .update({ title, category, content })
        .eq('id', editingId);
    } else {
      // Dodawanie nowego
      await supabase
        .from('news')
        .insert([{ title, category, content }]);
    }

    resetForm();
    fetchNews();
  };

  // Obsługa usuwania
  const handleDelete = async (id: number) => {
    if (!window.confirm('Na pewno chcesz usunąć ten wpis?')) return;
    
    await supabase.from('news').delete().eq('id', id);
    fetchNews();
  };

  // Ładowanie danych do formularza przy edycji
  const handleEditClick = (item: NewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Czyszczenie formularza
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Ogólne');
    setContent('');
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">
      
      {/* TŁO */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <ClientLightPillar topColor="#ff0000" bottomColor="#ff5500" intensity={0.7} rotationSpeed={0.2} glowAmount={0.002} pillarWidth={2.5} pillarHeight={0.3} noiseIntensity={0.5} pillarRotation={90} interactive={false} mixBlendMode="screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <Navbar />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col lg:flex-row gap-10">
        
        {/* LEWA STRONA - Formularz dodawania/edycji */}
        <div className="w-full lg:w-1/3">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md sticky top-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-200">
              {editingId ? <><Edit2 className="w-5 h-5 text-red-500"/> Edytuj wpis</> : <><Plus className="w-5 h-5 text-emerald-500"/> Nowy wpis</>}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tytuł</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategoria</label>
                <input 
                  type="text" 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="np. Liga PDL, Turnieje, Ogólne"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Treść wpisu</label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Wpisz treść wpisu…"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> {editingId ? 'Zapisz zmiany' : 'Opublikuj'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2">
                    <X className="w-4 h-4" /> Anuluj
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* PRAWA STRONA - Lista aktualnych wpisów */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-6 text-slate-200">Zarządzanie wpisami</h2>
          
          {loading ? (
            <div className="text-slate-500 py-10">Ładowanie wpisów...</div>
          ) : news.length === 0 ? (
            <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-10 text-center text-slate-500">
              Brak wpisów w bazie danych.
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-800/30 transition-all">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(item.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 truncate">{item.title}</h3>
                    <p className="text-sm text-slate-500 truncate mt-1">{item.content.replace(/<[^>]*>/g, '')}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="bg-slate-800 hover:bg-blue-600/20 text-blue-400 p-3 rounded-xl transition-all border border-transparent hover:border-blue-500/30"
                      title="Edytuj"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="bg-slate-800 hover:bg-red-600/20 text-red-400 p-3 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}