# RestroBMS — Vercel + Supabase setup

Next.js restaurant billing app with an admin console. The server alone uses the Supabase service role key; browser requests go through authenticated Next.js API routes.

## 1. Create the database and storage

1. Create a Supabase project at https://supabase.com/dashboard. Copy **Project URL** and the **service_role** key from Project Settings → API Keys. Never use the anon/publishable key for `SUPABASE_SERVICE_ROLE_KEY`.
2. In SQL Editor run [`supabase/schema.sql`](supabase/schema.sql) in full. This also enables RLS for all five app tables and creates the subscription approval function. It is safe to run on an existing project; back up production data first.
3. In Storage create two buckets with these exact names:
   - `uploads`: **public**, for logos and dish images.
   - `payment-proofs`: **private**, for payment screenshots.
   Do not add public write policies; uploads happen through authenticated server routes.
4. If you previously used a public `uploads` bucket for payment proofs, its old screenshot URLs remain public. Remove or relocate those old objects separately if sensitive.

## 2. Set environment variables

Copy `.env.example` to `.env.local` and fill the values. Generate a signing secret, for example with `openssl rand -hex 32`.

| Variable | Where | Meaning |
| --- | --- | --- |
| `SUPABASE_URL` | Local and Vercel | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Local and Vercel, server secret | Supabase service role key; never use `NEXT_PUBLIC_` |
| `JWT_SECRET` | Local and Vercel, server secret | Unique random value, at least 32 characters |
| `NEXT_PUBLIC_PLATFORM_UPI` | Local and Vercel | Your **real** UPI ID; the QR code charges this ID |
| `SEED_ADMIN_EMAIL` | Local only | Initial admin login |
| `SEED_ADMIN_PASSWORD` | Local only | Unique admin password, 12+ characters |

Never commit `.env.local`. This project does not need a database password or Supabase anon key.

## 3. Initialize and check locally

```bash
npm ci
npm run seed
npm run build
npm run dev
```

`npm run seed` creates or resets only the admin named by `SEED_ADMIN_EMAIL`. Do not run it again unless you intend to reset that admin's password. Go to http://localhost:3000/login, sign in as Admin, then create restaurants from the admin page. Each restaurant starts with POS paused; approve its payment screenshot, then check the subscription and POS pages. Upload one dish photo and payment proof to confirm both buckets work.

## 4. GitHub and Vercel

1. Put the **contents of the `restrobms` folder** at the root of a new GitHub repository, including `package-lock.json`, `supabase/schema.sql`, and `scripts/seed.js`. Exclude `.env.local`, `node_modules`, and `.next` (already in `.gitignore`).
2. In Vercel choose **Add New → Project → Import Git Repository**. Framework preset: **Next.js**; Root Directory: repository root if you uploaded folder contents, or `restrobms` if the folder itself is in the repo. Build command: `npm run build` (default).
3. Before deploying, add the **four** local and Vercel variables from the table to Project Settings → Environment Variables, selecting Production. Set Preview variables separately if you use preview deployments (prefer a separate Supabase project). Do not add `SEED_ADMIN_PASSWORD` to Vercel.
4. Deploy. If variables were added after the first build, trigger a new deployment. Open `/login` at the assigned Vercel URL and sign in with the admin account seeded against the **same** Supabase project.
5. Verify: create a restaurant; sign in as it; add a dish; record a bill; submit a subscription screenshot; approve it as admin; complete a POS sale and print its receipt.

The screenshot approval is manual evidence review, **not automated payment verification**. Verify the actual credit in your UPI account before approving. Also protect admin credentials and configure platform level rate limits or bot protection for the public login before broad rollout.

## Common problems

- Build fails with `JWT_SECRET must be at least 32 characters`: set it in Vercel Production environment, then redeploy.
- `Invalid credentials`: check `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, run the seed locally against the exact Supabase URL used in Vercel, and choose Admin on login.
- `relation does not exist` or missing `review_subscription_payment`: run the entire SQL file in the project used by `SUPABASE_URL`.
- Storage error `Bucket not found`: create both buckets with the exact spelling and visibility above.
- QR code absent: set `NEXT_PUBLIC_PLATFORM_UPI` to your own UPI ID and redeploy (public Next.js variables are embedded at build time).
- POS paused: restaurant subscription must be approved, not expired, and POS must be active. Approval extends the current future expiry, or starts from today if expired.
