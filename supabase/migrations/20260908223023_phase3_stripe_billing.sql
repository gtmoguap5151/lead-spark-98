-- Phase 3: normalize the legacy billing table and lock all writes to the backend.
do $$
begin
  if to_regclass('public."Subscriptions"') is not null
     and to_regclass('public.subscriptions') is null then
    alter table public."Subscriptions" rename to subscriptions;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'Status'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'status'
  ) then
    alter table public.subscriptions rename column "Status" to status;
  end if;
end
$$;

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.subscriptions
  alter column status set default 'inactive';

create unique index if not exists subscriptions_user_id_key
  on public.subscriptions (user_id);
drop index if exists public.idx_subscriptions_user_id;
create unique index if not exists subscriptions_stripe_customer_id_key
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;
create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "Contractors can view own subscription" on public.subscriptions;
create policy "Contractors can view own subscription"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.subscriptions from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.subscriptions from authenticated;
grant select on table public.subscriptions to authenticated;

comment on table public.subscriptions is
  'Server-managed Stripe subscription state. Clients have read-only access to their own row.';

-- Invoice payment records are also written only by the verified Stripe webhook.
alter table public.payments
  add column if not exists stripe_invoice_id text,
  add column if not exists subscription_id bigint references public.subscriptions(id) on delete set null;

create unique index if not exists payments_stripe_invoice_id_key
  on public.payments (stripe_invoice_id)
  where stripe_invoice_id is not null;
create index if not exists payments_subscription_id_idx
  on public.payments (subscription_id);
create index if not exists payments_user_id_idx
  on public.payments (user_id);

drop policy if exists payments_self on public.payments;
create policy payments_self
on public.payments
for select
to authenticated
using ((user_id = (select auth.uid())) or private.is_admin());

revoke insert, update, delete, truncate, references, trigger
  on table public.payments from anon, authenticated;
