-- ════════════════════════════════════════════════════════════════
-- LOASH — initial schema
-- Run in Supabase → SQL Editor BEFORE deploying code that reads it.
-- Public site reads with the anon key (RLS: published rows only).
-- Writes happen server-side with the service-role key.
-- ════════════════════════════════════════════════════════════════

create type availability_status as enum ('open', 'limited', 'full', 'closed', 'soon');
create type stop_kind as enum ('home', 'guest', 'convention', 'travel');
create type inquiry_status as enum ('new', 'reviewing', 'accepted', 'deposit_required', 'confirmed', 'completed', 'declined');
create type inquiry_type as enum ('custom', 'portfolio', 'flash', 'cover-up', 'other');

-- ── Artist profile (single row) ──────────────────────────────────
create table artist_profile (
  id            int primary key default 1 check (id = 1),
  bio           text[],
  contact_email text,
  updated_at    timestamptz not null default now()
);

-- ── Categories / styles ──────────────────────────────────────────
-- Styles are a fixed vocabulary in the UI (src/lib/status.ts). Stored as text[] on tattoos
-- so a piece can carry several. Keep this table if you want admin-editable labels later.
create table categories (
  slug  text primary key,           -- e.g. 'blackwork'
  label text not null,
  sort  int not null default 0
);

-- ── Portfolio ────────────────────────────────────────────────────
create table tattoos (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  alt_text      text,
  styles        text[] not null default '{}',
  placement     text,
  featured      boolean not null default false,
  published     boolean not null default true,
  sort_order    int not null default 0,           -- higher = newer / first in "New work"
  image_path    text not null,                    -- Storage path in bucket 'portfolio' (or '/work/slug' for bundled)
  image_width   int not null,
  image_height  int not null,
  image_blur    text,                             -- tiny base64 placeholder
  image_tone    text,                             -- average colour, e.g. '#9b877e'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Places ───────────────────────────────────────────────────────
create table locations (
  id         text primary key,                    -- 'windsor', 'toronto'
  city       text not null,
  region     text not null,
  country    text not null,
  latitude   double precision not null,
  longitude  double precision not null,
  is_home    boolean not null default false
);

-- ── Schedule: blocks of time in one place ────────────────────────
create table schedule (
  id                  text primary key default gen_random_uuid()::text,
  location_id         text not null references locations(id) on delete cascade,
  kind                stop_kind not null default 'guest',
  venue               text,
  start_date          date,                        -- null = dates TBA
  end_date            date,
  status              availability_status not null default 'soon',
  appointment_windows int,
  spots_remaining     int,
  note                text,
  is_placeholder      boolean not null default false,   -- sample rows show a "Sample" tag
  created_at          timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index on schedule (start_date);

-- ── Day-level availability ───────────────────────────────────────
create table availability (
  id           uuid primary key default gen_random_uuid(),
  schedule_id  text not null references schedule(id) on delete cascade,
  location_id  text not null references locations(id) on delete cascade,
  date         date not null,
  status       availability_status not null,
  note         text,
  unique (schedule_id, date)
);
create index on availability (date);

-- ── Inquiries (booking requests) ─────────────────────────────────
create table inquiries (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  status               inquiry_status not null default 'new',
  type                 inquiry_type not null,
  reference_tattoo_id  text,                       -- tattoo id/slug the request started from
  placement            text not null,
  size                 text not null,
  schedule_id          text references schedule(id) on delete set null,
  preferred_dates      date[] not null default '{}',
  flexible_dates       boolean not null default false,
  idea                 text not null,
  name                 text not null,
  email                text not null,
  phone                text,
  instagram            text,
  reference_paths      text[] not null default '{}',   -- Storage paths in 'inquiry-references'
  internal_notes       text
);
create index on inquiries (status, created_at desc);

-- ── Follow Loash: city subscriptions ─────────────────────────────
create table follows (
  email        text not null,
  location_id  text not null references locations(id) on delete cascade,
  created_at   timestamptz not null default now(),
  notified_at  timestamptz,
  primary key (email, location_id)
);

-- ── Users / admin ────────────────────────────────────────────────
-- Admin users live in Supabase Auth (auth.users). This table marks who may use /admin.
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ════════════════ Row Level Security ════════════════
alter table artist_profile enable row level security;
alter table categories     enable row level security;
alter table tattoos        enable row level security;
alter table locations      enable row level security;
alter table schedule       enable row level security;
alter table availability   enable row level security;
alter table inquiries      enable row level security;
alter table follows        enable row level security;
alter table admins         enable row level security;

-- Public read of what the site shows
create policy "public read profile"      on artist_profile for select using (true);
create policy "public read categories"   on categories     for select using (true);
create policy "public read tattoos"      on tattoos        for select using (published);
create policy "public read locations"    on locations      for select using (true);
create policy "public read schedule"     on schedule       for select using (true);
create policy "public read availability" on availability   for select using (true);
-- inquiries & follows: no public policies → only the service role (API routes) can touch them.

-- Admins can do everything (for the V2 dashboard using the user's session)
create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;
create policy "admin all tattoos"      on tattoos        for all using (is_admin()) with check (is_admin());
create policy "admin all locations"    on locations      for all using (is_admin()) with check (is_admin());
create policy "admin all schedule"     on schedule       for all using (is_admin()) with check (is_admin());
create policy "admin all availability" on availability   for all using (is_admin()) with check (is_admin());
create policy "admin all inquiries"    on inquiries      for all using (is_admin()) with check (is_admin());
create policy "admin all follows"      on follows        for all using (is_admin()) with check (is_admin());
create policy "admin all profile"      on artist_profile for all using (is_admin()) with check (is_admin());

-- ════════════════ Storage ════════════════
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('inquiry-references', 'inquiry-references', false)
  on conflict (id) do nothing;
-- Public bucket: files are served at /storage/v1/object/public/portfolio/… without a policy.
