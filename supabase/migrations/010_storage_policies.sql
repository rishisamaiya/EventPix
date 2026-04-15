-- Run this in Supabase SQL Editor after creating the 'event-covers' bucket in Storage UI
-- Dashboard → Storage → New Bucket → name: event-covers, Public: ON

-- Allow authenticated users to upload cover photos
create policy "Authenticated users can upload covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-covers');

-- Allow public read (so cover images load for everyone)
create policy "Public can view cover photos"
on storage.objects for select
to public
using (bucket_id = 'event-covers');

-- Allow authenticated users to update/replace their cover
create policy "Authenticated users can update covers"
on storage.objects for update
to authenticated
using (bucket_id = 'event-covers');

-- Allow authenticated users to delete covers
create policy "Authenticated users can delete covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-covers');
