-- Taskiflo MVP schema for Supabase Postgres.
-- This project already has a public.profiles table, so this schema leaves it untouched.
-- All new customer tables use RLS.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Business',
  website_url text,
  operating_location text,
  marketing_regions text,
  target_audience text,
  main_offer text,
  brand_voice text,
  content_rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_analyses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  website_url text not null,
  status text not null default 'completed' check (status in ('queued', 'running', 'completed', 'failed')),
  brand_tone jsonb not null default '[]'::jsonb,
  products_detected jsonb not null default '[]'::jsonb,
  customer_intent jsonb not null default '[]'::jsonb,
  raw_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider text not null check (provider in ('gmail', 'google_sheets', 'instagram', 'facebook_meta', 'tiktok', 'shopify')),
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  external_account_name text,
  token_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, provider)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  shopify_product_id text,
  title text not null,
  description text,
  product_url text,
  image_url text,
  price numeric(12, 2),
  currency text default 'USD',
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  last_posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  source text not null default 'ai' check (source in ('ai', 'manual', 'shopify_trigger', 'gmail')),
  content_type text not null check (content_type in ('social_post', 'email_reply')),
  platform text not null check (platform in ('gmail', 'instagram', 'facebook', 'tiktok')),
  title text not null,
  body text not null,
  hashtags text[] not null default '{}',
  cta text,
  status text not null default 'needs_approval' check (status in ('draft', 'needs_approval', 'approved', 'scheduled', 'posted', 'sent', 'failed')),
  scheduled_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  automation_type text not null check (automation_type in ('new_shopify_product', 'daily_product_rotation', 'gmail_reply_draft')),
  enabled boolean not null default true,
  approval_required boolean not null default true,
  schedule jsonb not null default '{}'::jsonb,
  platforms text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.website_analyses enable row level security;
alter table public.integrations enable row level security;
alter table public.products enable row level security;
alter table public.content_drafts enable row level security;
alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.audit_events enable row level security;

create policy "Users manage own businesses"
  on public.businesses
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users manage website analyses for owned businesses"
  on public.website_analyses
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "Users manage integrations for owned businesses"
  on public.integrations
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "Users manage products for owned businesses"
  on public.products
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "Users manage drafts for owned businesses"
  on public.content_drafts
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "Users manage automations for owned businesses"
  on public.automations
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "Users read runs for owned automations"
  on public.automation_runs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.automations a
      join public.businesses b on b.id = a.business_id
      where a.id = automation_id and b.owner_id = auth.uid()
    )
  );

create policy "Users read audit events for owned businesses"
  on public.audit_events
  for select
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.website_analyses to authenticated;
grant select, insert, update, delete on public.integrations to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.content_drafts to authenticated;
grant select, insert, update, delete on public.automations to authenticated;
grant select on public.automation_runs to authenticated;
grant select on public.audit_events to authenticated;
