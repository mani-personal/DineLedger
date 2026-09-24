// Run with: npm run seed
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set, either in
// your shell env or in a .env.local file in the project root.
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (at least 12 characters) before seeding.');
  }
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const { error: adminErr } = await supabase
    .from('admins')
    .upsert({ email: adminEmail.trim().toLowerCase(), password_hash: adminHash }, { onConflict: 'email' });
  if (adminErr) throw adminErr;
  console.log(`Admin ready: ${adminEmail.trim().toLowerCase()}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
