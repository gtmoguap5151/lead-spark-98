-- Nationwide ZIP-radius coverage.
-- Contractors choose one base ZIP and a service radius; an authenticated Edge Function
-- expands that radius into materialized ZIP rows for fast lead matching.

alter table public.contractors
  add column if not exists base_zip text,
  add column if not exists service_radius_miles integer,
  add column if not exists territory_synced_at timestamptz;

alter table public.contractors drop constraint if exists contractors_base_zip_format;
alter table public.contractors
  add constraint contractors_base_zip_format
  check (base_zip is null or base_zip ~ '^[0-9]{5}$');

alter table public.contractors drop constraint if exists contractors_service_radius_range;
alter table public.contractors
  add constraint contractors_service_radius_range
  check (service_radius_miles is null or service_radius_miles between 10 and 150);

CREATE OR REPLACE FUNCTION private.pick_contractor_for_lead(p_service_type text, p_zip text)
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select c.id
  from public.contractors c
  where c.active = true
    and exists (
      select 1
      from public.contractor_services cs
      where cs.contractor_id = c.id
        and cs.service_type = p_service_type
    )
    and exists (
      select 1
      from public.contractor_territories ct
      where ct.contractor_id = c.id
        and ct.zip = p_zip
    )
    and (
      exists (
        select 1
        from public.subscriptions s
        where s.user_id = c.user_id
          and s.status in ('active', 'trialing')
      )
      or not exists (
        select 1
        from public.lead_assignments first_la
        where first_la.contractor_id = c.id
      )
    )
  order by
    (
      select count(*)
      from public.lead_assignments recent_la
      where recent_la.contractor_id = c.id
        and recent_la.assigned_at >= now() - interval '30 days'
    ) asc,
    (
      select max(last_la.assigned_at)
      from public.lead_assignments last_la
      where last_la.contractor_id = c.id
    ) asc nulls first,
    c.created_at asc,
    c.id asc
  limit 1;
$function$


revoke all on function private.pick_contractor_for_lead(text, text)
from public, anon, authenticated;
grant execute on function private.pick_contractor_for_lead(text, text) to service_role;

CREATE OR REPLACE FUNCTION public.assign_new_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_contractor_id uuid;
begin
  v_contractor_id := private.pick_contractor_for_lead(new.service_type, new.zip);

  if v_contractor_id is not null then
    insert into public.lead_assignments (lead_id, contractor_id)
    values (new.id, v_contractor_id)
    on conflict (lead_id) do nothing;
  end if;

  return new;
end;
$function$


revoke execute on function public.assign_new_lead() from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.route_unassigned_leads(p_limit integer DEFAULT 250)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_lead record;
  v_contractor_id uuid;
  v_assigned integer := 0;
  v_inserted integer := 0;
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 1000));
begin
  for v_lead in
    select l.id, l.service_type, l.zip
    from public.leads l
    where not exists (
      select 1 from public.lead_assignments la where la.lead_id = l.id
    )
    order by l.created_at asc, l.id asc
    limit v_limit
  loop
    v_contractor_id := private.pick_contractor_for_lead(v_lead.service_type, v_lead.zip);

    if v_contractor_id is not null then
      insert into public.lead_assignments (lead_id, contractor_id)
      values (v_lead.id, v_contractor_id)
      on conflict (lead_id) do nothing;

      get diagnostics v_inserted = row_count;
      v_assigned := v_assigned + v_inserted;
    end if;
  end loop;

  return v_assigned;
end;
$function$


revoke all on function public.route_unassigned_leads(integer)
from public, anon, authenticated;
grant execute on function public.route_unassigned_leads(integer) to service_role;

CREATE OR REPLACE FUNCTION public.sync_contractor_radius_territory(p_user_id uuid, p_base_zip text, p_service_radius_miles integer, p_territory_zips jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_contractor_id uuid;
  v_coverage_count integer := 0;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;

  if p_base_zip is null or p_base_zip !~ '^[0-9]{5}$' then
    raise exception 'base ZIP must be a 5-digit ZIP code';
  end if;

  if p_service_radius_miles is null or p_service_radius_miles not between 10 and 150 then
    raise exception 'service radius must be between 10 and 150 miles';
  end if;

  if p_territory_zips is null
     or jsonb_typeof(p_territory_zips) <> 'array'
     or jsonb_array_length(p_territory_zips) < 1
     or jsonb_array_length(p_territory_zips) > 10000 then
    raise exception 'territory ZIP list is invalid';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(p_territory_zips) as z(zip_code)
    where z.zip_code !~ '^[0-9]{5}$'
  ) then
    raise exception 'territory contains an invalid ZIP code';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements_text(p_territory_zips) as z(zip_code)
    where z.zip_code = p_base_zip
  ) then
    raise exception 'territory must include the base ZIP code';
  end if;

  select c.id into v_contractor_id
  from public.contractors c
  where c.user_id = p_user_id;

  if v_contractor_id is null then
    raise exception 'contractor profile not found';
  end if;

  update public.contractors
  set base_zip = p_base_zip,
      service_radius_miles = p_service_radius_miles,
      territory_synced_at = now(),
      updated_at = now()
  where id = v_contractor_id;

  delete from public.contractor_territories
  where contractor_id = v_contractor_id;

  insert into public.contractor_territories (contractor_id, zip)
  select v_contractor_id, z.zip_code
  from (
    select distinct value as zip_code
    from jsonb_array_elements_text(p_territory_zips)
  ) z
  on conflict (contractor_id, zip) do nothing;

  select count(*) into v_coverage_count
  from public.contractor_territories
  where contractor_id = v_contractor_id;

  perform public.route_unassigned_leads(250);

  return v_coverage_count;
