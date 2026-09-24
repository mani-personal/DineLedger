import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ session: null });

  if (session.role === 'admin') {
    const { data: admin } = await supabase.from('admins').select('id,email').eq('id', session.id).single();
    if (!admin) return NextResponse.json({ session: null });
    return NextResponse.json({ session: { role: 'admin', email: admin.email } });
  }

  const { data: r } = await supabase.from('restaurants').select('*').eq('id', session.id).single();
  if (!r) return NextResponse.json({ session: null });
  const { password_hash, ...safe } = r;
  return NextResponse.json({ session: { role: 'restaurant', restaurant: safe } });
}
