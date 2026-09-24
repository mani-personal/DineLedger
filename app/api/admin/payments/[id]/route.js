import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { status } = await request.json(); // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const { data: payment, error } = await supabase
    .rpc('review_subscription_payment', { p_id: (await params).id, p_status: status });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ payment });
}
