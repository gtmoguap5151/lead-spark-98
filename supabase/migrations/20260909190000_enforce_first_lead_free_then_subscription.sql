-- Revenue gate: each contractor gets exactly one real assigned lead free.
-- After that, full lead access requires an active or trialing Stripe subscription.

create or replace function private.contractor_can_access_lead(p_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or exists (
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
            where first_la.contractor_id = la.contractor_id
            order by first_la.assigned_at asc, first_la.id asc
            limit 1
          )
        )
    );
$$;

revoke all on function private.contractor_can_access_lead(uuid) from public, anon;
grant execute on function private.contractor_can_access_lead(uuid) to authenticated;

comment on function private.contractor_can_access_lead(uuid) is
  'Allows admins, a contractor first assigned lead for free, or all assigned leads while subscription is active/trialing.';

-- Replace the old assigned-lead policies with the revenue-gated versions.
drop policy if exists leads_contractor_read_assigned on public.leads;
create policy leads_contractor_read_paid
on public.leads
for select
to authenticated
using ((select private.contractor_can_access_lead(id)));

drop policy if exists leads_contractor_update_assigned on public.leads;
create policy leads_contractor_update_paid
on public.leads
for update
to authenticated
using ((select private.contractor_can_access_lead(id)))
with check ((select private.contractor_can_access_lead(id)));

-- Keep assignment rows from leaking the existence of additional assigned leads
-- to unpaid contractors. Admins retain full visibility.
drop policy if exists assignments_contractor_read on public.lead_assignments;
create policy assignments_contractor_read_paid
on public.lead_assignments
for select
to authenticated
using (
  (select private.is_admin())
  or (
    contractor_id in (
      select c.id from public.contractors c where c.user_id = (select auth.uid())
    )
    and (select private.contractor_can_access_lead(lead_id))
  )
);
