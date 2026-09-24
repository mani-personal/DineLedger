import { createClient } from '@supabase/supabase-js';

// Server-only client using the SERVICE ROLE key. Never import this file
// from a 'use client' component - it must only run in API routes / server code.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
