import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });
    }
    if (!fileName) {
      return NextResponse.json({ error: 'Brak nazwy pliku' }, { status: 400 });
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('tournament-banners')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('tournament-banners')
      .getPublicUrl(fileName);

    return NextResponse.json(
      { url: publicUrlData?.publicUrl ?? null },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('Błąd Hof banner upload:', err);
    return NextResponse.json(
      { error: err.message || 'Błąd przesyłania pliku' },
      { status: 500 },
    );
  }
}
