'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClientLightPillar from '@/components/ClientLightPillar';
import Navbar from '@/components/Navbar';
import { Trash2, Edit2, Plus, Save, X, Newspaper, ChevronDown, Settings, Upload } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { NewsItem, CustomFont } from '@/types';

export default function AdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Widoczność formularza newsów
  const [showForm, setShowForm] = useState(false);

  // Stan formularza newsów
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Turniej');
  const [content, setContent] = useState('');

  // Stan sekcji Inne (Ustawienia dodatkowe)
  const [showOtherSettings, setShowOtherSettings] = useState(false);
  const [discordLink, setDiscordLink] = useState('https://discord.gg/ZxgmF7Kr4t');
  const [fontFamily, setFontFamily] = useState('Logik');
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [fontNameInput, setFontNameInput] = useState('');
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [saveSettingsError, setSaveSettingsError] = useState<string | null>(null);

  // Pobieranie newsów (z wykluczeniem wpisu konfiguracyjnego)
  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .neq('category', 'SystemSettings')
      .order('created_at', { ascending: false });

    if (!error && data) setNews(data);
    setLoading(false);
  };

  // Pobieranie ustawień dodatkowych z tabeli news
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('category', 'SystemSettings')
        .eq('title', 'global_settings')
        .maybeSingle();
      if (!error && data && data.content) {
        const val = JSON.parse(data.content);
        if (val.discord_link) setDiscordLink(val.discord_link);
        if (val.font_family) setFontFamily(val.font_family);
        if (val.custom_fonts) setCustomFonts(val.custom_fonts);
      }
    } catch (err) {
      console.error('Błąd pobierania ustawień:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchNews();
      await fetchSettings();
    };
    init();
  }, []);

  // Strip HTML tags for empty-check (Tiptap emits '<p></p>' on empty)
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  // Obsługa zapisu newsa (Dodawanie lub Edycja)
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

  // Obsługa usuwania newsa
  const handleDelete = async (id: number) => {
    if (!window.confirm('Na pewno chcesz usunąć ten wpis?')) return;
    await supabase.from('news').delete().eq('id', id);
    fetchNews();
  };

  // Ładowanie danych do formularza przy edycji newsa
  const handleEditClick = (item: NewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setShowForm(true);
    setShowOtherSettings(false); // Zamknij inne ustawienia przy edycji newsa
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Czyszczenie formularza newsa
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Turniej');
    setContent('');
    setShowForm(false);
  };

  // Obsługa zapisu ustawień dodatkowych w tabeli news jako ukryty wpis systemowy
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSettingsError(null);
    setSaveSettingsSuccess(false);

    try {
      const value = {
        discord_link: discordLink,
        font_family: fontFamily,
        custom_fonts: customFonts,
      };

      // Sprawdź, czy rekord już istnieje
      const { data: existing, error: checkError } = await supabase
        .from('news')
        .select('id')
        .eq('category', 'SystemSettings')
        .eq('title', 'global_settings')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('news')
          .update({ content: JSON.stringify(value) })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('news')
          .insert([{
            title: 'global_settings',
            category: 'SystemSettings',
            content: JSON.stringify(value)
          }]);
        if (insertError) throw insertError;
      }

      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Błąd zapisu ustawień:', err);
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania do bazy danych.';
      setSaveSettingsError(errorMessage);
    }
  };

  // Obsługa wczytywania pliku czcionki i konwersji na Base64
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "");
    const fontName = fontNameInput.trim() || cleanName;

    if (!fontName) {
      alert("Podaj nazwę dla czcionki przed jej wgraniem.");
      return;
    }

    if (file.size > 2000000) {
      alert("Rozmiar pliku czcionki jest zbyt duży! Maksymalny rozmiar to 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const updatedFonts = [...customFonts, { name: fontName, base64 }];
        setCustomFonts(updatedFonts);
        setFontFamily(fontName);
        setFontNameInput('');
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Obsługa usuwania wgranej czcionki
  const handleRemoveFont = (nameToRemove: string) => {
    const updated = customFonts.filter(f => f.name !== nameToRemove);
    setCustomFonts(updated);
    if (fontFamily === nameToRemove) {
      setFontFamily('Logik');
    }
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
          <p className="text-slate-500 text-sm">Zarządzaj treścią i ustawieniami serwisu dota2inhouse.pl</p>
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
                setCategory('Turniej');
                setContent('');
                setShowForm(true);
                setShowOtherSettings(false);
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

          <button
            type="button"
            onClick={() => {
              if (showOtherSettings) {
                setShowOtherSettings(false);
              } else {
                setShowOtherSettings(true);
                resetForm();
              }
            }}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
              showOtherSettings
                ? 'bg-red-600/20 border-red-500/40 text-red-400'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Inne (Ustawienia)
          </button>
        </div>

        {/* ── Zakładka Inne (Ustawienia globalne) ── */}
        {showOtherSettings && (
          <div className="mb-10 bg-slate-900/40 border border-slate-700 rounded-3xl p-6 lg:p-8 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-200">
                <Settings className="w-5 h-5 text-red-500" /> Ustawienia dodatkowe
              </h2>
              <button
                type="button"
                onClick={() => setShowOtherSettings(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Discord Link */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Link zaproszenia Discord
                </label>
                <input
                  type="url"
                  required
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="w-full max-w-xl bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-red-500 outline-none transition-all"
                />
              </div>

              {/* Czcionka strony */}
              <div className="border-t border-white/[0.07] pt-6">
                <h3 className="text-lg font-bold text-slate-300 mb-4">Czcionka serwisu</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wybór czcionki */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Wybierz aktywną czcionkę
                    </label>
                    <div className="relative max-w-md">
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full appearance-none bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-red-500 outline-none transition-all pr-9"
                      >
                        <optgroup label="Podstawowe czcionki">
                          <option value="Logik">Logik (Domyślna)</option>
                          <option value="System-UI">Systemowa Sans-Serif</option>
                          <option value="Inter">Inter (Google Fonts)</option>
                          <option value="Roboto">Roboto (Google Fonts)</option>
                          <option value="Poppins">Poppins (Google Fonts)</option>
                          <option value="Montserrat">Montserrat (Google Fonts)</option>
                        </optgroup>
                        {customFonts.length > 0 && (
                          <optgroup label="Wgrane czcionki (Base64)">
                            {customFonts.map((font) => (
                              <option key={font.name} value={font.name}>
                                {font.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Wybór czcionki Google Fonts (Inter, Roboto, Poppins, Montserrat) automatycznie pobierze ją z serwerów Google bez dodatkowej konfiguracji.
                    </p>
                  </div>

                  {/* Dodawanie nowej czcionki */}
                  <div className="bg-slate-950/30 border border-white/[0.05] rounded-2xl p-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Wgraj nowy plik czcionki (.ttf, .woff, .woff2)
                    </label>
                    
                    <input
                      type="text"
                      value={fontNameInput}
                      onChange={(e) => setFontNameInput(e.target.value)}
                      placeholder="Nazwa czcionki (np. MojaCzcionka)..."
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-slate-300 placeholder-slate-600 focus:border-red-500 outline-none transition-all text-sm mb-3"
                    />

                    <div className="relative flex items-center justify-center border border-dashed border-white/10 hover:border-red-500/50 rounded-xl py-6 bg-slate-950/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept=".ttf,.woff,.woff2,.otf"
                        onChange={handleFontUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400">
                          Kliknij lub przeciągnij plik czcionki
                        </span>
                        <span className="block text-[10px] text-slate-600 mt-1">
                          TTF, WOFF, WOFF2, OTF (max 2MB)
                        </span>
                      </div>
                    </div>

                    {customFonts.length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-slate-400 block mb-2">Wgrane czcionki:</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {customFonts.map((font) => (
                            <div key={font.name} className="flex justify-between items-center bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                              <span className="text-slate-300 font-medium">{font.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFont(font.name)}
                                className="text-red-400 hover:text-red-300 font-bold px-1 transition-colors"
                              >
                                Usuń
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Komunikaty o statusie */}
              {saveSettingsSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl">
                  Ustawienia zostały zapisane!
                </div>
              )}

              {saveSettingsError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl">
                  <p className="font-bold">Błąd zapisu: {saveSettingsError}</p>
                </div>
              )}

              {/* Przyciski formularza */}
              <div className="flex gap-3 pt-3 border-t border-white/[0.07]">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <Save className="w-4 h-4" /> Zapisz ustawienia
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtherSettings(false)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" /> Zamknij
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Formularz newsów (animowany) ── */}
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
                      <option value="Turniej">Turniej</option>
                      <option value="PDL">PDL</option>
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

        {/* ── Lista wpisów (widoczna tylko gdy showForm jest prawda) ── */}
        {showForm && (
          <div className="animate-in fade-in duration-200">
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
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border font-sans ${
                          item.category === 'PDL'
                            ? 'text-red-500 bg-red-500/10 border-red-500/20'
                            : item.category === 'Turniej'
                            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                            : item.category === 'Społeczność'
                            ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
                            : 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                        }`}>
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
        )}

      </section>
    </main>
  );
}