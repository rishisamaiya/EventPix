-- Subscriptions & Payment History
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan text not null check (plan in ('free', 'basic', 'standard', 'pro', 'premium')),
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount integer not null default 0,
  currency text default 'INR',
  max_events integer not null default 1,
  max_storage_gb integer not null default 5,
  max_guests integer not null default 100,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.payment_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount integer not null,
  currency text default 'INR',
  status text default 'pending' check (status in ('pending', 'captured', 'failed', 'refunded')),
  plan text not null,
  receipt_url text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_payment_history_user on public.payment_history(user_id);
create index idx_payment_history_razorpay on public.payment_history(razorpay_payment_id);

-- RLS
alter table public.subscriptions enable row level security;
alter table public.payment_history enable row level security;

-- Users can view and manage their own subscriptions
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "Users can insert own subscriptions" on public.subscriptions
  for insert with check (user_id = auth.uid());

create policy "Users can update own subscriptions" on public.subscriptions
  for update using (user_id = auth.uid());

-- Users can view own payment history
create policy "Users can view own payment history" on public.payment_history
  for select using (user_id = auth.uid());

create policy "Users can insert own payment history" on public.payment_history
  for insert with check (user_id = auth.uid());

-- Helper function: get user's active plan limits
create or replace function get_user_plan_limits(target_user_id uuid)
returns table (
  plan text,
  max_events integer,
  max_storage_gb integer,
  max_guests integer
)
language plpgsql
security definer
as $$
begin
  return query
  select s.plan, s.max_events, s.max_storage_gb, s.max_guests
  from public.subscriptions s
  where s.user_id = target_user_id
    and s.status = 'active'
    and (s.expires_at is null or s.expires_at > now())
  order by s.created_at desc
  limit 1;

  -- If no active subscription, return free plan defaults
  if not found then
    return query select 'free'::text, 1, 5, 100;
  end if;
end;
$$;
