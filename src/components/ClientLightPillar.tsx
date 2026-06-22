'use client';

import dynamic from 'next/dynamic';

// Ten komponent działa po stronie klienta i bezpiecznie wyłącza SSR dla tła
const LightPillar = dynamic(() => import('./LightPillar'), { ssr: false });

export default function ClientLightPillar(props: any) {
  return <LightPillar {...props} />;
}