end;
$function$


revoke all on function public.sync_contractor_radius_territory(uuid, text, integer, jsonb)
from public, anon, authenticated;
grant execute on function public.sync_contractor_radius_territory(uuid, text, integer, jsonb)
to service_role;

CREATE OR REPLACE FUNCTION public.apply_contractor_radius_profile(p_user_id uuid, p_company_name text, p_contact_name text, p_phone text, p_city text, p_active boolean, p_service_types jsonb, p_base_zip text, p_service_radius_miles integer, p_territory_zips jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_contractor_id uuid;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;

  if p_service_types is null
     or jsonb_typeof(p_service_types) <> 'array'
     or jsonb_array_length(p_service_types) < 1 then
    raise exception 'select at least one service';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(p_service_types) as s(service_type)
    where s.service_type not in (
      'Roofing', 'HVAC', 'Plumbing', 'Electrical',
      'Kitchen Remodel', 'Bathroom Remodel', 'Windows & Doors', 'Solar'
    )
  ) then
    raise exception 'invalid service type';
  end if;

  select c.id into v_contractor_id
  from public.contractors c
  where c.user_id = p_user_id;

  if v_contractor_id is null then
    raise exception 'contractor profile not found';
  end if;

  update public.contractors
  set company_name = coalesce(nullif(trim(p_company_name), ''), company_name),
      contact_name = coalesce(nullif(trim(p_contact_name), ''), contact_name),
      phone = case when p_phone is null then phone else left(nullif(trim(p_phone), ''), 20) end,
      city = case when p_city is null then city else left(nullif(trim(p_city), ''), 100) end,
      active = coalesce(p_active, active),
      updated_at = now()
  where id = v_contractor_id;

  delete from public.contractor_services
  where contractor_id = v_contractor_id;

  insert into public.contractor_services (contractor_id, service_type)
  select v_contractor_id, s.service_type
  from (
    select distinct value as service_type
    from jsonb_array_elements_text(p_service_types)
  ) s
  on conflict (contractor_id, service_type) do nothing;

  return public.sync_contractor_radius_territory(
    p_user_id,
    p_base_zip,
    p_service_radius_miles,
    p_territory_zips
  );
end;
$function$


revoke all on function public.apply_contractor_radius_profile(
  uuid, text, text, text, text, boolean, jsonb, text, integer, jsonb
) from public, anon, authenticated;
grant execute on function public.apply_contractor_radius_profile(
  uuid, text, text, text, text, boolean, jsonb, text, integer, jsonb
) to service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_base_zip text := nullif(trim(new.raw_user_meta_data->>'base_zip'), '');
  v_radius integer;
begin
  if v_base_zip is not null and v_base_zip !~ '^[0-9]{5}$' then
    v_base_zip := null;
  end if;

  if coalesce(new.raw_user_meta_data->>'service_radius_miles', '') ~ '^[0-9]{1,3}$' then
    v_radius := (new.raw_user_meta_data->>'service_radius_miles')::integer;
  end if;

  if v_radius is not null and v_radius not between 10 and 150 then
    v_radius := null;
  end if;

  if v_base_zip is not null and v_radius is null then
    v_radius := 50;
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
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
      terms_accepted_at,
      base_zip,
      service_radius_miles,
      territory_synced_at
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
      case when v_current_attestation then now() else null end,
      v_base_zip,
      v_radius,
      null
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
      base_zip = coalesce(excluded.base_zip, public.contractors.base_zip),
      service_radius_miles = coalesce(
        excluded.service_radius_miles,
        public.contractors.service_radius_miles
      ),
      territory_synced_at = case
        when excluded.base_zip is not null
          and (
            excluded.base_zip is distinct from public.contractors.base_zip
            or excluded.service_radius_miles is distinct from public.contractors.service_radius_miles
          )
        then null
        else public.contractors.territory_synced_at
      end,
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
    from (
      select value as zip_code
      from jsonb_array_elements_text(
        coalesce(new.raw_user_meta_data->'territory_zips', '[]'::jsonb)
      )
      union
      select v_base_zip
      where v_base_zip is not null
    ) z
    where z.zip_code ~ '^[0-9]{5}$'
    on conflict (contractor_id, zip) do nothing;
  end if;

  return new;
end;
$function$


revoke execute on function public.handle_new_user() from public, anon, authenticated;
