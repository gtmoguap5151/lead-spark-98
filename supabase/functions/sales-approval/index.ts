import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sales-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server configuration missing" }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const suppliedSecret = request.headers.get("x-sales-secret");
  const { data: expectedSecret, error: secretError } = await admin.rpc("get_sales_orchestrator_secret");
  const cronAuthorized = Boolean(!secretError && expectedSecret && suppliedSecret === expectedSecret);

  let actor = "system_cron";
  let payload: { activity_id?: string; action?: "send" | "reject" } | null = null;

  if (!cronAuthorized) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return json({ error: "Admin access required" }, 403);
    actor = user.id;
    payload = (await request.json().catch(() => null)) as typeof payload;
    if (!payload?.activity_id || !["send", "reject"].includes(payload.action ?? "")) {
      return json({ error: "activity_id and a valid action are required" }, 400);
    }
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("SALES_FROM_EMAIL");
  const businessName = Deno.env.get("SALES_BUSINESS_NAME");
  const postalAddress = Deno.env.get("SALES_POSTAL_ADDRESS");
  if (!resendKey || !from) return json({ error: "Email delivery is not configured" }, 500);
  if (!businessName || !postalAddress) {
    return json({ error: "Sending is locked until business name and physical mailing address are set" }, 503);
  }

  if (payload?.action === "reject" && payload.activity_id) {
    const { data: activity } = await admin
      .from("sales_activities")
      .select("id, prospect_id, status")
      .eq("id", payload.activity_id)
      .maybeSingle();
    if (!activity || activity.status !== "drafted") return json({ error: "Only drafted activities can be rejected" }, 409);
    await admin.from("sales_activities").update({ status: "skipped", error_message: "Rejected by admin review" }).eq("id", activity.id);
    await admin.from("sales_agent_events").insert({ prospect_id: activity.prospect_id, agent_role: "outreach", event_type: "draft_rejected", decision: { activity_id: activity.id, reviewed_by: actor } });
    return json({ ok: true, status: "skipped" });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: sentLast24h, error: countError } = await admin
    .from("sales_activities")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", since);
  if (countError) return json({ error: countError.message }, 500);

  const dailyCap = 80;
  const remaining = Math.max(0, dailyCap - (sentLast24h ?? 0));
  if (remaining === 0) return json({ processed: 0, sent: 0, skipped: 0, failed: 0, reason: "daily_cap_reached", daily_cap: dailyCap });

  let query = admin
    .from("sales_activities")
    .select("id, prospect_id, status, channel, subject, body, scheduled_for")
    .eq("status", "drafted")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true });

  if (payload?.activity_id) query = query.eq("id", payload.activity_id);
  const batchLimit = payload?.activity_id ? 1 : Math.min(5, remaining);
  const { data: activities, error: activityError } = await query.limit(batchLimit);
  if (activityError) return json({ error: activityError.message }, 500);
  if (!activities?.length) return json({ processed: 0, sent: 0, skipped: 0, failed: 0, daily_cap: dailyCap });

  const privacyUrl = Deno.env.get("RIVET_REACH_PRIVACY_URL") ||
    Deno.env.get("LEAD_SPARK_PRIVACY_URL") ||
    "https://rivetreach.com/privacy";

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const activity of activities) {
    if (activity.channel !== "email" || !activity.subject || !activity.body) {
      await admin.from("sales_activities").update({ status: "skipped", error_message: "Draft is not a sendable email" }).eq("id", activity.id);
      skipped++;
      continue;
    }

    const { data: prospect } = await admin
      .from("sales_prospects")
      .select("email, opted_out, stage")
      .eq("id", activity.prospect_id)
      .maybeSingle();

    if (!prospect?.email || prospect.opted_out || prospect.stage === "do_not_contact") {
      await admin.from("sales_activities").update({ status: "skipped", error_message: "Prospect cannot be contacted" }).eq("id", activity.id);
      skipped++;
      continue;
    }

    const normalizedEmail = prospect.email.trim().toLowerCase();
    const { data: suppressions, error: suppressionError } = await admin
      .from("privacy_suppressions")
      .select("suppression_type")
      .eq("email", normalizedEmail)
      .limit(1);

    if (suppressionError) {
      await admin.from("sales_activities").update({ error_message: suppressionError.message, scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString() }).eq("id", activity.id);
      failed++;
      continue;
    }

    if (suppressions?.length) {
      await admin.from("sales_prospects").update({ opted_out: true, stage: "do_not_contact" }).eq("id", activity.prospect_id);
      await admin.from("sales_enrollments").update({ status: "opted_out", completed_at: new Date().toISOString() }).eq("prospect_id", activity.prospect_id).eq("status", "active");
      await admin.from("sales_activities").update({ status: "skipped", error_message: "Blocked by global privacy suppression" }).eq("id", activity.id);
      skipped++;
      continue;
    }

    const finalBody = `${activity.body.trim()}\n\n${businessName}\n${postalAddress}\nPrivacy choices: ${privacyUrl}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `rivet-reach-sales/${activity.id}`,
      },
      body: JSON.stringify({ from, to: [prospect.email], subject: activity.subject, text: finalBody }),
    });

    const result: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = isRecord(result) && typeof result.message === "string"
        ? result.message
        : isRecord(result) && typeof result.error === "string"
          ? result.error
          : `Email send failed (${response.status})`;
      await admin.from("sales_activities").update({ error_message: message.slice(0, 1000), scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString() }).eq("id", activity.id);
      failed++;
      continue;
    }

    const providerMessageId = isRecord(result) && typeof result.id === "string" ? result.id : null;
    const sentAt = new Date().toISOString();
    await admin.from("sales_activities").update({ status: "sent", body: finalBody, provider_message_id: providerMessageId, sent_at: sentAt, error_message: null }).eq("id", activity.id);
    await admin.from("sales_prospects").update({ stage: "contacted", last_contacted_at: sentAt }).eq("id", activity.prospect_id).eq("stage", "prospect");
    await admin.from("sales_agent_events").insert({ prospect_id: activity.prospect_id, agent_role: "outreach", event_type: cronAuthorized ? "draft_auto_sent" : "draft_approved_sent", decision: { activity_id: activity.id, reviewed_by: actor, provider_message_id: providerMessageId } });
    sent++;
  }

  return json({ processed: activities.length, sent, skipped, failed, daily_cap: dailyCap, actor });
});
