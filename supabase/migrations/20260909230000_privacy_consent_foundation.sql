-- Privacy-first public intake: explicit consent evidence, server-only writes,
-- short-window abuse controls, and an admin-only consumer request queue.

alter table public.leads
  add column if not exists contact_consent boolean not null default false,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists consent_version text,
  add column if not exists consent_recorded_at timestamptz,
  add column if not exists attribution_source text,
  add column if not exists attribution_medium text,
  add column if not exists attribution_campaign text,
  add column if not exists attribution_content text,
  add column if not exists attribution_term text,
  add column if not exists initial_referrer_host text;

alter table public.leads
  add constraint leads_consent_evidence_complete
  check (
    (contact_consent = false and consent_version is null and consent_recorded_at is null)
    or
    (contact_consent = true and consent_version is not null and consent_recorded_at is not null)
  ),
  add constraint leads_attribution_source_length
  check (attribution_source is null or char_length(attribution_source) <= 120),
  add constraint leads_attribution_medium_length
  check (attribution_medium is null or char_length(attribution_medium) <= 120),
  add constraint leads_attribution_campaign_length
  check (attribution_campaign is null or char_length(attribution_campaign) <= 160),
  add constraint leads_attribution_content_length
  check (attribution_content is null or char_length(attribution_content) <= 160),
  add constraint leads_attribution_term_length
  check (attribution_term is null or char_length(attribution_term) <= 160),
  add constraint leads_initial_referrer_host_length
  check (initial_referrer_host is null or char_length(initial_referrer_host) <= 255);

comment on column public.leads.contact_consent is
  'Homeowner explicitly asked Lead Engine to share this request with one matched contractor.';
comment on column public.leads.marketing_consent is
  'Optional, separate permission for Lead Engine marketing email. Never required to request service.';
comment on column public.leads.consent_version is
  'Version of the disclosure presented when contact consent was captured.';
comment on column public.leads.consent_recorded_at is
  'Server-recorded timestamp for the consent event.';

-- Public browsers can no longer write directly to the leads table. The
-- public-intake Edge Function validates, rate-limits, and writes with a
-- server credential instead.
drop policy if exists leads_insert_public on public.leads;
revoke insert on public.leads from anon, authenticated;

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 255),
  request_type text not null check (
    request_type in ('access', 'correct', 'delete', 'marketing_opt_out', 'other')
  ),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'pending' check (
    status in ('pending', 'verifying', 'completed', 'denied')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from public, anon, authenticated;
grant select, update on public.privacy_requests to authenticated;

create policy privacy_requests_admin_select
on public.privacy_requests
for select
to authenticated
using ((select private.is_admin()));

create policy privacy_requests_admin_update
on public.privacy_requests
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create or replace function private.set_privacy_request_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_privacy_request_updated_at() from public, anon, authenticated;

create trigger set_privacy_requests_updated_at
before update on public.privacy_requests
for each row execute function private.set_privacy_request_updated_at();

comment on table public.privacy_requests is
  'Consumer privacy requests inserted by the public-intake function and visible only to admins.';

create table if not exists private.public_intake_rate_limits (
  request_hash text not null,
  action text not null,
  request_count integer not null default 1,
  window_started_at timestamptz not null default now(),
  primary key (request_hash, action)
);

revoke all on private.public_intake_rate_limits from public, anon, authenticated;

create or replace function public.consume_public_intake_limit(
  p_request_hash text,
  p_action text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if char_length(p_request_hash) <> 64
    or p_action not in ('lead', 'privacy_request')
    or p_max_requests < 1
    or p_max_requests > 20
    or p_window_seconds < 60
    or p_window_seconds > 86400 then
    return false;
  end if;

  delete from private.public_intake_rate_limits
  where window_started_at < v_now - interval '24 hours';

  insert into private.public_intake_rate_limits (
    request_hash,
    action,
    request_count,
    window_started_at
  )
  values (p_request_hash, p_action, 1, v_now)
  on conflict (request_hash, action) do update
  set
    request_count = case
      when private.public_intake_rate_limits.window_started_at
        < v_now - make_interval(secs => p_window_seconds)
      then 1
      else private.public_intake_rate_limits.request_count + 1
    end,
    window_started_at = case
      when private.public_intake_rate_limits.window_started_at
        < v_now - make_interval(secs => p_window_seconds)
      then v_now
      else private.public_intake_rate_limits.window_started_at
    end
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_public_intake_limit(text, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.consume_public_intake_limit(text, text, integer, integer)
to service_role;

comment on function public.consume_public_intake_limit(text, text, integer, integer) is
  'Server-only, transactional short-window rate limiter for unauthenticated intake.';
