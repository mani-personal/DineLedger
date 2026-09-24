import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', session.id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ menu: data });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  if (typeof body.name !== 'string' || !body.name.trim() ||
      !Number.isFinite(Number(body.price)) || Number(body.price) <= 0) {
    return NextResponse.json({ error: 'Enter a dish name and positive price' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: session.id,
      name: body.name,
      category: body.category,
      price: body.price,
      image_url: body.image_url || null
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dish: data });
}
