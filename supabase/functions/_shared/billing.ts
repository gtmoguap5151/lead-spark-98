import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import Stripe from "npm:stripe@22.4.0";

export const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const namedKey = (jsonValue: string | undefined, name = "default") => {
  if (!jsonValue) return undefined;
  try {
    return (JSON.parse(jsonValue) as Record<string, string>)[name];
  } catch {
    return undefined;
  }
};

export const env = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export const stripe = () =>
  new Stripe(env("STRIPE_RESTRICTED_KEY"), { apiVersion: "2026-07-29.dahlia" });

export const supabaseAdmin = () => {
  const key = Deno.env.get("SUPABASE_SECRET_KEY") ??
    namedKey(Deno.env.get("SUPABASE_SECRET_KEYS")) ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Missing Supabase server key");
  return createClient(env("SUPABASE_URL"), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const userFromRequest = async (request: Request) => {
  const token = request.headers.get("Authorization")?.replace(
    /^Bearer\s+/i,
    "",
  );
  if (!token) return null;
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    namedKey(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")) ??
    Deno.env.get("SUPABASE_ANON_KEY");
  if (!publishableKey) throw new Error("Missing Supabase publishable key");
  const client = createClient(env("SUPABASE_URL"), publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user;
};

export const appOrigin = (request: Request) => {
  const configured = Deno.env.get("APP_URL")?.replace(/\/$/, "");
  if (configured) return configured;
  const origin = request.headers.get("origin");
  if (
    !origin || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    throw new Error("Missing APP_URL");
  }
  return origin;
};

export const leadSparkLookupKeys = () =>
  (Deno.env.get("STRIPE_PRICE_LOOKUP_KEYS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^lead_spark_98_[a-z0-9_]+$/.test(value));

export const safeError = (error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Billing request failed",
  );
  return json({ error: "Billing request failed. Please try again." }, 500);
};
