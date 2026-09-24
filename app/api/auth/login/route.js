import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  const { role, email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  if (!['admin', 'restaurant'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (role === 'admin') {
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({ role: 'admin', id: admin.id, email: admin.email });
    await setSessionCookie(token);
    return NextResponse.json({ role: 'admin', email: admin.email });
  }

  const { data: r } = await supabase
    .from('restaurants')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (!r || !(await bcrypt.compare(password, r.password_hash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = signToken({ role: 'restaurant', id: r.id });
  await setSessionCookie(token);
  const { password_hash, ...safe } = r;
  return NextResponse.json({ role: 'restaurant', restaurant: safe });
}
