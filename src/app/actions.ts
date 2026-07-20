'use server';

import { supabase } from '@/lib/supabase';

export async function getWardClicks(): Promise<number> {
  const { data } = await supabase
    .from('global_counters')
    .select('value')
    .eq('id', 'ward_clicks')
    .maybeSingle();

  return data?.value ?? 0;
}

export async function incrementWardClicks(): Promise<number | null> {
  const { data, error } = await supabase.rpc('increment_ward_clicks');
  if (error) return null;
  return data as number;
}
