import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: r } = await supabase
    .from('restaurants')
    .select('pos_active,sub_status,expiry')
    .eq('id', session.id)
    .single();

  if (!r?.pos_active || r.sub_status !== 'approved' || !r.expiry || r.expiry < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: 'POS billing is paused for this restaurant' }, { status: 403 });
  }

  const { items } = await request.json(); // [{ dishId, qty }]
  if (!Array.isArray(items) || !items.length || items.length > 100 || items.some((i) =>
    typeof i.dishId !== 'string' || !Number.isSafeInteger(i.qty) || i.qty < 1 || i.qty > 100)) {
    return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
  }

  const ids = items.map((i) => i.dishId);
  const { data: dishes, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .in('id', ids)
    .eq('restaurant_id', session.id);
  if (menuError) return NextResponse.json({ error: menuError.message }, { status: 500 });
  if (dishes.length !== new Set(ids).size) {
    return NextResponse.json({ error: 'Some dishes are unavailable' }, { status: 400 });
  }

  let total = 0;
  const parts = [];
  for (const it of items) {
    const d = dishes.find((x) => x.id === it.dishId);
    total += Number(d.price) * it.qty;
    parts.push(`${d.name} x${it.qty}`);
  }

  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: 'Nothing to bill' }, { status: 400 });
  }

  const { data: bill, error } = await supabase
    .from('bills')
    .insert({
      restaurant_id: session.id,
      type: 'revenue',
      category: 'POS Sale',
      amount: total,
      note: parts.join(', '),
      date: new Date().toISOString().slice(0, 10)
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bill });
}
