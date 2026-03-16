-- Core public pages table
create table if not exists public.roblox_pages (
  id bigint primary key,
  name text not null,
  slug text unique not null,
  active_players integer not null default 0,
  genre text,
  icon_url text,
  useful_summary text,
  detailed_guide text,
  faq_data jsonb not null default '[]'::jsonb,
  last_indexed_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_roblox_pages_slug on public.roblox_pages (slug);
create index if not exists idx_roblox_pages_active_players on public.roblox_pages (active_players desc);
create index if not exists idx_roblox_pages_published_name on public.roblox_pages (is_published, name);

-- Profiles synced to auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stripe subscription state
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_id text,
  price_id text,
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);

-- Saved games for logged-in users
create table if not exists public.saved_games (
  user_id uuid not null references public.profiles(id) on delete cascade,
  page_id bigint not null references public.roblox_pages(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, page_id)
);

create index if not exists idx_saved_games_user_id on public.saved_games (user_id);
create index if not exists idx_saved_games_page_id on public.saved_games (page_id);

-- Profile bootstrap
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute procedure public.touch_updated_at();

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute procedure public.touch_updated_at();

alter table public.roblox_pages enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saved_games enable row level security;

-- Public can read only published pages
drop policy if exists "public read published pages" on public.roblox_pages;
create policy "public read published pages"
on public.roblox_pages
for select
using (is_published = true);

-- Users can read and update their own profile
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
using (auth.uid() = id);

-- Users can read their own subscriptions
drop policy if exists "users read own subscriptions" on public.subscriptions;
create policy "users read own subscriptions"
on public.subscriptions
for select
using (auth.uid() = user_id);

-- Users can manage their own saved games
drop policy if exists "users read own saved games" on public.saved_games;
create policy "users read own saved games"
on public.saved_games
for select
using (auth.uid() = user_id);

drop policy if exists "users insert own saved games" on public.saved_games;
create policy "users insert own saved games"
on public.saved_games
for insert
with check (auth.uid() = user_id);

drop policy if exists "users delete own saved games" on public.saved_games;
create policy "users delete own saved games"
on public.saved_games
for delete
using (auth.uid() = user_id);
