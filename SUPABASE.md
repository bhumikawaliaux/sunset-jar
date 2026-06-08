# Supabase setup

The app runs in **local-only mode** until these env vars are set. Once they
are, sunsets are uploaded to Storage, indexed in Postgres, and per-user
via Google OAuth.

## 1 · Create the project

1. Sign up at https://supabase.com (free tier is plenty).
2. Create a new project. Note the **Project URL** and **anon public key**
   from *Project Settings → API*.

## 2 · Env vars

Copy `.env.example` → `.env.local` (gitignored) and paste real values:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev` after editing.

## 3 · Database table

Open the Supabase SQL editor and run:

```sql
create table public.sunsets (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  image_url   text not null,
  place       text not null,
  "time"      text,
  note        text,
  created_at  timestamptz not null default now()
);

create index sunsets_user_idx on public.sunsets(user_id, created_at desc);

alter table public.sunsets enable row level security;

create policy "read own"   on public.sunsets for select using (auth.uid() = user_id);
create policy "insert own" on public.sunsets for insert with check (auth.uid() = user_id);
create policy "update own" on public.sunsets for update using (auth.uid() = user_id);
create policy "delete own" on public.sunsets for delete using (auth.uid() = user_id);
```

## 3b · Community social tables (optional)

For syncing follows, saved community posts, and likes when signed in:

```sql
create table public.follows (
  follower_id   uuid not null references auth.users(id) on delete cascade,
  followed_user text not null,
  created_at    timestamptz not null default now(),
  primary key (follower_id, followed_user)
);

create table public.saved_posts (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.community_likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.follows enable row level security;
alter table public.saved_posts enable row level security;
alter table public.community_likes enable row level security;

create policy "read own follows"   on public.follows for select using (auth.uid() = follower_id);
create policy "insert own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "delete own follows" on public.follows for delete using (auth.uid() = follower_id);

create policy "read own saved"   on public.saved_posts for select using (auth.uid() = user_id);
create policy "insert own saved" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "delete own saved" on public.saved_posts for delete using (auth.uid() = user_id);

create policy "read own likes"   on public.community_likes for select using (auth.uid() = user_id);
create policy "insert own likes" on public.community_likes for insert with check (auth.uid() = user_id);
create policy "delete own likes" on public.community_likes for delete using (auth.uid() = user_id);
```

## 4 · Storage bucket

In *Storage → Create bucket*:

- **Name:** `sunsets`
- **Public bucket:** ✅ on (so jar images load without signed URLs)
- File size limit: 10 MB is plenty

Then add RLS policies for the bucket (Storage → Policies → `sunsets`):

```sql
-- Anyone can read (bucket is public)
create policy "public read" on storage.objects
  for select using ( bucket_id = 'sunsets' );

-- Signed-in users can write only within their own folder (user_id/...)
create policy "auth upload own" on storage.objects
  for insert with check (
    bucket_id = 'sunsets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "auth update own" on storage.objects
  for update using (
    bucket_id = 'sunsets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "auth delete own" on storage.objects
  for delete using (
    bucket_id = 'sunsets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 5 · Google OAuth

1. **Google Cloud Console** → APIs & Services → Credentials → *Create OAuth
   client ID* → Web application.
   - Authorized JavaScript origins: `https://YOUR-PROJECT-REF.supabase.co`,
     `http://localhost:5174`, plus any production domain.
   - Authorized redirect URIs:
     `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
2. Copy the **Client ID** and **Client secret**.
3. In Supabase → *Authentication → Providers → Google* — enable it and paste
   the client id/secret. Save.
4. In Supabase → *Authentication → URL Configuration* — add
   `http://localhost:5174` to the *Site URL* and to *Additional Redirect URLs*.

## 6 · Try it

```bash
npm run dev
```

- Open the app → Profile tab.
- "Back up your jars" card → tap **Google** → complete OAuth in popup/redirect.
- The card disappears and your Google avatar + name show in the user card.
- Add a sunset on Home. The photo uploads in the background; in a moment the
  jar's `imageUrl` switches from a local `data:` URL to a public
  `https://...supabase.co/storage/v1/object/public/sunsets/<uid>/<id>.jpg`.
- Refresh the browser → your sunsets are still there (loaded from Postgres).

## Notes

- **Schema for editing:** the `updateSunset(id, patch)` flow in
  `SunsetContext.tsx` calls `sunsets-db.ts`, which updates only the changed
  columns (`place`, `time`, `note`, `image_url`).
- **Optimistic UI:** new sunsets appear immediately with their local `data:`
  URL. The background sync swaps the URL once the upload + insert finishes.
  If sync fails, `sunset.syncError` is populated and the row stays local.
- **Bucket size:** photos are stored at their original FileReader output. For
  big files, consider downscaling client-side before upload (canvas →
  `toBlob('image/jpeg', 0.85)`).
- **Local mode:** with no env vars set, sunsets, follows, likes, and saves
  persist in `localStorage` — no cloud sync, but jars survive refresh.
