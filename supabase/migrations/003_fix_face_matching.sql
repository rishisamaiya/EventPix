-- Drop the old cosine-based index and function
drop index if exists idx_face_embedding_vector;

-- Create L2 (Euclidean) distance index — correct metric for face-api.js
create index idx_face_embedding_vector on public.face_embeddings
  using hnsw (embedding vector_l2_ops)
  with (m = 16, ef_construction = 64);

-- Replace match function with Euclidean distance
-- face-api.js thresholds: < 0.4 = strong match, < 0.6 = match, > 0.6 = different person
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
  select distinct on (p.id)
    p.id as photo_id,
    p.source_url,
    p.thumbnail_url,
    (fe.embedding <-> query_embedding) as similarity
  from public.face_embeddings fe
  join public.photos p on p.id = fe.photo_id
  where fe.event_id = target_event_id
    and (fe.embedding <-> query_embedding) < similarity_threshold
  order by p.id, (fe.embedding <-> query_embedding) asc;
end;
$$;
