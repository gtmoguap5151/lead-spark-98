-- Phase 6: remove the pre-MVP subscription-gated matcher.
-- The current public.assign_new_lead trigger owns ZIP/service routing. Keeping
-- both triggers caused every public lead insert to call a legacy function that
-- referenced the renamed public."Subscriptions" table.

drop trigger if exists trg_match_new_lead on public.leads;
drop function if exists private.match_new_lead();
