-- Homeowner accounts: homeowners can create an account, sign in, and track the
-- projects they submitted. Projects (leads) carry no user_id, so a homeowner's
-- projects are matched by email against the signed-in user's email.
--
-- This migration:
--   1. allows 'homeowner' as a profile role,
--   2. records the homeowner role at signup from auth metadata (account_type),
--   3. lets homeowners read and update their own projects, see the assignment
--      row for them, and see the contractor matched to them, and
--   4. stops homeowners changing protected lead fields (status, assignment,
--      money, consent records) through the row-wide update policy.

-- 1. Profile roles: add 'homeowner'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('contractor', 'admin', 'homeowner'));

-- 2. Signup trigger: contractor behaviour unchanged from the legacy bridge;
-- signups carrying account_type = 'homeowner' get the homeowner role instead
-- of the default contractor role. Homeowner signups carry no company_name, so
-- no contractor row is created for them (as before).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contractor_id uuid;
  v_legacy_client boolean := not (
    new.raw_user_meta_data ? 'compliance_attested'
    or new.raw_user_meta_data ? 'terms_version'
  );
  v_current_attestation boolean := (
    new.raw_user_meta_data->>'compliance_attested' = 'true'
    and new.raw_user_meta_data->>'terms_version' = '2026-09-09-us-1'
  );
  v_is_homeowner boolean := (new.raw_user_meta_data->>'account_type' = 'homeowner');
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when v_is_homeowner then 'homeowner' else 'contractor' end
  )
  on conflict (id) do nothing;

  if nullif(trim(new.raw_user_meta_data->>'company_name'), '') is not null then
    if not v_legacy_client and not v_current_attestation then
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
      case when v_current_attestation then now() else null end,
      case when v_current_attestation then '2026-09-09-us-1' else null end,
      case when v_current_attestation then now() else null end
    )
    on conflict (user_id) do update set
      company_name = excluded.company_name,
      contact_name = excluded.contact_name,
      phone = excluded.phone,
      city = excluded.city,
      license_number = coalesce(excluded.license_number, public.contractors.license_number),
      compliance_attested_at = coalesce(
        excluded.compliance_attested_at,
        public.contractors.compliance_attested_at
      ),
      terms_version = coalesce(excluded.terms_version, public.contractors.terms_version),
      terms_accepted_at = coalesce(
        excluded.terms_accepted_at,
        public.contractors.terms_accepted_at
      ),
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

-- 3. Homeowner read/update access to their own projects (email-matched).
create policy leads_homeowner_read_own
on public.leads
for select
to authenticated
using (lower(email) = lower((select auth.jwt() ->> 'email')));

create policy leads_homeowner_update_own
on public.leads
for update
to authenticated
using (lower(email) = lower((select auth.jwt() ->> 'email')))
with check (lower(email) = lower((select auth.jwt() ->> 'email')));

-- Homeowners can see the assignment row for their own projects, so the app can
-- show which contractor was matched.
create policy assignments_homeowner_read_own
on public.lead_assignments
for select
to authenticated
using (exists (
  select 1 from public.leads l
  where l.id = lead_assignments.lead_id
    and lower(l.email) = lower((select auth.jwt() ->> 'email'))
));

-- Homeowners can see the contractor matched to their own project (company name
-- and contact details) and nothing else from the contractors table.
create policy contractors_homeowner_read_matched
on public.contractors
for select
to authenticated
using (exists (
  select 1
  from public.lead_assignments la
  join public.leads l on l.id = la.lead_id
  where la.contractor_id = contractors.id
    and lower(l.email) = lower((select auth.jwt() ->> 'email'))
));

create index if not exists idx_leads_email_lower on public.leads (lower(email));

-- Keep the self-insert profile policy consistent with the new role. (The
-- signup trigger runs as security definer and bypasses RLS; this only matters
-- if a client ever inserts a profile row directly.)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role in ('contractor', 'homeowner'));

-- 4. Guard: a homeowner may only change their own project details. Protected
-- columns (status, appointment, money, notes, email, consent records) can only
-- move through the contractor/admin paths. Contractors, admins, and
-- service-role callers are unaffected.
create or replace function public.prevent_homeowner_protected_lead_changes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = (select auth.uid());

  if v_role = 'homeowner' and (
    new.status is distinct from old.status
    or new.appointment_at is distinct from old.appointment_at
    or new.job_value is distinct from old.job_value
    or new.notes is distinct from old.notes
    or new.email is distinct from old.email
    or new.is_homeowner is distinct from old.is_homeowner
    or new.is_decision_maker is distinct from old.is_decision_maker
    or new.is_adult is distinct from old.is_adult
    or new.contact_consent is distinct from old.contact_consent
    or new.marketing_consent is distinct from old.marketing_consent
    or new.consent_version is distinct from old.consent_version
    or new.consent_recorded_at is distinct from old.consent_recorded_at
  ) then
    raise exception 'homeowners can only update their project details';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_homeowner_protected_lead_changes()
from public, anon, authenticated;

drop trigger if exists prevent_homeowner_protected_lead_changes on public.leads;
create trigger prevent_homeowner_protected_lead_changes
before update on public.leads
for each row execute function public.prevent_homeowner_protected_lead_changes();
