let heroMap: Record<number, string> | null = null;

export async function getHeroMap(): Promise<Record<number, string>> {
  if (heroMap) return heroMap;
  try {
    const res = await fetch('https://api.opendota.com/api/constants/heroes');
    const data: Record<string, { id: number; name: string }> = await res.json();
    heroMap = {};
    for (const key of Object.keys(data)) {
      const hero = data[key];
      heroMap[hero.id] = key; // key is the short name like "npc_dota_hero_axe"
    }
  } catch {
    heroMap = {};
  }
  return heroMap;
}

export function getHeroImageUrl(shortName: string): string {
  // Extract the hero name after the last underscore
  const heroName = shortName.replace('npc_dota_hero_', '');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;
}

export function getHeroImageUrlById(heroId: number, map: Record<number, string>): string {
  const shortName = map[heroId];
  if (!shortName) return '';
  return getHeroImageUrl(shortName);
}

const ROLE_MAP: Record<string, string> = {
  POSITION_1: 'Carry',
  POSITION_2: 'Mid',
  POSITION_3: 'Offlane',
  POSITION_4: 'Soft Support',
  POSITION_5: 'Hard Support',
};

export function mapPosition(pos: string | null | undefined): string {
  if (!pos) return 'Unknown';
  return ROLE_MAP[pos] || pos;
}
