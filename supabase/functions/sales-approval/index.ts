import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const authHeader = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);
  if (!url || !serviceKey) return json({ error: "Server configuration missing" }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return json({ error: "Admin access required" }, 403);

  const payload = (await request.json().catch(() => null)) as {
    activity_id?: string;
    action?: "send" | "reject";
  } | null;
  if (!payload?.activity_id || !["send", "reject"].includes(payload.action ?? "")) {
    return json({ error: "activity_id and a valid action are required" }, 400);
  }

  const { data: activity, error: activityError } = await admin
    .from("sales_activities")
    .select("id, prospect_id, status, channel, subject, body")
    .eq("id", payload.activity_id)
    .maybeSingle();
  if (activityError || !activity) {
    return json({ error: activityError?.message || "Activity not found" }, 404);
  }
  if (activity.status !== "drafted") {
    return json({ error: "Only drafted activities can be reviewed" }, 409);
  }

  if (payload.action === "reject") {
    await admin
      .from("sales_activities")
      .update({ status: "skipped", error_message: "Rejected by admin review" })
      .eq("id", activity.id);
    await admin.from("sales_agent_events").insert({
      prospect_id: activity.prospect_id,
      agent_role: "outreach",
      event_type: "draft_rejected",
      decision: { activity_id: activity.id, reviewed_by: user.id },
    });
    return json({ ok: true, status: "skipped" });
  }

  if (activity.channel !== "email" || !activity.subject || !activity.body) {
    return json({ error: "Draft is not a sendable email" }, 409);
  }

  const { data: prospect } = await admin
    .from("sales_prospects")
    .select("email, opted_out, stage")
    .eq("id", activity.prospect_id)
    .maybeSingle();
  if (!prospect?.email || prospect.opted_out || prospect.stage === "do_not_contact") {
    await admin
      .from("sales_activities")
      .update({ status: "skipped", error_message: "Prospect cannot be contacted" })
      .eq("id", activity.id);
    return json({ error: "Prospect cannot be contacted" }, 409);
  }

  const normalizedEmail = prospect.email.trim().toLowerCase();
  const { data: suppressions, error: suppressionError } = await admin
    .from("privacy_suppressions")
    .select("suppression_type")
    .eq("email", normalizedEmail)
    .limit(1);
  if (suppressionError) return json({ error: suppressionError.message }, 500);
  if (suppressions?.length) {
    await admin
      .from("sales_prospects")
      .update({ opted_out: true, stage: "do_not_contact" })
      .eq("id", activity.prospect_id);
    await admin
      .from("sales_enrollments")
      .update({ status: "opted_out", completed_at: new Date().toISOString() })
      .eq("prospect_id", activity.prospect_id)
      .eq("status", "active");
    await admin
      .from("sales_activities")
      .update({ status: "skipped", error_message: "Blocked by global privacy suppression" })
      .eq("id", activity.id);
    return json({ error: "Send blocked by a global privacy opt-out" }, 409);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("SALES_FROM_EMAIL");
  const businessName = Deno.env.get("SALES_BUSINESS_NAME");
  const postalAddress = Deno.env.get("SALES_POSTAL_ADDRESS");
  if (!resendKey || !from) return json({ error: "Email delivery is not configured" }, 500);
  if (!businessName || !postalAddress) {
    return json(
      { error: "Sending is locked until the business name and physical mailing address are set" },
      503,
    );
  }

  const privacyUrl =
    Deno.env.get("LEAD_SPARK_PRIVACY_URL") || "https://lead-spark-98.vercel.app/privacy";
  const finalBody = `${activity.body.trim()}\n\n${businessName}\n${postalAddress}\nPrivacy choices: ${privacyUrl}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lead-spark-approval/${activity.id}`,
    },
    body: JSON.stringify({
      from,
      to: [prospect.email],
      subject: activity.subject,
      text: finalBody,
    }),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message =
      isRecord(result) &&
      (typeof result.message === "string"
        ? result.message
        : typeof result.error === "string"
          ? result.error
          : null);
    return json({ error: message || "Email send failed" }, 502);
  }

  const providerMessageId = isRecord(result) && typeof result.id === "string" ? result.id : null;
  const sentAt = new Date().toISOString();
  await admin
    .from("sales_activities")
    .update({
      status: "sent",
      body: finalBody,
      provider_message_id: providerMessageId,
      sent_at: sentAt,
      error_message: null,
    })
    .eq("id", activity.id);
  await admin
    .from("sales_prospects")
    .update({ stage: "contacted", last_contacted_at: sentAt })
    .eq("id", activity.prospect_id)
    .eq("stage", "prospect");
  await admin.from("sales_agent_events").insert({
    prospect_id: activity.prospect_id,
    agent_role: "outreach",
    event_type: "draft_approved_sent",
    decision: {
      activity_id: activity.id,
      reviewed_by: user.id,
      provider_message_id: providerMessageId,
    },
  });

  return json({ ok: true, status: "sent", provider_message_id: providerMessageId });
});
