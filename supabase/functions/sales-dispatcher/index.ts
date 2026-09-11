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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function extractOutputText(payload: unknown): string {
  if (!isRecord(payload)) return "";
  if (typeof payload.output_text === "string") return payload.output_text.trim();
  const parts: string[] = [];
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!isRecord(item)) continue;
    const contentParts = Array.isArray(item.content) ? item.content : [];
    for (const content of contentParts) {
      if (isRecord(content) && typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function parseDraft(text: string) {
  const subjectMatch = text.match(/^SUBJECT:\s*(.+)$/im);
  const bodyMatch = text.match(/^BODY:\s*([\s\S]+)$/im);
  if (!subjectMatch || !bodyMatch) {
    throw new Error("AI response did not contain SUBJECT and BODY fields");
  }
  return {
    subject: subjectMatch[1].trim().slice(0, 160),
    body: bodyMatch[1].trim(),
  };
}

async function generateEmail(prospect: Prospect, objective: string, agentRole: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-5-mini";
  const signupUrl =
    Deno.env.get("LEAD_SPARK_SIGNUP_URL") || "https://lead-spark-98.vercel.app/login";
  const location =
    [prospect.city, prospect.state].filter(Boolean).join(", ") || "their service area";

  const prompt = `You are the ${agentRole} for Lead Spark, a contractor lead platform.\n\nWrite a short, credible sales email to a contractor. Do not sound robotic, exaggerated, deceptive, or spammy. Never claim results, customers, savings, exclusivity, or lead volume that are not provided. The one approved acquisition offer is: the contractor's first real lead can be free one time; after that, continued real-lead access requires payment, credits, or an active paid subscription.\n\nProspect:\nCompany: ${prospect.company_name}\nContact: ${prospect.contact_name || "owner/team"}\nTrade: ${prospect.trade || "contractor"}\nLocation: ${location}\nWebsite: ${prospect.website || "unknown"}\n\nObjective: ${objective}\nSignup URL: ${signupUrl}\n\nRequirements:\n- 45 to 110 words in the body.\n- One clear call to action.\n- Mention Lead Spark naturally.\n- Personalize only from the supplied facts.\n- Do not use fake urgency.\n- Include a simple opt-out sentence at the end: "If you'd rather not hear from us, just reply stop."\n- Plain text only.\n- Output exactly:\nSUBJECT: <subject>\nBODY: <body>`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: prompt, store: false }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = isRecord(payload) && isRecord(payload.error) && payload.error.message;
    throw new Error(
      typeof message === "string" ? message : `OpenAI request failed (${response.status})`,
    );
  }
  return parseDraft(extractOutputText(payload));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);
  if (!url || !serviceKey) return json({ error: "Supabase service configuration missing" }, 500);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return json({ error: "Admin access required" }, 403);

  const now = new Date().toISOString();
  const { data: activities, error } = await supabase
    .from("sales_activities")
    .select("id, prospect_id, enrollment_id, agent_role, channel, body, scheduled_for")
    .eq("status", "queued")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(25);

  if (error) return json({ error: error.message }, 500);
  if (!activities?.length) {
    return json({ processed: 0, drafted: 0, skipped: 0, failed: 0 });
  }

  let drafted = 0;
  let skipped = 0;
  let failed = 0;

  for (const activity of activities) {
    try {
      if (activity.channel !== "email") {
        await supabase
          .from("sales_activities")
          .update({
            status: "skipped",
            error_message: `Channel ${activity.channel} is not connected for drafting`,
          })
          .eq("id", activity.id);
        skipped++;
        continue;
      }

      const { data: prospect, error: prospectError } = await supabase
        .from("sales_prospects")
        .select(
          "id, company_name, contact_name, email, trade, city, state, website, stage, opted_out",
        )
        .eq("id", activity.prospect_id)
        .maybeSingle();

      if (prospectError || !prospect) {
        throw new Error(prospectError?.message || "Prospect not found");
      }
      if (prospect.opted_out || prospect.stage === "do_not_contact" || !prospect.email) {
        await supabase
          .from("sales_activities")
          .update({
            status: "skipped",
            error_message: "Prospect is opted out, do-not-contact, or missing email",
          })
          .eq("id", activity.id);
        skipped++;
        continue;
      }

      const normalizedEmail = prospect.email.trim().toLowerCase();
      const { data: suppressions, error: suppressionError } = await supabase
        .from("privacy_suppressions")
        .select("suppression_type")
        .eq("email", normalizedEmail)
        .limit(1);
      if (suppressionError) throw new Error(suppressionError.message);
      if (suppressions?.length) {
        await supabase
          .from("sales_prospects")
          .update({ opted_out: true, stage: "do_not_contact" })
          .eq("id", prospect.id);
        await supabase
          .from("sales_activities")
          .update({ status: "skipped", error_message: "Blocked by global privacy suppression" })
          .eq("id", activity.id);
        if (activity.enrollment_id) {
          await supabase
            .from("sales_enrollments")
            .update({ status: "opted_out", completed_at: now })
            .eq("id", activity.enrollment_id);
        }
        skipped++;
        continue;
      }

      const draft = await generateEmail(
        prospect as Prospect,
        activity.body || "Introduce Lead Spark",
        activity.agent_role,
      );
      await supabase
        .from("sales_activities")
        .update({
          status: "drafted",
          subject: draft.subject,
          body: draft.body,
          error_message: null,
        })
        .eq("id", activity.id);
      await supabase.from("sales_agent_events").insert({
        prospect_id: prospect.id,
        agent_role: activity.agent_role,
        event_type: "email_drafted",
        decision: { activity_id: activity.id, subject: draft.subject, reviewed_by: user.id },
      });
      drafted++;
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

  return json({ processed: activities.length, drafted, skipped, failed });
});
