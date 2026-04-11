-- Enable pgvector extension for face embeddings
create extension if not exists vector with schema extensions;

-- Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  event_date date,
  cover_url text,
  pin_code text,
  share_slug text unique not null,
  storage_type text default 'google_drive' check (storage_type in ('google_drive', 'upload')),
  cloud_config jsonb default '{}',
  status text default 'draft' check (status in ('draft', 'active', 'archived')),
  photo_count integer default 0,
  guest_count integer default 0,
  allow_download boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Photos table (metadata only — actual files live in Google Drive or R2)
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  source_url text not null,
  thumbnail_url text,
  drive_file_id text,
  width integer,
  height integer,
  file_size bigint,
  mime_type text,
  faces_indexed boolean default false,
  face_count integer default 0,
  created_at timestamptz default now()
);

-- Face embeddings (128-d vectors from face-api.js)
create table public.face_embeddings (
  id uuid default gen_random_uuid() primary key,
  photo_id uuid references public.photos(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  embedding vector(128) not null,
  bbox_x real,
  bbox_y real,
  bbox_w real,
  bbox_h real,
  face_crop_url text,
  created_at timestamptz default now()
);

-- Guest access records
create table public.guest_sessions (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  guest_name text,
  selfie_embedding vector(128),
  matched_photo_count integer default 0,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_events_host on public.events(host_id);
create index idx_events_slug on public.events(share_slug);
create index idx_photos_event on public.photos(event_id);
create index idx_face_embeddings_event on public.face_embeddings(event_id);
create index idx_face_embeddings_photo on public.face_embeddings(photo_id);
create index idx_guest_sessions_event on public.guest_sessions(event_id);

-- HNSW index for fast vector similarity search
create index idx_face_embedding_vector on public.face_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Row Level Security
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.face_embeddings enable row level security;
alter table public.guest_sessions enable row level security;

-- Hosts can manage their own events
create policy "Hosts can manage own events" on public.events
  for all using (auth.uid() = host_id);

-- Public can view active events by slug (for guest access)
create policy "Public can view active events" on public.events
  for select using (status = 'active');

-- Photos visible to event host
create policy "Host can manage event photos" on public.photos
  for all using (
    event_id in (select id from public.events where host_id = auth.uid())
  );

-- Photos visible for active events (guest gallery)
create policy "Public can view photos of active events" on public.photos
  for select using (
    event_id in (select id from public.events where status = 'active')
  );

-- Face embeddings: host can manage, public can read for active events
create policy "Host can manage face embeddings" on public.face_embeddings
  for all using (
    event_id in (select id from public.events where host_id = auth.uid())
  );

create policy "Public can read embeddings of active events" on public.face_embeddings
  for select using (
    event_id in (select id from public.events where status = 'active')
  );

-- Guest sessions: anyone can create for active events
create policy "Anyone can create guest sessions" on public.guest_sessions
  for insert with check (
    event_id in (select id from public.events where status = 'active')
  );

create policy "Host can view guest sessions" on public.guest_sessions
  for select using (
    event_id in (select id from public.events where host_id = auth.uid())
  );

-- Function to match faces by vector similarity
create or replace function match_faces(
  query_embedding vector(128),
  target_event_id uuid,
  similarity_threshold float default 0.6,
  max_results int default 100
)
returns table (
  photo_id uuid,
  source_url text,
  thumbnail_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    p.id as photo_id,
    p.source_url,
    p.thumbnail_url,
    1 - (fe.embedding <=> query_embedding) as similarity
  from public.face_embeddings fe
  join public.photos p on p.id = fe.photo_id
  where fe.event_id = target_event_id
    and 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  order by similarity desc
  limit max_results;
end;
$$;
