'use client';

import { useEffect } from 'react';

// No longer needed — session state lives in the httpOnly pdl_session cookie
// set server-side during the Steam callback. This remains as a no-op so
// the ranking page doesn't need structural changes.
export default function SteamLinkHandler() {
  useEffect(() => {
    // Clean up any stale URL params from legacy Steam callback redirects
    const params = new URLSearchParams(window.location.search);
    if (params.has('steam_linked') || params.has('sid')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return null;
}
