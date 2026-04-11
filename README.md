# EventPix

AI-powered event photo sharing with face recognition. Guests find their photos with a selfie.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Auth & DB:** Supabase (PostgreSQL + pgvector + Auth)
- **Face AI:** face-api.js (client-side, $0 cost)
- **Storage:** Google Drive BYOC (Bring Your Own Cloud)
- **Deploy:** Vercel (US East)

## Getting Started

```bash
npm install
npm run dev
```

Set up `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Setup

Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
