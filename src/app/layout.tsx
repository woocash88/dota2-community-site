import type { Metadata } from "next";
import "./globals.css"; // Tutaj ładują się nasze nowe style z globals.css
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Dota2Inhouse.pl - Polska Społeczność Dota 2",
  description: "Największa społeczność graczy Dota 2 w Polsce.",
};

async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('category', 'SystemSettings')
      .eq('title', 'global_settings')
      .maybeSingle();
    if (error || !data || !data.content) {
      return {
        font_family: 'Logik',
        custom_fonts: []
      };
    }
    return JSON.parse(data.content);
  } catch (e) {
    return {
      font_family: 'Logik',
      custom_fonts: []
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const fontFamily = settings.font_family || 'Logik';
  const customFonts = settings.custom_fonts || [];

  const googleFonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat'];
  const isGoogleFont = googleFonts.includes(fontFamily);

  // Generate CSS for custom fonts
  const fontStyles = customFonts
    .map((font: any) => `
      @font-face {
        font-family: '${font.name}';
        src: url(${font.base64}) format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `)
    .join('\n');

  return (
    <html lang="pl">
      <head>
        {isGoogleFont && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={`https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;600;700;800&display=swap`} rel="stylesheet" />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: `
          ${fontStyles}
          :root {
            --font-sans: '${fontFamily}', sans-serif;
          }
          body {
            font-family: var(--font-sans) !important;
          }
        ` }} />
      </head>
      <body className="antialiased bg-[#050505]">
        {children}
      </body>
    </html>
  );
}