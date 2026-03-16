alter table public.roblox_pages
  add column if not exists answer_block text,
  add column if not exists language_code text not null default 'en',
  add column if not exists device_compatibility text[] not null default array['mobile','pc','xbox'],
  add column if not exists previous_active_players integer not null default 0,
  add column if not exists active_players_change_24h integer not null default 0,
  add column if not exists trend_spike_score numeric(10,4) not null default 0,
  add column if not exists trend_spike_label text,
  add column if not exists last_data_refresh timestamptz,
  add column if not exists verified_by_community boolean not null default false,
  add column if not exists community_verification_count integer not null default 0,
  add column if not exists community_verified_at timestamptz;

create index if not exists idx_roblox_pages_verified_spike_players
  on public.roblox_pages (verified_by_community desc, trend_spike_score desc, active_players desc);

create index if not exists idx_roblox_pages_language
  on public.roblox_pages (language_code);

create table if not exists public.beta_tester_signups (
  id bigint generated always as identity primary key,
  page_id bigint not null references public.roblox_pages(id) on delete cascade,
  email text not null,
  country_code text,
  created_at timestamptz not null default now()
);

create index if not exists idx_beta_tester_signups_page_id
  on public.beta_tester_signups (page_id, created_at desc);

create table if not exists public.community_verifications (
  id bigint generated always as identity primary key,
  page_id bigint not null references public.roblox_pages(id) on delete cascade,
  fingerprint text not null,
  is_helpful boolean not null default true,
  created_at timestamptz not null default now(),
  unique (page_id, fingerprint)
);

create index if not exists idx_community_verifications_page_id
  on public.community_verifications (page_id, created_at desc);

alter table public.beta_tester_signups enable row level security;
alter table public.community_verifications enable row level security;
