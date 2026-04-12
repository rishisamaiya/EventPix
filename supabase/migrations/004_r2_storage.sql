-- Add R2 storage key to photos table
alter table public.photos add column if not exists storage_key text;

-- Index for fast lookups by storage key
create index if not exists idx_photos_storage_key on public.photos(storage_key);
