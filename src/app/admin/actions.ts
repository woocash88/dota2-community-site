'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ALLOWED_ADMIN_EMAILS = ['voocash.s@gmail.com', 'wilq.wdz@gmail.com'];

async function checkAdminAuth() {
  const supabaseClient = await createServerSupabaseClient();
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error('Unauthenticated: No active session found.');
  }

  const isAuthorized = ALLOWED_ADMIN_EMAILS.includes(user.email ?? '');
  if (!isAuthorized) {
    throw new Error('Unauthorized: You do not have administrator permissions.');
  }

  return user;
}

export async function getRankPlayers() {
  try {
    await checkAdminAuth();

    const { data, error } = await supabaseAdmin
      .from('ranking_leaderboard')
      .select('id, steam_id, name, created_at')
      .is('is_official_leaderboard', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalized = (data ?? []).map((row) => ({
      id: row.id as string,
      steam_id: row.steam_id as string,
      name: row.name as string,
      created_at: row.created_at as string,
    }));

    return { success: true as const, data: normalized };
  } catch (err: unknown) {
    console.error('Server action — getRankPlayers:', err);
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas pobierania graczy z rankingu.',
    };
  }
}

export async function deleteRankPlayer(steamId: string) {
  try {
    await checkAdminAuth();

    const { error } = await supabaseAdmin
      .from('ranking_leaderboard')
      .delete()
      .eq('steam_id', steamId);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteRankPlayer:', err);
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas usuwania gracza z rankingu.',
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
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas dodawania streamera.',
    };
  }
}

export async function updateStreamer(
  id: string,
  data: { nick: string; motto: string; stream_url: string },
) {
  try {
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas aktualizacji streamera.',
    };
  }
}

export async function deleteStreamer(id: string) {
  try {
    await checkAdminAuth();

    const { error } = await supabaseAdmin
      .from('streamers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteStreamer:', err);
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas usuwania streamera.',
    };
  }
}

export async function getContentPage(slug: string) {
  try {
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas pobierania treści strony.',
    };
  }
}

export async function upsertContentPage(slug: string, content: string) {
  try {
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas zapisywania treści strony.',
    };
  }
}

export async function deleteContentPage(slug: string) {
  try {
    await checkAdminAuth();

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('category', 'ContentPage')
      .eq('title', slug);

    if (error) throw error;

    return { success: true as const };
  } catch (err: unknown) {
    console.error('Server action — deleteContentPage:', err);
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas usuwania strony.',
    };
  }
}

export async function uploadNewsImage(formData: FormData) {
  try {
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas przesyłania zdjęcia.',
    };
  }
}

export async function updateStreamerPositions(
  updates: { id: string; position: number }[],
) {
  try {
    await checkAdminAuth();

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
    const isAuthError = err instanceof Error && (err.message.startsWith('Unauthenticated') || err.message.startsWith('Unauthorized'));
    return {
      success: false as const,
      error: isAuthError ? (err as Error).message : 'Wystąpił błąd podczas aktualizacji pozycji streamerów.',
    };
  }
}
