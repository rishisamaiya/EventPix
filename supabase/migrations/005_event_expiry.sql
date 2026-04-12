-- Add expiry tracking to events
alter table public.events
  add column if not exists expires_at timestamptz,
  add column if not exists status text not null default 'active' check (status in ('active','draft','expired','deleted'));

-- Backfill: set expires_at to 30 days after created_at for existing events
update public.events set expires_at = created_at + interval '30 days' where expires_at is null;

-- Index for cron cleanup queries
create index if not exists idx_events_expires_at on public.events(expires_at);
create index if not exists idx_events_status on public.events(status);
