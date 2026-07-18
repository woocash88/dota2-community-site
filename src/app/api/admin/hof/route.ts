import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ALLOWED_ADMIN_EMAILS = ['voocash.s@gmail.com', 'wilq.wdz@gmail.com'];

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMIN_EMAILS.includes(user.email ?? '')) {
    return false;
  }
  return true;
}

// upsert a tournament record (insert or update)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...payload } = body;

    let result;
    if (id) {
      result = await supabaseAdmin
        .from('hall_of_fame_tournaments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('hall_of_fame_tournaments')
        .insert([{ ...payload, status: 'draft' }])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data }, { status: 200 });
  } catch (err: unknown) {
    console.error('Błąd Hof POST:', err);
    return NextResponse.json({ error: 'Wystąpił błąd podczas zapisywania turnieju.' }, { status: 500 });
  }
}

// delete a tournament record
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Brak id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('hall_of_fame_tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Błąd Hof DELETE:', err);
    return NextResponse.json({ error: 'Wystąpił błąd podczas usuwania turnieju.' }, { status: 500 });
  }
}

// publish a tournament (set status to published)
export async function PATCH(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Brak id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('hall_of_fame_tournaments')
      .update({ status: status || 'published' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Błąd Hof PATCH:', err);
    return NextResponse.json({ error: 'Wystąpił błąd podczas publikowania turnieju.' }, { status: 500 });
  }
}
