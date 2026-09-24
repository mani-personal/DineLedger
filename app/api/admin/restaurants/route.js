import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase
    .from('restaurants')
    .select('id,name,email,logo_url,pos_active,plan,sub_status,expiry,created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurants: data });
}

export async function POST(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, password, plan } = await request.json();
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' ||
      !email.includes('@') || typeof password !== 'string' || password.length < 12 ||
      !['monthly', 'yearly'].includes(plan)) {
    return NextResponse.json({ error: 'Enter a name, valid email, plan and password of at least 12 characters' }, { status: 400 });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash,
      pos_active: false,
      plan: plan || 'monthly',
      sub_status: 'pending',
      expiry: new Date().toISOString().slice(0, 10)
    })
    .select('id,name,email,logo_url,pos_active,plan,sub_status,expiry')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurant: data });
}
