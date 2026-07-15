'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function getRankPlayers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('players')
      .select('steam_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalized = (data ?? []).map((row) => ({
      steam_id: row.steam_id as string,
      created_at: row.created_at as string,
    }));

    return { success: true as const, data: normalized };
  } catch (err: unknown) {
    console.error('Server action — getRankPlayers:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function deleteRankPlayer(steamId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('players')
      .delete()
      .eq('steam_id', steamId);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteRankPlayer:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function addStreamer(formData: {
  nick: string;
  motto: string;
  stream_url: string;
  position: number;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('streamers')
      .insert([{
        nick: formData.nick,
        motto: formData.motto,
        stream_url: formData.stream_url,
        position: formData.position,
      }]);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — addStreamer:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function updateStreamer(
  id: string,
  data: { nick: string; motto: string; stream_url: string },
) {
  try {
    const { error } = await supabaseAdmin
      .from('streamers')
      .update({
        nick: data.nick,
        motto: data.motto,
        stream_url: data.stream_url,
      })
      .eq('id', id);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — updateStreamer:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function deleteStreamer(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('streamers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteStreamer:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function getContentPage(slug: string) {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, content, created_at')
      .eq('category', 'ContentPage')
      .eq('title', slug)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true as const,
      data: { id: (data?.id as number) ?? 0, content: (data?.content as string) ?? '' },
    };
  } catch (err: unknown) {
    console.error('Server action — getContentPage:', err);
    return { success: false as const, error: err instanceof Error ? err.message : JSON.stringify(err) };
  }
}

export async function upsertContentPage(slug: string, content: string) {
  try {
    // Check if row exists
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('category', 'ContentPage')
      .eq('title', slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('news')
        .update({ content })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('news')
        .insert({ title: slug, content, category: 'ContentPage' });
      if (error) throw error;
    }

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — upsertContentPage:', err);
    return { success: false as const, error: err instanceof Error ? err.message : JSON.stringify(err) };
  }
}

export async function deleteContentPage(slug: string) {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('category', 'ContentPage')
      .eq('title', slug);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteContentPage:', err);
    return { success: false as const, error: err instanceof Error ? err.message : JSON.stringify(err) };
  }
}

export async function uploadNewsImage(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');

    const bucketName = 'news-images';
    const fileExt = file.name.split('.').pop();
    const filePath = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { success: true as const, publicUrl: publicUrlData.publicUrl };
  } catch (err: unknown) {
    console.error('Server action — uploadNewsImage:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}

export async function updateStreamerPositions(
  updates: { id: string; position: number }[],
) {
  try {
    for (const { id, position } of updates) {
      const { error } = await supabaseAdmin
        .from('streamers')
        .update({ position })
        .eq('id', id);
      if (error) throw error;
    }
    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — updateStreamerPositions:', err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
}
