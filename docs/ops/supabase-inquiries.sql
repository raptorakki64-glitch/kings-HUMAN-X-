-- Silent Precision: inquiries table (Phase 1 lead capture)
-- Paste into Supabase SQL Editor and run once.
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  interest text not null,
  message text not null,
  referrer text,
  user_agent text,
  ip_hash text not null,
  status text not null default 'new'
);
alter table inquiries enable row level security;
-- Deliberately NO policies: anon/authenticated can do nothing.
-- Only the service-role key (server-side) bypasses RLS.
create index inquiries_ip_hash_created_at on inquiries (ip_hash, created_at);
