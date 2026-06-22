'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClientLightPillar from '@/components/ClientLightPillar';
import Navbar from '@/components/Navbar';
import { Trash2, Edit2, Plus, Save, X, Newspaper, ChevronDown } from 'lucide-react';
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

  // Widoczność formularza
  const [showForm, setShowForm] = useState(false);

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
    fetchNews();
  }, []);

  // Strip HTML tags for empty-check (Tiptap emits '<p></p>' on empty)
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  // Obsługa zapisu (Dodawanie lub Edycja)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !stripHtml(content)) return;

    if (editingId) {
      await supabase
        .from('news')
        .update({ title, category, content })
        .eq('id', editingId);
    } else {
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Czyszczenie formularza
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Ogólne');
    setContent('');
    setShowForm(false);
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">

      {/* TŁO */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <ClientLightPillar topColor="#ff0000" bottomColor="#ff5500" intensity={0.7} rotationSpeed={0.2} glowAmount={0.002} pillarWidth={2.5} pillarHeight={0.3} noiseIntensity={0.5} pillarRotation={90} interactive={false} mixBlendMode="screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <Navbar />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20">

        {/* ── Nagłówek strony ── */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">Panel Admina</h1>
          <p className="text-slate-500 text-sm">Zarządzaj treścią serwisu dota2inhouse.pl</p>
        </div>

        {/* ── Przyciski sekcji ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingId) {
                resetForm();
              } else {
                setEditingId(null);
                setTitle('');
                setCategory('Ogólne');
                setContent('');
                setShowForm(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
              showForm
                ? 'bg-red-600/20 border-red-500/40 text-red-400'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            {showForm && !editingId ? 'Anuluj' : 'Dodaj news'}
            {!showForm && <Plus className="w-3.5 h-3.5 text-emerald-500" />}
          </button>
          {/* Tu będą kolejne przyciski sekcji w przyszłości */}
        </div>

        {/* ── Formularz (animowany) ── */}
        {showForm && (
          <div className="mb-10 bg-slate-900/40 border border-slate-700 rounded-3xl p-6 lg:p-8 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-200">
                {editingId
                  ? <><Edit2 className="w-5 h-5 text-red-500" /> Edytuj wpis</>
                  : <><Plus className="w-5 h-5 text-emerald-500" /> Nowy news</>
                }
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Wiersz 1: Tytuł + Kategoria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nagłówek (tytuł)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Wpisz tytuł newsa…"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kategoria
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-red-500 outline-none transition-all pr-9"
                    >
                      <option value="Ogólne">Ogólne</option>
                      <option value="Liga PDL">Liga PDL</option>
                      <option value="Turnieje">Turnieje</option>
                      <option value="Aktualizacje">Aktualizacje</option>
                      <option value="Społeczność">Społeczność</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Wiersz 2: Główna treść */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Główna treść (body)
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Wpisz treść wpisu…"
                />
              </div>

              {/* Przyciski akcji */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Zapisz zmiany' : 'Opublikuj news'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" /> Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Lista wpisów ── */}
        <div>
          <h2 className="text-xl font-bold mb-5 text-slate-300 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-slate-500" />
            Opublikowane wpisy
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 text-slate-500 py-10">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              Ładowanie wpisów...
            </div>
          ) : news.length === 0 ? (
            <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-10 text-center text-slate-500">
              Brak wpisów w bazie danych.
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-800/30 transition-all"
                >
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
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {item.content.replace(/<[^>]*>/g, '')}
                    </p>
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