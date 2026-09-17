-- The webhook upserts invoices with onConflict: stripe_invoice_id.
-- A partial unique index cannot arbitrate that conflict target.
DROP INDEX IF EXISTS public.payments_stripe_invoice_id_key;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_stripe_invoice_id_key UNIQUE (stripe_invoice_id);
