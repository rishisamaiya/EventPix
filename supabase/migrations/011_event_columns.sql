-- Run this in Supabase SQL Editor
-- Adds missing columns that 009_event_settings.sql provided
-- (Run if you already ran 009_privacy_mode.sql but not 009_event_settings.sql)

alter table public.events
  add column if not exists location text,
  add column if not exists event_type text default 'other',
  add column if not exists description text,
  add column if not exists download_quality text default 'original',
  add column if not exists cover_url text,
  add column if not exists deleted_at timestamptz;

-- Soft-delete column for photos (trash feature)
alter table public.photos
  add column if not exists deleted_at timestamptz;

-- Optional: guest session enrichment
alter table public.guest_sessions
  add column if not exists phone text,
  add column if not exists ip_hash text;
