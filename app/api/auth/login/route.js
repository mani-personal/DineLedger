import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  const { role, email, password } = await request.json();
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!['admin', 'restaurant'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (role === 'admin') {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Admin login lookup failed:', error);
      return NextResponse.json({ error: 'Authentication database unavailable. Check the server configuration.' }, { status: 503 });
    }

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({ role: 'admin', id: admin.id, email: admin.email });
    await setSessionCookie(token);
    return NextResponse.json({ role: 'admin', email: admin.email });
  }

  const { data: r, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Restaurant login lookup failed:', error);
    return NextResponse.json({ error: 'Authentication database unavailable. Check the server configuration.' }, { status: 503 });
  }

  if (!r || !(await bcrypt.compare(password, r.password_hash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = signToken({ role: 'restaurant', id: r.id });
  await setSessionCookie(token);
  const { password_hash, ...safe } = r;
  return NextResponse.json({ role: 'restaurant', restaurant: safe });
}
