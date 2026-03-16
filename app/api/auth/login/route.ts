import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/contracts/api';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') || '/dashboard'
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return NextResponse.redirect(new URL('/login?error=credentials', request.url));
  }

  return NextResponse.redirect(new URL(parsed.data.next, request.url));
}
