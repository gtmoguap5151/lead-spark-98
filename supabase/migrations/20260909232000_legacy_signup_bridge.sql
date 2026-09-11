-- Keep accounts created by a cached copy of the immediately previous frontend
-- working during the nationwide notice rollout. Current clients must send both
-- attestation fields; once they do, the server records its own timestamps.

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
begin
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
