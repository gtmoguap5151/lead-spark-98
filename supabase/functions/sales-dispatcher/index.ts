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

type Prospect = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  trade: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  stage: string;
  opted_out: boolean;
};

function extractOutputText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  const parts: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function parseDraft(text: string) {
  const subjectMatch = text.match(/^SUBJECT:\s*(.+)$/im);
  const bodyMatch = text.match(/^BODY:\s*([\s\S]+)$/im);
  if (!subjectMatch || !bodyMatch) throw new Error("AI response did not contain SUBJECT and BODY fields");
  return {
    subject: subjectMatch[1].trim().slice(0, 160),
    body: bodyMatch[1].trim(),
  };
}

async function generateEmail(prospect: Prospect, objective: string, agentRole: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-5-mini";
  const signupUrl = Deno.env.get("LEAD_SPARK_SIGNUP_URL") || "https://lead-spark-98.vercel.app/login";
  const location = [prospect.city, prospect.state].filter(Boolean).join(", ") || "their service area";

  const prompt = `You are the ${agentRole} for Lead Spark, a contractor lead platform.\n\nWrite a short, credible sales email to a contractor. Do not sound robotic, exaggerated, deceptive, or spammy. Never claim results, customers, savings, exclusivity, or lead volume that are not provided. The one approved acquisition offer is: the contractor's first real lead can be free one time; after that, continued real-lead access requires payment, credits, or an active paid subscription.\n\nProspect:\nCompany: ${prospect.company_name}\nContact: ${prospect.contact_name || "owner/team"}\nTrade: ${prospect.trade || "contractor"}\nLocation: ${location}\nWebsite: ${prospect.website || "unknown"}\n\nObjective: ${objective}\nSignup URL: ${signupUrl}\n\nRequirements:\n- 45 to 110 words in the body.\n- One clear call to action.\n- Mention Lead Spark naturally.\n- Personalize only from the supplied facts.\n- Do not use fake urgency.\n- Include a simple opt-out sentence at the end: \"If you'd rather not hear from us, just reply stop.\"\n- Plain text only.\n- Output exactly:\nSUBJECT: <subject>\nBODY: <body>`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      store: false,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || `OpenAI request failed (${response.status})`);
  return parseDraft(extractOutputText(payload));
}

async function sendEmail(to: string, subject: string, body: string, activityId: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("SALES_FROM_EMAIL");
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");
  if (!from) throw new Error("SALES_FROM_EMAIL is missing");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lead-spark-sales/${activityId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || payload?.error || `Email send failed (${response.status})`);
  return payload?.id as string | undefined;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("SALES_ORCHESTRATOR_SECRET");
  if (!expectedSecret || request.headers.get("x-sales-secret") !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Supabase service configuration missing" }, 500);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date().toISOString();
  const { data: activities, error } = await supabase
    .from("sales_activities")
    .select("id, prospect_id, enrollment_id, agent_role, channel, body, scheduled_for")
    .eq("status", "queued")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(25);

  if (error) return json({ error: error.message }, 500);
  if (!activities?.length) return json({ processed: 0, sent: 0, skipped: 0, failed: 0 });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const activity of activities) {
    try {
      if (activity.channel === "internal") {
        await supabase.from("sales_activities").update({ status: "skipped" }).eq("id", activity.id);
        skipped++;
        continue;
      }

      if (activity.channel !== "email") {
        await supabase
          .from("sales_activities")
          .update({ status: "skipped", error_message: `Channel ${activity.channel} not connected yet` })
          .eq("id", activity.id);
        skipped++;
        continue;
      }

      const { data: prospect, error: prospectError } = await supabase
        .from("sales_prospects")
        .select("id, company_name, contact_name, email, trade, city, state, website, stage, opted_out")
        .eq("id", activity.prospect_id)
        .maybeSingle();

      if (prospectError || !prospect) throw new Error(prospectError?.message || "Prospect not found");
      if (prospect.opted_out || prospect.stage === "do_not_contact" || !prospect.email) {
        await supabase
          .from("sales_activities")
          .update({ status: "skipped", error_message: "Prospect is opted out, do-not-contact, or missing email" })
          .eq("id", activity.id);
        skipped++;
        continue;
      }

      const draft = await generateEmail(prospect as Prospect, activity.body || "Introduce Lead Spark", activity.agent_role);
      await supabase
        .from("sales_activities")
        .update({ status: "drafted", subject: draft.subject, body: draft.body, error_message: null })
        .eq("id", activity.id);

      const providerMessageId = await sendEmail(prospect.email, draft.subject, draft.body, activity.id);
      await supabase
        .from("sales_activities")
        .update({
          status: "sent",
          provider_message_id: providerMessageId || null,
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", activity.id);

      await supabase
        .from("sales_prospects")
        .update({
          stage: prospect.stage === "prospect" ? "contacted" : prospect.stage,
          last_contacted_at: new Date().toISOString(),
          owner_agent: activity.agent_role,
        })
        .eq("id", prospect.id);

      await supabase.from("sales_agent_events").insert({
        prospect_id: prospect.id,
        agent_role: activity.agent_role,
        event_type: "email_sent",
        decision: {
          activity_id: activity.id,
          provider_message_id: providerMessageId || null,
          subject: draft.subject,
        },
      });

      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from("sales_activities")
        .update({ status: "failed", error_message: message.slice(0, 1000) })
        .eq("id", activity.id);
      if (activity.enrollment_id) {
        await supabase
          .from("sales_enrollments")
          .update({ last_error: message.slice(0, 1000) })
          .eq("id", activity.enrollment_id);
      }
      failed++;
    }
  }

  return json({ processed: activities.length, sent, skipped, failed });
});
