create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'contractor' check (role in ('contractor', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  city text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contractor_services (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  service_type text not null,
  unique (contractor_id, service_type)
);

create table if not exists public.contractor_territories (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  zip text not null,
  unique (contractor_id, zip)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  zip text not null,
  service_type text not null,
  project_details text not null,
  timeline text,
  budget text,
  is_homeowner boolean not null default true,
  is_decision_maker boolean not null default true,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'appointment', 'won', 'lost')),
  appointment_at timestamptz,
  job_value numeric,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (lead_id, contractor_id)
);

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_contractor_id uuid not null references public.contractors(id) on delete cascade,
  referred_email text,
  referred_contractor_id uuid references public.contractors(id) on delete set null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'void')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_payment_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_zip_service on public.leads (zip, service_type);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists idx_assignments_contractor on public.lead_assignments (contractor_id);
create index if not exists idx_assignments_lead on public.lead_assignments (lead_id);
create index if not exists lead_assignments_contractor_idx on public.lead_assignments (contractor_id, assigned_at desc);
create index if not exists idx_services_contractor on public.contractor_services (contractor_id);
create index if not exists idx_territories_contractor on public.contractor_territories (contractor_id);
create index if not exists idx_lead_status_history_lead_id on public.lead_status_history (lead_id);
create index if not exists idx_lead_status_history_changed_by on public.lead_status_history (changed_by);

alter table public.profiles enable row level security;
alter table public.contractors enable row level security;
alter table public.contractor_services enable row level security;
alter table public.contractor_territories enable row level security;
alter table public.leads enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.payments enable row level security;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on schema private from public;
revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_role_escalation()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.role is distinct from old.role and not private.is_admin() then
    raise exception 'profile role cannot be changed by this user';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_profile_role_escalation() from public, anon, authenticated;
drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

create or replace function public.assign_new_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.lead_assignments (lead_id, contractor_id)
  select new.id, c.id
  from public.contractors c
  where c.active = true
    and exists (select 1 from public.contractor_services cs where cs.contractor_id = c.id and cs.service_type = new.service_type)
    and exists (select 1 from public.contractor_territories ct where ct.contractor_id = c.id and ct.zip = new.zip)
  order by c.created_at asc
  limit 1
  on conflict do nothing;
  return new;
end;
$$;

revoke execute on function public.assign_new_lead() from public, anon, authenticated;
drop trigger if exists trg_assign_new_lead on public.leads;
create trigger trg_assign_new_lead after insert on public.leads
for each row execute function public.assign_new_lead();

create policy profiles_select_self on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_insert_self on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'contractor');
create policy profiles_update_self on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_admin_all on public.profiles for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy contractors_self on public.contractors for all to authenticated
using ((user_id = (select auth.uid())) or (select private.is_admin()))
with check ((user_id = (select auth.uid())) or (select private.is_admin()));
create policy services_self on public.contractor_services for all to authenticated
using ((contractor_id in (select id from public.contractors where user_id = (select auth.uid()))) or (select private.is_admin()))
with check ((contractor_id in (select id from public.contractors where user_id = (select auth.uid()))) or (select private.is_admin()));
create policy territories_self on public.contractor_territories for all to authenticated
using ((contractor_id in (select id from public.contractors where user_id = (select auth.uid()))) or (select private.is_admin()))
with check ((contractor_id in (select id from public.contractors where user_id = (select auth.uid()))) or (select private.is_admin()));

create policy leads_insert_public on public.leads for insert to anon, authenticated
with check (status = 'new' and appointment_at is null and job_value is null and notes = '[]'::jsonb);
revoke insert on public.leads from anon, authenticated;
grant insert (name, phone, email, zip, service_type, project_details, timeline, budget, is_homeowner, is_decision_maker)
on public.leads to anon, authenticated;
create policy leads_admin on public.leads for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy leads_contractor_read_assigned on public.leads for select to authenticated
using (exists (
  select 1 from public.lead_assignments la join public.contractors c on c.id = la.contractor_id
  where la.lead_id = leads.id and c.user_id = (select auth.uid())
) or (select private.is_admin()));
create policy leads_contractor_update_assigned on public.leads for update to authenticated
using (exists (
  select 1 from public.lead_assignments la join public.contractors c on c.id = la.contractor_id
  where la.lead_id = leads.id and c.user_id = (select auth.uid())
) or (select private.is_admin()))
with check (exists (
  select 1 from public.lead_assignments la join public.contractors c on c.id = la.contractor_id
  where la.lead_id = leads.id and c.user_id = (select auth.uid())
) or (select private.is_admin()));

create policy assignments_contractor_read on public.lead_assignments for select to authenticated
using ((contractor_id in (select id from public.contractors where user_id = (select auth.uid()))) or (select private.is_admin()));
create policy assignments_admin_write on public.lead_assignments for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy history_contractor_read on public.lead_status_history for select to authenticated
using ((lead_id in (
  select la.lead_id from public.lead_assignments la
  join public.contractors c on c.id = la.contractor_id
  where c.user_id = (select auth.uid())
)) or (select private.is_admin()));
create policy lead_status_history_contractor_insert on public.lead_status_history for insert to authenticated
with check ((changed_by = (select auth.uid()) and exists (
  select 1 from public.lead_assignments la join public.contractors c on c.id = la.contractor_id
  where la.lead_id = lead_status_history.lead_id and c.user_id = (select auth.uid())
)) or (select private.is_admin()));

create policy referrals_self on public.referrals for all to authenticated
using (referrer_contractor_id in (select id from public.contractors where user_id = (select auth.uid())) or (select private.is_admin()))
with check (referrer_contractor_id in (select id from public.contractors where user_id = (select auth.uid())) or (select private.is_admin()));
create policy rewards_self on public.referral_rewards for select to authenticated
using (referral_id in (
  select r.id from public.referrals r join public.contractors c on c.id = r.referrer_contractor_id
  where c.user_id = (select auth.uid())
) or (select private.is_admin()));
create policy payments_self on public.payments for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

