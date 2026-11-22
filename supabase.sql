-- AR Invites: database setup for Supabase (free plan is enough).
-- Paste this whole file into Supabase → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  code        text unique not null default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  owner         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token         text unique not null default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  name          text not null check (char_length(name) between 1 and 80),
  phone         text,
  seats         int  not null default 2 check (seats between 1 and 20),
  opened_at     timestamptz,
  rsvp          text check (rsvp in ('yes','no')),
  rsvp_count    int,
  rsvp_message  text,
  rsvp_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists guests_invitation_idx on public.guests(invitation_id);

-- Only the signed-in admin who created a row can see or change it.
alter table public.invitations enable row level security;
alter table public.guests      enable row level security;

drop policy if exists "owner manages invitations" on public.invitations;
create policy "owner manages invitations" on public.invitations
  for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "owner manages guests" on public.guests;
create policy "owner manages guests" on public.guests
  for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

-- Guests never read the tables directly. They use these three functions with their link token.

-- 1. Read one invitation by a guest token (personal link) or invitation code (general link)
create or replace function public.get_invite(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(
    (select jsonb_build_object(
        'inv',   i.data,
        'guest', jsonb_build_object('name', g.name, 'seats', g.seats, 'rsvp', g.rsvp, 'rsvp_count', g.rsvp_count))
       from public.guests g join public.invitations i on i.id = g.invitation_id
      where g.token = p_token),
    (select jsonb_build_object('inv', i.data, 'guest', null)
       from public.invitations i where i.code = p_token)
  );
$$;

-- 2. Mark a personal link as opened
create or replace function public.mark_opened(p_token text)
returns void language sql security definer set search_path = public as $$
  update public.guests set opened_at = coalesce(opened_at, now()) where token = p_token;
$$;

-- 3. Save a reply. Personal link: updates that guest. General link: adds a new guest row.
create or replace function public.submit_rsvp(p_token text, p_name text, p_rsvp text, p_count int, p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare
  g public.guests;
  i public.invitations;
  n int := least(greatest(coalesce(p_count, 1), 0), 20);
begin
  if p_rsvp not in ('yes', 'no') then raise exception 'invalid reply'; end if;
  select * into g from public.guests where token = p_token;
  if found then
    update public.guests
       set rsvp = p_rsvp, rsvp_count = least(n, g.seats), rsvp_message = left(p_message, 500), rsvp_at = now(),
           opened_at = coalesce(opened_at, now())
     where id = g.id;
    return;
  end if;
  select * into i from public.invitations where code = p_token;
  if not found then raise exception 'invalid link'; end if;
  insert into public.guests (invitation_id, owner, name, seats, rsvp, rsvp_count, rsvp_message, rsvp_at, opened_at)
  values (i.id, i.owner, left(coalesce(nullif(trim(p_name), ''), 'Guest'), 80), greatest(n, 1), p_rsvp, n, left(p_message, 500), now(), now());
end;
$$;

revoke all on function public.get_invite(text)  from public;
revoke all on function public.mark_opened(text) from public;
revoke all on function public.submit_rsvp(text, text, text, int, text) from public;
grant execute on function public.get_invite(text)  to anon, authenticated;
grant execute on function public.mark_opened(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, int, text) to anon, authenticated;

-- Storage for custom couple art (public images, only signed-in admins can upload)
insert into storage.buckets (id, name, public) values ('art', 'art', true) on conflict (id) do nothing;
drop policy if exists "admins upload art" on storage.objects;
create policy "admins upload art" on storage.objects for insert to authenticated with check (bucket_id = 'art');
drop policy if exists "admins manage own art" on storage.objects;
create policy "admins manage own art" on storage.objects for delete to authenticated using (bucket_id = 'art' and owner = auth.uid());
