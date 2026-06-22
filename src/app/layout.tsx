import type { Metadata } from "next";
import "./globals.css"; // Tutaj ładują się nasze nowe style z globals.css

export const metadata: Metadata = {
  title: "Dota2Inhouse.pl - Polska Społeczność Dota 2",
  description: "Największa społeczność graczy Dota 2 w Polsce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased bg-[#050505]">
        {children}
      </body>
    </html>
  );
}