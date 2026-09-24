import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', (await params).id)
    .eq('restaurant_id', session.id); // ensures a restaurant can only delete its own dishes
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
