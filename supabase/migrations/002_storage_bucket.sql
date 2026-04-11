-- Create storage bucket for event photos
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-photos');

-- Allow public read access
create policy "Public can view event photos"
on storage.objects for select
to public
using (bucket_id = 'event-photos');

-- Allow owners to delete
create policy "Users can delete own photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-photos');
