-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp default now()
);

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  hero_title text,
  hero_subtitle text,
  pickup_message text,
  description text,
  logo_url text,
  hero_url text,
  published boolean default false,
  published_at timestamp,
  created_at timestamp default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamp default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric,
  image_url text,
  available boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);

alter table profiles enable row level security;
alter table restaurants enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;

drop policy if exists "profiles_owner_all" on profiles;
create policy "profiles_owner_all" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "restaurants_owner_all" on restaurants;
create policy "restaurants_owner_all" on restaurants
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "categories_owner_all" on categories;
create policy "categories_owner_all" on categories
for all using (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
) with check (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
);

drop policy if exists "menu_items_owner_all" on menu_items;
create policy "menu_items_owner_all" on menu_items
for all using (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
) with check (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
);

drop policy if exists "restaurants_public_published" on restaurants;
create policy "restaurants_public_published" on restaurants
for select using (published = true);

drop policy if exists "categories_public_for_published" on categories;
create policy "categories_public_for_published" on categories
for select using (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.published = true)
);

drop policy if exists "menu_items_public_for_published" on menu_items;
create policy "menu_items_public_for_published" on menu_items
for select using (
  exists(select 1 from restaurants r where r.id = restaurant_id and r.published = true)
);

-- Storage buckets to create manually in Supabase dashboard:
-- heroes
-- logos
-- menu-images
