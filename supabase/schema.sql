create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  conversation_hash text not null unique,
  name text,
  email text,
  summary text not null default '',
  business_type text not null,
  budget_range text not null,
  timeline_range text not null,
  current_status text not null,
  project_scope text,
  requirements_clarity text not null,
  has_existing_business boolean,
  score numeric(3, 1) not null,
  lead_type text not null,
  recommendation text not null,
  reasoning jsonb not null default '[]'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  ready_for_handoff boolean not null default false,
  conversation_complete boolean not null default false,
  transcript jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.leads add column if not exists conversation_id text;
alter table public.leads add column if not exists name text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists summary text not null default '';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_conversation_id_idx on public.leads (conversation_id);
create index if not exists leads_lead_type_idx on public.leads (lead_type);
create index if not exists leads_ready_for_handoff_idx on public.leads (ready_for_handoff);

alter table public.leads enable row level security;
