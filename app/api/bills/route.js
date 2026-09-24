import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('restaurant_id', session.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bills: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  if (!['revenue', 'expense'].includes(body.type) || !Number.isFinite(Number(body.amount)) ||
      Number(body.amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ||
      Number.isNaN(Date.parse(body.date))) {
    return NextResponse.json({ error: 'Invalid bill details' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('bills')
    .insert({
      restaurant_id: session.id,
      type: body.type,
      category: body.category,
      amount: body.amount,
      note: body.note,
      date: body.date
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bill: data });
}
