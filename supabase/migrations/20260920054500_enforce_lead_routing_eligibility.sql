-- Require current consent eligibility at every lead-routing boundary.
-- Historical rows are preserved but cannot be routed, viewed by contractors,
-- or consume a contractor's one-time free lead.

create or replace function public.assign_new_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contractor_id uuid;
begin
  if new.contact_consent is distinct from true
     or new.is_adult is distinct from true
     or new.is_homeowner is distinct from true
     or new.is_decision_maker is distinct from true then
    return new;
  end if;

  v_contractor_id := private.pick_contractor_for_lead(new.service_type, new.zip);

  if v_contractor_id is not null then
    insert into public.lead_assignments (lead_id, contractor_id)
    values (new.id, v_contractor_id)
    on conflict (lead_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.route_unassigned_leads(p_limit integer default 250)
returns integer
language plpgsql
set search_path = ''
as $$
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
    where l.contact_consent = true
      and l.is_adult = true
      and l.is_homeowner = true
      and l.is_decision_maker = true
      and not exists (
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
$$;

create or replace function private.contractor_can_access_lead(p_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or (
      exists (
        select 1
        from public.leads l
        where l.id = p_lead_id
          and l.contact_consent = true
          and l.is_adult = true
          and l.is_homeowner = true
          and l.is_decision_maker = true
      )
      and exists (
        select 1
        from public.lead_assignments la
        join public.contractors c on c.id = la.contractor_id
        where la.lead_id = p_lead_id
          and c.user_id = (select auth.uid())
          and (
            exists (
              select 1
              from public.subscriptions s
              where s.user_id = (select auth.uid())
                and s.status in ('active', 'trialing')
            )
            or la.id = (
              select first_la.id
              from public.lead_assignments first_la
              join public.leads first_lead on first_lead.id = first_la.lead_id
              where first_la.contractor_id = la.contractor_id
                and first_lead.contact_consent = true
                and first_lead.is_adult = true
                and first_lead.is_homeowner = true
                and first_lead.is_decision_maker = true
              order by first_la.assigned_at asc, first_la.id asc
              limit 1
            )
          )
      )
    );
$$;

create or replace function private.pick_contractor_for_lead(p_service_type text, p_zip text)
returns uuid
language sql
stable
set search_path = ''
as $$
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
        join public.leads first_lead on first_lead.id = first_la.lead_id
        where first_la.contractor_id = c.id
          and first_lead.contact_consent = true
          and first_lead.is_adult = true
          and first_lead.is_homeowner = true
          and first_lead.is_decision_maker = true
      )
    )
  order by
    (
      select count(*)
      from public.lead_assignments recent_la
      join public.leads recent_lead on recent_lead.id = recent_la.lead_id
      where recent_la.contractor_id = c.id
        and recent_lead.contact_consent = true
        and recent_lead.is_adult = true
        and recent_lead.is_homeowner = true
        and recent_lead.is_decision_maker = true
        and recent_la.assigned_at >= now() - interval '30 days'
    ) asc,
    (
      select max(last_la.assigned_at)
      from public.lead_assignments last_la
      join public.leads last_lead on last_lead.id = last_la.lead_id
      where last_la.contractor_id = c.id
        and last_lead.contact_consent = true
        and last_lead.is_adult = true
        and last_lead.is_homeowner = true
        and last_lead.is_decision_maker = true
    ) asc nulls first,
    c.created_at asc,
    c.id asc
  limit 1;
$$;

create or replace function public.admin_assign_lead(p_lead_id uuid, p_contractor_id uuid)
returns void
language plpgsql
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

  if p_contractor_id is not null and not exists (
    select 1
    from public.leads
    where id = p_lead_id
      and contact_consent = true
      and is_adult = true
      and is_homeowner = true
      and is_decision_maker = true
  ) then
    raise exception 'lead is not eligible for contractor routing';
  end if;

  delete from public.lead_assignments where lead_id = p_lead_id;

  if p_contractor_id is not null then
    insert into public.lead_assignments (lead_id, contractor_id)
    values (p_lead_id, p_contractor_id);
  end if;
end;
$$;
