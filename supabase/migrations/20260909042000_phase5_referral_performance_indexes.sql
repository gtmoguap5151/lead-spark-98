-- Phase 5 production hardening: cover referral foreign keys flagged by the
-- Supabase performance advisor. These indexes improve joins, deletes, and
-- referral/reward lookups as the contractor network grows.

create index if not exists idx_referral_rewards_referral_id
  on public.referral_rewards(referral_id);

create index if not exists idx_referrals_referred_contractor_id
  on public.referrals(referred_contractor_id);

create index if not exists idx_referrals_referrer_contractor_id
  on public.referrals(referrer_contractor_id);
