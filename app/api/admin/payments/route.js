import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { withProofUrls } from '@/lib/payment-proofs';

// Returns all payments joined with the restaurant's name, newest first.
// The client filters by status (pending / approved / rejected) as needed.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('payments')
    .select('*, restaurants(name)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const payments = (data || []).map((p) => ({ ...p, restaurant_name: p.restaurants?.name }));
  return NextResponse.json({ payments: await withProofUrls(payments) });
}
