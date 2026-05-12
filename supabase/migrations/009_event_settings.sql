-- Event settings extra columns
alter table public.events
  add column if not exists location text,
  add column if not exists event_type text default 'other' check (event_type in ('wedding','engagement','birthday','corporate','festival','graduation','other')),
  add column if not exists description text,
  add column if not exists download_quality text default 'original' check (download_quality in ('original','2560px','1600px')),
  add column if not exists cover_url text,
  add column if not exists deleted_at timestamptz;

-- Soft-delete for photos (trash)
alter table public.photos
  add column if not exists deleted_at timestamptz;

create index if not exists idx_photos_deleted on public.photos(deleted_at) where deleted_at is not null;

-- Enrich guest_sessions with optional contact info
alter table public.guest_sessions
  add column if not exists phone text,
  add column if not exists ip_hash text;

-- Index for guest analytics
create index if not exists idx_guest_sessions_created on public.guest_sessions(created_at);
