-- ════════════════════════════════════════════════════════════════
-- LOASH — admin dashboard support
-- Run AFTER 0001_init.sql (and before deploying the admin code).
-- ════════════════════════════════════════════════════════════════

-- Editable site text: profile, styles, socials, FAQ, portrait
alter table artist_profile
  add column if not exists name            text default 'Loash',
  add column if not exists handle          text default '@loash',
  add column if not exists tagline         text default 'Tattoo artist',
  add column if not exists home_city       text default 'Windsor, Ontario',
  add column if not exists styles          text[] default array['black-grey','blackwork','gothic','american-traditional'],
  add column if not exists not_offered     text[] default array['Realism'],
  add column if not exists by_appointment  boolean default true,
  add column if not exists socials         jsonb default '[]'::jsonb,   -- [{label, href, handle}]
  add column if not exists faq             jsonb default '[]'::jsonb,   -- [{q, a}]
  add column if not exists portrait_path   text,                        -- storage key in 'portfolio' (renditions -480/-828/-1170.webp)
  add column if not exists portrait_width  int,
  add column if not exists portrait_height int;

insert into artist_profile (id) values (1) on conflict (id) do nothing;

-- Inquiry pipeline housekeeping
alter table inquiries add column if not exists updated_at timestamptz not null default now();

-- Keep updated_at honest
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists tattoos_touch on tattoos;
create trigger tattoos_touch before update on tattoos for each row execute function touch_updated_at();
drop trigger if exists inquiries_touch on inquiries;
create trigger inquiries_touch before update on inquiries for each row execute function touch_updated_at();
drop trigger if exists profile_touch on artist_profile;
create trigger profile_touch before update on artist_profile for each row execute function touch_updated_at();

-- ── Make yourself an admin ───────────────────────────────────────
-- 1. Supabase → Authentication → Users → "Add user" (email + password, auto-confirm)
-- 2. Run (with your email):
--    insert into admins (user_id) select id from auth.users where email = 'you@example.com';
-- (Or set ADMIN_EMAILS in Vercel — any listed email that can sign in is an admin.)
