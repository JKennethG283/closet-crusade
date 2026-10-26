-- Closet Crusade database setup.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent.

------------------------------------------------------------------------------
-- Admin allow-list (kept in a private schema the public API can't reach)
------------------------------------------------------------------------------
create schema if not exists private;

create table if not exists private.admins (
  email text primary key check (email = lower(email))
);

insert into private.admins (email) values
  ('ravenashley.blackbird@gmail.com'),
  ('jonathan.kenneth.gunawan@gmail.com')
on conflict do nothing;

-- True when the signed-in user's email is on the allow-list.
-- security definer so it can read private.admins; it only ever answers for the caller.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

------------------------------------------------------------------------------
-- Items and their photos
------------------------------------------------------------------------------
do $$ begin
  create type public.item_status as enum ('available', 'reserved', 'sold');
exception when duplicate_object then null;
end $$;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (length(name) between 1 and 120),
  brand text not null default '',
  size text not null default '',
  condition text not null default '',
  description text not null default '',
  price_sgd numeric(10, 2) not null check (price_sgd >= 0),
  status public.item_status not null default 'available',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists item_images_item_id_position_idx
  on public.item_images (item_id, position);

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function private.set_updated_at();

------------------------------------------------------------------------------
-- Data API access + Row Level Security
-- Everyone can read published items; only allow-listed admins can change anything.
------------------------------------------------------------------------------
alter table public.items enable row level security;
alter table public.item_images enable row level security;

grant select on public.items, public.item_images to anon, authenticated;
grant insert, update, delete on public.items, public.item_images to authenticated;

drop policy if exists "Published items are public" on public.items;
create policy "Published items are public" on public.items
  for select to anon, authenticated
  using (is_published);

drop policy if exists "Admins read all items" on public.items;
create policy "Admins read all items" on public.items
  for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins insert items" on public.items;
create policy "Admins insert items" on public.items
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update items" on public.items;
create policy "Admins update items" on public.items
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins delete items" on public.items;
create policy "Admins delete items" on public.items
  for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "Photos of published items are public" on public.item_images;
create policy "Photos of published items are public" on public.item_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.items i where i.id = item_id and i.is_published
  ));

drop policy if exists "Admins read all photos" on public.item_images;
create policy "Admins read all photos" on public.item_images
  for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins insert photos" on public.item_images;
create policy "Admins insert photos" on public.item_images
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update photos" on public.item_images;
create policy "Admins update photos" on public.item_images
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins delete photos" on public.item_images;
create policy "Admins delete photos" on public.item_images
  for delete to authenticated
  using ((select private.is_admin()));

------------------------------------------------------------------------------
-- Photo storage: public to view, only admins can upload / replace / delete
------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read item photos" on storage.objects;
create policy "Admins read item photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'item-images' and (select private.is_admin()));

drop policy if exists "Admins upload item photos" on storage.objects;
create policy "Admins upload item photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'item-images' and (select private.is_admin()));

drop policy if exists "Admins update item photos" on storage.objects;
create policy "Admins update item photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'item-images' and (select private.is_admin()))
  with check (bucket_id = 'item-images' and (select private.is_admin()));

drop policy if exists "Admins delete item photos" on storage.objects;
create policy "Admins delete item photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'item-images' and (select private.is_admin()));
