-- Privacy Mode: host can hide all photos until guest takes a selfie.
-- When privacy_mode = true:
--   - The "Official" gallery is hidden / shown blurred to guests
--   - Guests must take a selfie to reveal their matched photos
-- When privacy_mode = false (default):
--   - All photos are visible; selfie just filters to "My Photos"
alter table public.events
  add column if not exists privacy_mode boolean default false;
