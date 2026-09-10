-- Lead Spark automated sales-force foundation
-- Admin-only CRM tables. Service-role functions can operate on these tables for automation.

create table if not exists public.sales_prospects (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  trade text,
  city text,
  state text,
  zip text,
  source text not null default 'manual',
  score integer not null default 0 check (score between 0 and 100),
  stage text not null default 'prospect' check (stage in (
    'prospect','contacted','replied','qualified','trial','paid','active','upsell','lost','do_not_contact'
  )),
  owner_agent text not null default 'prospector' check (owner_agent in (
    'prospector','outreach','follow_up','closer','onboarding','account_manager'
  )),
  opted_out boolean not null default false,
  last_contacted_at timestamptz,
  next_action_at timestamptz,
  converted_contractor_id uuid references public.contractors(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_prospects_email_unique
  on public.sales_prospects (lower(email)) where email is not null;
create index if not exists sales_prospects_stage_next_idx
  on public.sales_prospects (stage, next_action_at);
create index if not exists sales_prospects_trade_geo_idx
  on public.sales_prospects (trade, state, zip);

create table if not exists public.sales_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text not null default 'contractors',
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.sales_sequences(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  agent_role text not null check (agent_role in (
    'prospector','outreach','follow_up','closer','onboarding','account_manager'
  )),
  channel text not null check (channel in ('email','sms','dm','call_task','internal')),
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  objective text not null,
  template_key text,
  stop_on_reply boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sequence_id, step_number)
);

create table if not exists public.sales_enrollments (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  sequence_id uuid not null references public.sales_sequences(id) on delete cascade,
  current_step integer not null default 1,
  status text not null default 'active' check (status in ('active','paused','completed','replied','converted','opted_out','failed')),
  next_run_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_error text,
  unique (prospect_id, sequence_id)
);

create index if not exists sales_enrollments_due_idx
  on public.sales_enrollments (status, next_run_at) where status = 'active';

create table if not exists public.sales_activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  enrollment_id uuid references public.sales_enrollments(id) on delete set null,
  agent_role text not null check (agent_role in (
    'prospector','outreach','follow_up','closer','onboarding','account_manager'
  )),
  channel text not null check (channel in ('email','sms','dm','call_task','internal')),
  direction text not null default 'outbound' check (direction in ('outbound','inbound','internal')),
  status text not null default 'queued' check (status in ('queued','drafted','sent','delivered','replied','failed','skipped')),
  subject text,
  body text,
  provider_message_id text,
  error_message text,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sales_activities_queue_idx
  on public.sales_activities (status, scheduled_for);
create index if not exists sales_activities_prospect_idx
  on public.sales_activities (prospect_id, created_at desc);

create table if not exists public.sales_agent_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.sales_prospects(id) on delete cascade,
  agent_role text not null,
  event_type text not null,
  decision jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sales_prospects enable row level security;
alter table public.sales_sequences enable row level security;
alter table public.sales_sequence_steps enable row level security;
alter table public.sales_enrollments enable row level security;
alter table public.sales_activities enable row level security;
alter table public.sales_agent_events enable row level security;

create policy sales_prospects_admin_all on public.sales_prospects for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sales_sequences_admin_all on public.sales_sequences for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sales_sequence_steps_admin_all on public.sales_sequence_steps for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sales_enrollments_admin_all on public.sales_enrollments for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sales_activities_admin_all on public.sales_activities for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sales_agent_events_admin_all on public.sales_agent_events for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

-- Starter contractor acquisition sequence. The first real lead remains the acquisition incentive;
-- later lead access is governed by the existing billing/entitlement rules.
insert into public.sales_sequences (name, audience, description)
select 'Contractor Acquisition - First Lead', 'contractors',
       'Automated contractor acquisition sequence: introduce Lead Spark, follow up, qualify, close, and onboard.'
where not exists (select 1 from public.sales_sequences where name = 'Contractor Acquisition - First Lead');

insert into public.sales_sequence_steps (sequence_id, step_number, agent_role, channel, delay_minutes, objective, template_key, stop_on_reply)
select s.id, v.step_number, v.agent_role, v.channel, v.delay_minutes, v.objective, v.template_key, v.stop_on_reply
from public.sales_sequences s
cross join (values
  (1, 'outreach', 'email', 0, 'Introduce Lead Spark and the one-time first real lead incentive.', 'contractor_intro', true),
  (2, 'follow_up', 'email', 1440, 'Follow up with a concise proof-and-value message.', 'contractor_followup_1', true),
  (3, 'follow_up', 'email', 4320, 'Address the cost and lead-quality objection.', 'contractor_followup_2', true),
  (4, 'closer', 'email', 10080, 'Ask for the signup and move the prospect into trial.', 'contractor_close', true),
  (5, 'account_manager', 'internal', 20160, 'Flag non-responsive prospect for recycle or suppression.', 'contractor_recycle', false)
) as v(step_number, agent_role, channel, delay_minutes, objective, template_key, stop_on_reply)
where s.name = 'Contractor Acquisition - First Lead'
on conflict (sequence_id, step_number) do nothing;
