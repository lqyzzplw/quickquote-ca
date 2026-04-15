-- Migration: 001_initial_schema
-- Applied: 2026-04-14

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  business_name text,
  logo_url text,
  province text check (province in ('ON','BC','AB','QC','MB','SK','NB','NS','NL','PEI','NT','NU','YT')),
  plan text not null default 'free' check (plan in ('free','pro')),
  quotes_sent_this_month int not null default 0,
  billing_cycle_start date,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CLIENTS
-- ============================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Users can manage own clients" on public.clients for all using (auth.uid() = user_id);
create index clients_user_id_idx on public.clients(user_id);

-- ============================================================
-- QUOTES
-- ============================================================
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  quote_number text not null,
  title text not null,
  description_raw text,
  status text not null default 'draft' check (status in ('draft','sent','accepted','declined')),
  subtotal numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  tax_type text check (tax_type in ('HST','GST','GST+PST','GST+QST')),
  tax_rate numeric(5,4),
  pdf_url text,
  expires_at date,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;
create policy "Users can manage own quotes" on public.quotes for all using (auth.uid() = user_id);
create index quotes_user_id_idx on public.quotes(user_id);
create index quotes_status_idx on public.quotes(status);
create sequence if not exists public.quote_number_seq start 1;

-- ============================================================
-- QUOTE LINE ITEMS
-- ============================================================
create table public.quote_line_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  line_total numeric(10,2) generated always as (quantity * unit_price) stored,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quote_line_items enable row level security;
create policy "Users can manage own quote line items" on public.quote_line_items for all
  using (auth.uid() = (select user_id from public.quotes where id = quote_id));
create index quote_line_items_quote_id_idx on public.quote_line_items(quote_id);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger set_quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();
