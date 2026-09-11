import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import { z } from "npm:zod@3.24.2";

const CONSENT_VERSION = "2026-09-09-us-2";
const ACCEPTED_CONSENT_VERSIONS = ["2026-09-09", CONSENT_VERSION] as const;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const serviceTypes = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Windows & Doors",
  "Solar",
] as const;

const timelines = [
  "ASAP (emergency)",
  "Within 30 days",
  "1-3 months",
  "3+ months / researching",
] as const;

const attributionSchema = z
  .object({
    source: z.string().trim().max(120).optional(),
    medium: z.string().trim().max(120).optional(),
    campaign: z.string().trim().max(160).optional(),
    content: z.string().trim().max(160).optional(),
    term: z.string().trim().max(160).optional(),
    referrerHost: z.string().trim().max(255).optional(),
  })
  .strict()
  .optional();

const leadSchema = z
  .object({
    action: z.literal("lead"),
    name: z.string().trim().min(2).max(100),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(20)
      .regex(/^[\d\s()+-.]+$/),
    email: z.string().trim().email().max(255),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}$/),
    serviceType: z.enum(serviceTypes),
    timeline: z.enum(timelines),
    budget: z.string().trim().max(60).optional(),
    projectDetails: z.string().trim().min(10).max(1000),
    isHomeowner: z.literal(true),
    isDecisionMaker: z.literal(true),
    isAdult: z.literal(true).optional(),
    contactConsent: z.literal(true),
    marketingConsent: z.boolean(),
    // Keep the immediately previous notice version valid while cached clients
    // roll over to the nationwide notice. The server records the current version.
    consentVersion: z.enum(ACCEPTED_CONSENT_VERSIONS),
    attribution: attributionSchema,
    website: z.string().max(0).optional(),
  })
  .strict();

const privacyRequestSchema = z
  .object({
    action: z.literal("privacy_request"),
    email: z.string().trim().email().max(255),
    requestType: z.enum([
      "access",
      "correct",
      "delete",
      "portable_copy",
      "marketing_opt_out",
      "sale_opt_out",
      "targeted_advertising_opt_out",
      "profiling_opt_out",
      "appeal",
      "other",
    ]),
    details: z.string().trim().max(1000).optional(),
    website: z.string().max(0).optional(),
  })
  .strict();

const bodySchema = z.discriminatedUnion("action", [leadSchema, privacyRequestSchema]);

const namedKey = (jsonValue: string | undefined, name = "default") => {
  if (!jsonValue) return undefined;
  try {
    return (JSON.parse(jsonValue) as Record<string, string>)[name];
  } catch {
    return undefined;
  }
};

const serverKey = () => {
  const key =
    Deno.env.get("SUPABASE_SECRET_KEY") ??
    namedKey(Deno.env.get("SUPABASE_SECRET_KEYS")) ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Missing Supabase server key");
  return key;
};

const allowedOrigin = (request: Request) => {
  const origin = request.headers.get("origin") ?? "";
  const appOrigin = Deno.env.get("APP_URL")?.replace(/\/$/, "");
  if (LOCAL_ORIGIN.test(origin) || (appOrigin && origin === appOrigin)) return origin;
  return null;
};

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": origin,
  Vary: "Origin",
});

const json = (origin: string, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });

const requestFingerprint = async (request: Request, secret: string) => {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || request.headers.get("cf-connecting-ip") || "unknown";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(clientAddress));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

const clean = (value: string | undefined) => value?.trim() || null;

Deno.serve(async (request) => {
  const origin = allowedOrigin(request);
  if (!origin) return new Response("Forbidden", { status: 403 });
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") return json(origin, { error: "Method not allowed" }, 405);

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 20_000) return json(origin, { error: "Request too large" }, 413);

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success)
      return json(origin, { error: "Please check the submitted information." }, 400);

    // Common honeypot field. Bots receive a normal-looking response without
    // creating a lead or a privacy request.
    if (parsed.data.website) return json(origin, { ok: true }, 202);

    const key = serverKey();
    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const fingerprint = await requestFingerprint(request, key);
    const isLead = parsed.data.action === "lead";
    const { data: withinLimit, error: limitError } = await admin.rpc(
      "consume_public_intake_limit",
      {
        p_request_hash: fingerprint,
        p_action: parsed.data.action,
        p_max_requests: isLead ? 5 : 3,
        p_window_seconds: 900,
      },
    );
    if (limitError) throw limitError;
    if (!withinLimit) {
      return json(origin, { error: "Too many requests. Please try again later." }, 429);
    }

    if (parsed.data.action === "lead") {
      const lead = parsed.data;
      if (lead.consentVersion === CONSENT_VERSION && lead.isAdult !== true) {
        return json(origin, { error: "Please confirm that you are at least 18." }, 400);
      }
      let marketingConsent = lead.marketingConsent;
      if (marketingConsent) {
        const { data: suppression, error: suppressionError } = await admin
          .from("privacy_suppressions")
          .select("email")
          .eq("email", lead.email.toLowerCase())
          .eq("suppression_type", "marketing")
          .maybeSingle();
        if (suppressionError) throw suppressionError;
        marketingConsent = !suppression;
      }
      const { error } = await admin.from("leads").insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email.toLowerCase(),
        zip: lead.zip,
        service_type: lead.serviceType,
        project_details: lead.projectDetails,
        timeline: lead.timeline,
        budget: clean(lead.budget),
        is_homeowner: true,
        is_decision_maker: true,
        is_adult: lead.isAdult === true,
        contact_consent: true,
        marketing_consent: marketingConsent,
        consent_version: CONSENT_VERSION,
        consent_recorded_at: new Date().toISOString(),
        attribution_source: clean(lead.attribution?.source),
        attribution_medium: clean(lead.attribution?.medium),
        attribution_campaign: clean(lead.attribution?.campaign),
        attribution_content: clean(lead.attribution?.content),
        attribution_term: clean(lead.attribution?.term),
        initial_referrer_host: clean(lead.attribution?.referrerHost),
      });
      if (error) throw error;
    } else {
      const privacyRequest = parsed.data;
      const dueDays = privacyRequest.requestType === "appeal" ? 60 : 45;
      const { data: createdRequest, error } = await admin
        .from("privacy_requests")
        .insert({
          email: privacyRequest.email.toLowerCase(),
          request_type: privacyRequest.requestType,
          details: clean(privacyRequest.details),
          due_at: new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;

      const suppressionType =
        privacyRequest.requestType === "marketing_opt_out"
          ? "marketing"
          : privacyRequest.requestType === "sale_opt_out"
            ? "sale"
            : privacyRequest.requestType === "targeted_advertising_opt_out"
              ? "targeted_advertising"
              : privacyRequest.requestType === "profiling_opt_out"
                ? "profiling"
                : null;
      if (suppressionType) {
        const { error: suppressionError } = await admin.from("privacy_suppressions").upsert(
          {
            email: privacyRequest.email.toLowerCase(),
            suppression_type: suppressionType,
            source_request_id: createdRequest.id,
          },
          { onConflict: "email,suppression_type" },
        );
        if (suppressionError) throw suppressionError;
      }
    }

    return json(origin, { ok: true }, 201);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Public intake failed");
    return json(origin, { error: "We could not submit this request. Please try again." }, 500);
  }
});
