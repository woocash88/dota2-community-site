export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export interface PlayerData {
  id: number;
  name: string;
  avatar: string;
  rankTier: number;
  leaderboardRank: number | null;
  winRate: string;
  mmr: number;
  trend: number;
}

export interface CustomFont {
  name: string;
  base64: string;
}

export interface GlobalSettings {
  discord_link?: string;
  font_family?: string;
  custom_fonts?: CustomFont[];
}
