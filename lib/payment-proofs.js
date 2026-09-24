import { supabase } from './supabase';

export async function withProofUrls(payments) {
  return Promise.all((payments || []).map(async (payment) => {
    const path = payment.screenshot_url;
    if (!path || !path.startsWith('payments/')) return payment;
    const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 60 * 10);
    return { ...payment, screenshot_url: data?.signedUrl || null };
  }));
}
