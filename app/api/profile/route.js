import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json(); // { name?, email?, password?, logo_url? }
  if (body.password && (typeof body.password !== 'string' || body.password.length < 12)) {
    return NextResponse.json({ error: 'Password must have at least 12 characters' }, { status: 400 });
  }
  const update = {};
  if (body.name) update.name = body.name;
  if (body.email) update.email = body.email.toLowerCase();
  if (body.logo_url) update.logo_url = body.logo_url;
  if (body.password) update.password_hash = await bcrypt.hash(body.password, 10);

  const { data, error } = await supabase
    .from('restaurants')
    .update(update)
    .eq('id', session.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { password_hash, ...safe } = data;
  return NextResponse.json({ restaurant: safe });
}
