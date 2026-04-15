-- Support Tickets
create table public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_support_tickets_user on public.support_tickets(user_id);
create index idx_support_tickets_status on public.support_tickets(status);
create index idx_support_tickets_email on public.support_tickets(email);

-- RLS
alter table public.support_tickets enable row level security;

-- Anyone can create tickets (public contact form)
create policy "Anyone can create support tickets" on public.support_tickets
  for insert with check (true);

-- Users can view their own tickets
create policy "Users can view own tickets" on public.support_tickets
  for select using (
    user_id = auth.uid() or
    email = (select email from auth.users where id = auth.uid())
  );

-- Service role (admin) has full access via admin client
