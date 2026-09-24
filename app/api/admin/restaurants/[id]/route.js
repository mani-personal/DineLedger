import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  if (typeof body.pos_active !== 'boolean' || Object.keys(body).some((key) => key !== 'pos_active')) {
    return NextResponse.json({ error: 'Only pos_active can be updated here' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('restaurants')
    .update({ pos_active: body.pos_active })
    .eq('id', (await params).id)
    .select('id,name,email,logo_url,pos_active,plan,sub_status,expiry')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurant: data });
}
