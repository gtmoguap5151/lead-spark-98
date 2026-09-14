-- Give the outbound sender enough time to process a full five-message batch.
-- pg_net defaults to five seconds, which can expire during Edge Function cold starts.
create or replace function app_private.invoke_sales_approval(
  p_activity_id uuid,
  p_action text
)
returns bigint
language plpgsql
security definer
set search_path = app_private, vault, net, pg_catalog
as $$
declare
  v_secret text;
  v_request_id bigint;
begin
  if p_action not in ('send', 'reject') then
    raise exception 'invalid action';
  end if;

  select decrypted_secret
    into v_secret
  from vault.decrypted_secrets
  where name = 'lead_spark_sales_orchestrator_secret'
  limit 1;

  if v_secret is null then
    raise exception 'sales approval secret is not configured';
  end if;

  select net.http_post(
    url := 'https://mibvbzdrmjtchapqgelv.supabase.co/functions/v1/sales-approval',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sales-secret', v_secret
    ),
    body := jsonb_build_object(
      'activity_id', p_activity_id,
      'action', p_action
    ),
    timeout_milliseconds := 30000
  ) into v_request_id;

  return v_request_id;
end;
$$;

comment on function app_private.invoke_sales_approval(uuid, text) is
  'Queues the sales approval Edge Function with a 30-second pg_net timeout.';

-- The scheduled sender uses a separate zero-argument wrapper. Give that
-- cron path the same timeout as manual approval sends.
create or replace function app_private.invoke_sales_sender()
returns bigint
language sql
security definer
set search_path = app_private, vault, net, pg_catalog
as $$
  select net.http_post(
    url := 'https://mibvbzdrmjtchapqgelv.supabase.co/functions/v1/sales-approval',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sales-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'lead_spark_sales_orchestrator_secret'
        limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
$$;

revoke all on function app_private.invoke_sales_sender() from public;
revoke all on function app_private.invoke_sales_sender() from anon, authenticated;
grant execute on function app_private.invoke_sales_sender() to postgres;

comment on function app_private.invoke_sales_sender() is
  'Queues the scheduled sales sender with a 30-second pg_net timeout.';
