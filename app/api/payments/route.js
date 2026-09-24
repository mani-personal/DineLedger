import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { withProofUrls } from '@/lib/payment-proofs';

const PRICES = { monthly: 1000, yearly: 8000 }; // yearly is 10,000 with a 2,000 discount

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('restaurant_id', session.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: await withProofUrls(data) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'restaurant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { plan, screenshot_url } = await request.json();
  const amount = PRICES[plan];
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  if (typeof screenshot_url !== 'string' || !screenshot_url.startsWith(`payments/${session.id}/`) ||
      !/^[a-zA-Z0-9/_-]+\.(png|jpe?g|webp)$/.test(screenshot_url)) {
    return NextResponse.json({ error: 'Upload a payment screenshot first' }, { status: 400 });
  }
  const { data: proof } = await supabase.storage.from('payment-proofs').createSignedUrl(screenshot_url, 60);
  if (!proof) return NextResponse.json({ error: 'Payment screenshot not found' }, { status: 400 });

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      restaurant_id: session.id,
      plan,
      amount,
      screenshot_url: screenshot_url || null,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10)
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ payment });
}
