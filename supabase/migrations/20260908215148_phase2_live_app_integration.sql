-- Provision the contractor record and routing preferences atomically with signup.
-- User metadata is accepted only for the new user's own non-privileged records.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  contractor_id uuid;
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
    returning id into contractor_id;

    insert into public.contractor_services (contractor_id, service_type)
    select contractor_id, service
    from jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'service_types', '[]'::jsonb)) service
    where service in (
      'Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Kitchen Remodel',
      'Bathroom Remodel', 'Windows & Doors', 'Solar'
    )
    on conflict (contractor_id, service_type) do nothing;

    insert into public.contractor_territories (contractor_id, zip)
    select contractor_id, zip
    from jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'territory_zips', '[]'::jsonb)) zip
    where zip ~ '^[0-9]{5}$'
    on conflict (contractor_id, zip) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- There can be only one current contractor assignment per lead.
create unique index if not exists lead_assignments_one_contractor_per_lead
on public.lead_assignments (lead_id);

create or replace function public.append_lead_note(p_lead_id uuid, p_body text)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_lead public.leads;
  clean_body text := trim(p_body);
begin
  if clean_body = '' or char_length(clean_body) > 500 then
    raise exception 'note must contain between 1 and 500 characters';
  end if;

  update public.leads
  set notes = notes || jsonb_build_array(jsonb_build_object(
        'id', gen_random_uuid()::text,
        'body', clean_body,
        'createdAt', now(),
        'authorId', (select auth.uid())::text
      )),
      updated_at = now()
  where id = p_lead_id
  returning * into updated_lead;

  if updated_lead.id is null then
    raise exception 'lead not found or access denied';
  end if;

  return updated_lead;
end;
$$;

revoke all on function public.append_lead_note(uuid, text) from public, anon;
grant execute on function public.append_lead_note(uuid, text) to authenticated;

create or replace function public.admin_assign_lead(p_lead_id uuid, p_contractor_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'admin access required';
  end if;

  if not exists (select 1 from public.leads where id = p_lead_id) then
    raise exception 'lead not found';
  end if;

  if p_contractor_id is not null and not exists (
    select 1 from public.contractors where id = p_contractor_id
  ) then
    raise exception 'contractor not found';
  end if;

  delete from public.lead_assignments where lead_id = p_lead_id;

  if p_contractor_id is not null then
    insert into public.lead_assignments (lead_id, contractor_id)
    values (p_lead_id, p_contractor_id);
  end if;
end;
$$;

revoke all on function public.admin_assign_lead(uuid, uuid) from public, anon;
grant execute on function public.admin_assign_lead(uuid, uuid) to authenticated;

create or replace function public.update_contractor_profile(
  p_contractor_id uuid,
  p_company_name text default null,
  p_contact_name text default null,
  p_phone text default null,
  p_city text default null,
  p_active boolean default null,
  p_service_types jsonb default null,
  p_territory_zips jsonb default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.contractors
  set company_name = coalesce(nullif(trim(p_company_name), ''), company_name),
      contact_name = coalesce(nullif(trim(p_contact_name), ''), contact_name),
      phone = case when p_phone is null then phone else left(nullif(trim(p_phone), ''), 20) end,
      city = case when p_city is null then city else left(nullif(trim(p_city), ''), 100) end,
      active = coalesce(p_active, active),
      updated_at = now()
  where id = p_contractor_id;

  if not found then
    raise exception 'contractor not found or access denied';
  end if;

  if p_service_types is not null then
    delete from public.contractor_services where contractor_id = p_contractor_id;
    insert into public.contractor_services (contractor_id, service_type)
    select p_contractor_id, service
    from jsonb_array_elements_text(p_service_types) service
    where service in (
      'Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Kitchen Remodel',
      'Bathroom Remodel', 'Windows & Doors', 'Solar'
    )
    on conflict (contractor_id, service_type) do nothing;
  end if;

  if p_territory_zips is not null then
    delete from public.contractor_territories where contractor_id = p_contractor_id;
    insert into public.contractor_territories (contractor_id, zip)
    select p_contractor_id, zip
    from jsonb_array_elements_text(p_territory_zips) zip
    where zip ~ '^[0-9]{5}$'
    on conflict (contractor_id, zip) do nothing;
  end if;
end;
$$;

revoke all on function public.update_contractor_profile(uuid, text, text, text, text, boolean, jsonb, jsonb)
from public, anon;
grant execute on function public.update_contractor_profile(uuid, text, text, text, text, boolean, jsonb, jsonb)
to authenticated;

create or replace function private.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_status_history (lead_id, status, changed_by)
    values (new.id, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

revoke all on function private.log_lead_status_change() from public, anon, authenticated;
drop trigger if exists log_lead_status_change on public.leads;
create trigger log_lead_status_change
after update of status on public.leads
for each row execute function private.log_lead_status_change();
