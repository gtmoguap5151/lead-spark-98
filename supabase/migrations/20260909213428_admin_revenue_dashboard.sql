-- Let contractors read their own subscription and platform admins read subscription
-- health for the owner dashboard without creating overlapping permissive policies.
drop policy if exists "Contractors can view own subscription" on public.subscriptions;
drop policy if exists subscriptions_admin_read on public.subscriptions;
create policy subscription_read_owner_or_admin
on public.subscriptions
for select
to authenticated
using (((select auth.uid()) = user_id) or (select private.is_admin()));

comment on policy subscription_read_owner_or_admin on public.subscriptions is
  'Allows contractors to read their own subscription and platform admins to view subscription health.';
