-- Nationwide privacy operations with Kentucky's active KCDPA response and
-- appeal timelines used as the operational baseline for every consumer.

alter table public.leads
  add column if not exists is_adult boolean not null default false;

comment on column public.leads.is_adult is
  'Submitter affirmed they are at least 18 years old at intake.';

alter table public.privacy_requests
  drop constraint if exists privacy_requests_request_type_check;

alter table public.privacy_requests
  add constraint privacy_requests_request_type_check check (
    request_type in (
      'access',
      'correct',
      'delete',
      'portable_copy',
      'marketing_opt_out',
      'sale_opt_out',
      'targeted_advertising_opt_out',
      'profiling_opt_out',
      'appeal',
      'other'
    )
  ),
  add column if not exists due_at timestamptz not null default (now() + interval '45 days'),
  add column if not exists resolved_at timestamptz,
  add column if not exists decision_reason text check (
    decision_reason is null or char_length(decision_reason) <= 1000
  );

alter table public.privacy_requests
  add constraint privacy_requests_denial_reason_check check (
    status <> 'denied' or nullif(trim(decision_reason), '') is not null
  );

create or replace function private.set_privacy_request_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status in ('completed', 'denied') and old.status is distinct from new.status then
    new.resolved_at = now();
  elsif new.status in ('pending', 'verifying') then
    new.resolved_at = null;
  end if;
  return new;
end;
$$;

revoke all on function private.set_privacy_request_updated_at() from public, anon, authenticated;

create table if not exists public.privacy_suppressions (
  email text not null check (email = lower(email) and char_length(email) between 3 and 255),
  suppression_type text not null check (
    suppression_type in ('marketing', 'sale', 'targeted_advertising', 'profiling')
  ),
  source_request_id uuid references public.privacy_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (email, suppression_type)
);

alter table public.privacy_suppressions enable row level security;
revoke all on public.privacy_suppressions from public, anon, authenticated;
grant select on public.privacy_suppressions to authenticated;

create policy privacy_suppressions_admin_select
on public.privacy_suppressions
for select
to authenticated
using ((select private.is_admin()));

comment on table public.privacy_suppressions is
  'Durable do-not-process records used to honor consumer opt-outs across future marketing systems.';

alter table public.contractors
  add column if not exists license_number text check (
    license_number is null or char_length(license_number) <= 100
  ),
  add column if not exists compliance_attested_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz;

comment on column public.contractors.license_number is
  'Optional state or local trade license/registration identifier supplied by the contractor.';
comment on column public.contractors.compliance_attested_at is
  'Contractor affirmed responsibility for licenses, permits, insurance, and lawful customer contact.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contractor_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  if nullif(trim(new.raw_user_meta_data->>'company_name'), '') is not null then
    if new.raw_user_meta_data->>'compliance_attested' <> 'true'
      or new.raw_user_meta_data->>'terms_version' <> '2026-09-09-us-1' then
      raise exception 'contractor terms and compliance confirmation are required';
    end if;

    insert into public.contractors (
      user_id,
      company_name,
      contact_name,
      email,
      phone,
      city,
      license_number,
      compliance_attested_at,
      terms_version,
      terms_accepted_at
    ) values (
      new.id,
      left(trim(new.raw_user_meta_data->>'company_name'), 120),
      left(coalesce(nullif(trim(new.raw_user_meta_data->>'contact_name'), ''), new.email), 100),
      new.email,
      left(nullif(trim(new.raw_user_meta_data->>'phone'), ''), 20),
      left(nullif(trim(new.raw_user_meta_data->>'city'), ''), 100),
      left(nullif(trim(new.raw_user_meta_data->>'license_number'), ''), 100),
      now(),
      '2026-09-09-us-1',
      now()
    )
    on conflict (user_id) do update set
      company_name = excluded.company_name,
      contact_name = excluded.contact_name,
      phone = excluded.phone,
      city = excluded.city,
      license_number = excluded.license_number,
      compliance_attested_at = excluded.compliance_attested_at,
      terms_version = excluded.terms_version,
      terms_accepted_at = excluded.terms_accepted_at,
      updated_at = now()
    returning id into v_contractor_id;

    insert into public.contractor_services (contractor_id, service_type)
    select v_contractor_id, s.service_type
    from jsonb_array_elements_text(
      coalesce(new.raw_user_meta_data->'service_types', '[]'::jsonb)
    ) as s(service_type)
    where s.service_type in (
      'Roofing',
      'HVAC',
      'Plumbing',
      'Electrical',
      'Kitchen Remodel',
      'Bathroom Remodel',
      'Windows & Doors',
      'Solar'
    )
    on conflict (contractor_id, service_type) do nothing;

    insert into public.contractor_territories (contractor_id, zip)
    select v_contractor_id, z.zip_code
    from jsonb_array_elements_text(
      coalesce(new.raw_user_meta_data->'territory_zips', '[]'::jsonb)
    ) as z(zip_code)
    where z.zip_code ~ '^[0-9]{5}$'
    on conflict (contractor_id, zip) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
