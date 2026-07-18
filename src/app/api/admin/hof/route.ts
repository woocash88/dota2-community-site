import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// upsert a tournament record (insert or update)
export async function POST(request: Request) {
  try {
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
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Błąd zapisu turnieju' }, { status: 500 });
  }
}

// delete a tournament record
export async function DELETE(request: Request) {
  try {
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
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Błąd usuwania turnieju' }, { status: 500 });
  }
}

// publish a tournament (set status to published)
export async function PATCH(request: Request) {
  try {
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
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Błąd publikacji turnieju' }, { status: 500 });
  }
}
