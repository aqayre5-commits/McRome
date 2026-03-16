import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveGameSchema } from '@/lib/contracts/api';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = saveGameSchema.safeParse({
    pageId: formData.get('pageId'),
    redirectTo: formData.get('redirectTo') || '/dashboard',
    intent: formData.get('intent') || 'save'
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/games', request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(parsed.data.redirectTo)}`, request.url)
    );
  }

  if (parsed.data.intent === 'remove') {
    await supabase
      .from('saved_games')
      .delete()
      .eq('user_id', data.user.id)
      .eq('page_id', parsed.data.pageId);
  } else {
    await supabase.from('saved_games').upsert(
      {
        user_id: data.user.id,
        page_id: parsed.data.pageId
      },
      { onConflict: 'user_id,page_id', ignoreDuplicates: true }
    );
  }

  return NextResponse.redirect(new URL(parsed.data.redirectTo, request.url));
}
