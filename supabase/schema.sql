-- Run this in Supabase: Project -> SQL Editor -> New query -> paste -> Run
create extension if not exists "pgcrypto";

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  logo_url text,
  pos_active boolean not null default false,
  plan text not null default 'monthly',
  sub_status text not null default 'pending',
  expiry date,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  category text,
  price numeric not null,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  type text not null check (type in ('revenue','expense')),
  category text,
  amount numeric not null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  plan text not null,
  amount numeric not null,
  screenshot_url text,
  status text not null default 'pending',
  date date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists idx_bills_restaurant on bills(restaurant_id);
create index if not exists idx_menu_restaurant on menu_items(restaurant_id);
create index if not exists idx_payments_restaurant on payments(restaurant_id);

-- The server uses the service role key, which bypasses RLS. Enable RLS so the
-- public anon key cannot access these tables directly. No browser policies.
alter table admins enable row level security;
alter table restaurants enable row level security;
alter table menu_items enable row level security;
alter table bills enable row level security;
alter table payments enable row level security;

-- One transaction prevents repeat approvals extending the same subscription.
create or replace function review_subscription_payment(p_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p payments%rowtype;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid status';
  end if;
  select * into p from payments where id = p_id for update;
  if not found or p.status <> 'pending' then
    raise exception 'Payment is missing or already reviewed';
  end if;
  update payments set status = p_status where id = p_id;
  if p_status = 'approved' then
    update restaurants set plan = p.plan, sub_status = 'approved', pos_active = true,
      expiry = (greatest(coalesce(expiry, current_date), current_date) +
        case when p.plan = 'yearly' then interval '1 year' else interval '1 month' end)::date
      where id = p.restaurant_id;
  end if;
  return jsonb_build_object('id', p.id, 'status', p_status);
end; $$;
revoke all on function review_subscription_payment(uuid, text) from public, anon, authenticated;
grant execute on function review_subscription_payment(uuid, text) to service_role;

-- Create a public "uploads" bucket for logos and dishes, and a private
-- "payment-proofs" bucket for screenshots in Storage. Only the server uploads.
