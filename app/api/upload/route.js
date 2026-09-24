import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Logos and dish photos go to the public uploads bucket. Payment screenshots
// go to the private payment-proofs bucket and return a storage path.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  const folder = form.get('folder');
  if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (session.role !== 'restaurant' || !['payments', 'logos', 'dishes'].includes(folder)) {
    return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
  }
  const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const extension = extensions[file.type];
  if (!extension || file.size < 1 || file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Upload a JPG, PNG or WebP image up to 4 MB' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `${folder}/${session.id}/${uuidv4()}.${extension}`;
  const bucket = folder === 'payments' ? 'payment-proofs' : 'uploads';

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (folder === 'payments') return NextResponse.json({ path });
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
