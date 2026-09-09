-- Avoid PL/pgSQL variable/column ambiguity while provisioning contractors.
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
    insert into public.contractors (
      user_id,
      company_name,
      contact_name,
      email,
      phone,
      city
    ) values (
      new.id,
      left(trim(new.raw_user_meta_data->>'company_name'), 120),
      left(coalesce(nullif(trim(new.raw_user_meta_data->>'contact_name'), ''), new.email), 100),
      new.email,
      left(nullif(trim(new.raw_user_meta_data->>'phone'), ''), 20),
      left(nullif(trim(new.raw_user_meta_data->>'city'), ''), 100)
    )
    on conflict (user_id) do update set
      company_name = excluded.company_name,
      contact_name = excluded.contact_name,
      phone = excluded.phone,
      city = excluded.city,
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
