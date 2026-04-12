-- SECURITY FIX: The "Public can view active events" policy was incorrectly
-- allowing any authenticated user (including other hosts) to see all active
-- events. It should only apply to unauthenticated guests browsing via share link.

-- Fix events table: guests (anonymous) can read active events by slug, but
-- authenticated users that are NOT the host cannot see other hosts' events.
drop policy if exists "Public can view active events" on public.events;

create policy "Guests can view active events" on public.events
  for select using (
    status = 'active'
    and (
      auth.uid() is null           -- unauthenticated guest access via share link
      or auth.uid() = host_id      -- host can always see own events
    )
  );

-- Fix photos table: same issue — any authenticated user could read photos of
-- active events owned by other hosts.
drop policy if exists "Public can view photos of active events" on public.photos;

create policy "Guests can view photos of active events" on public.photos
  for select using (
    event_id in (
      select id from public.events
      where status = 'active'
        and (
          auth.uid() is null
          or auth.uid() = host_id
        )
    )
  );

-- Fix face_embeddings: same issue
drop policy if exists "Public can read embeddings of active events" on public.face_embeddings;

create policy "Guests can read embeddings of active events" on public.face_embeddings
  for select using (
    event_id in (
      select id from public.events
      where status = 'active'
        and (
          auth.uid() is null
          or auth.uid() = host_id
        )
    )
  );
