create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  contact_number text check (contact_number is null or char_length(contact_number) between 7 and 24),
  email text not null check (char_length(email) between 3 and 254),
  city text not null check (char_length(city) between 2 and 80),
  created_at timestamptz not null default now()
);

alter table public.join_requests enable row level security;

revoke all on table public.join_requests from anon, authenticated;
grant insert on table public.join_requests to anon, authenticated;

drop policy if exists "Public can submit join requests" on public.join_requests;
create policy "Public can submit join requests"
on public.join_requests
for insert
to anon, authenticated
with check (
  char_length(name) between 2 and 80
  and char_length(email) between 3 and 254
  and char_length(city) between 2 and 80
  and (contact_number is null or char_length(contact_number) between 7 and 24)
);

create index if not exists join_requests_created_at_idx
on public.join_requests (created_at desc);

comment on table public.join_requests is
'Early-access requests submitted through the Hydroid website.';
