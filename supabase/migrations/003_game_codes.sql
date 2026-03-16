-- ─── game_codes ───────────────────────────────────────────────────────────────
-- Stores promotional / unlock codes for each Roblox game page.
-- Populated manually or via future admin tooling.

create table if not exists public.game_codes (
  id          bigint generated always as identity primary key,
  page_id     bigint not null references public.roblox_pages(id) on delete cascade,
  code_text   text not null,
  description text,
  is_active   boolean not null default true,
  added_at    timestamptz not null default now()
);

create index if not exists idx_game_codes_page_id
  on public.game_codes (page_id, is_active, added_at desc);

-- ─── code_votes ───────────────────────────────────────────────────────────────
-- One vote per device fingerprint per code.
-- Upsert on (code_id, fingerprint) allows vote changes; only the latest vote counts.
-- reported = true flags the vote for moderation review (E-E-A-T misuse reporting).

create table if not exists public.code_votes (
  id          bigint generated always as identity primary key,
  code_id     bigint not null references public.game_codes(id) on delete cascade,
  is_working  boolean not null,
  fingerprint text not null,
  reported    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (code_id, fingerprint)
);

create index if not exists idx_code_votes_code_id_created
  on public.code_votes (code_id, created_at desc);

-- ─── PostgreSQL function: code_success_rate ───────────────────────────────────
-- Returns the success percentage (0–100) for a code based on votes in the last
-- 24 hours.  Returns NULL when there are no recent votes.
-- Use: SELECT code_success_rate(42);

create or replace function public.code_success_rate(p_code_id bigint)
returns numeric
language sql
stable
as $$
  select
    case
      when count(*) = 0 then null
      else round(
        100.0 * count(*) filter (where is_working) / count(*),
        0
      )
    end
  from public.code_votes
  where code_id    = p_code_id
    and created_at > now() - interval '24 hours';
$$;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.game_codes  enable row level security;
alter table public.code_votes  enable row level security;

-- Public (anon) can read active codes — needed for server-side page rendering.
create policy "public_read_active_codes"
  on public.game_codes for select
  using (is_active = true);

-- Service role manages all writes and reads aggregates.
-- (All API routes use the service role client — no additional policy needed.)
