# RivetReach

RivetReach is a mobile-first contractor growth platform operated by Southeast Home Service, combining qualified lead intake and routing, contractor CRM workflows, performance reporting, subscriptions, referrals, and automated sales outreach.

## Current capabilities

- Contractor signup and login with Supabase Auth
- Public homeowner estimate requests
- Automatic lead matching by service and ZIP territory
- Contractor lead inbox, notes, status pipeline, appointments, and won-job values
- Admin management for contractors, assignments, and performance metrics
- Stripe subscription checkout, customer portal, and signed webhook processing
- Referral and referral-reward data foundation
- Responsive installable web-app manifest
- Automated contractor outreach queue with AI drafting and admin approval before sending

## Stack

- TanStack Start, React 19, TypeScript, and Vite
- Supabase Auth, Postgres, Row Level Security, and Edge Functions
- Stripe Checkout and Billing Portal

## Local development

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never expose a Supabase secret/service-role key or Stripe secret in a `VITE_` variable.

## Verification

```sh
npm run lint
npm run build
```

## Deployment configuration

Frontend environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Supabase Edge Function secrets:

- `STRIPE_RESTRICTED_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_LOOKUP_KEYS`
- `APP_URL`

The Stripe webhook endpoint is:

```text
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to the checkout-session, customer-subscription, and invoice events handled in `supabase/functions/stripe-webhook/index.ts`.

## Security model

Browser code uses only the Supabase publishable key. Postgres RLS limits contractors to their own records and assignments, while privileged mutations use authenticated database functions. Subscription and payment writes are reserved for the verified Stripe webhook.

This repository remains connected to Lovable. Do not rewrite published Git history.
