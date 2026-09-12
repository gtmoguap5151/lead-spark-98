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

type Draft = {
  subject: string;
  body: string;
};

function firstName(contactName: string | null) {
  const name = contactName?.trim();
  return name ? name.split(/\s+/)[0] : null;
}

function buildTemplateEmail(prospect: Prospect, objective: string, agentRole: string): Draft {
  const signupUrl = Deno.env.get("RIVET_REACH_SIGNUP_URL") ||
    Deno.env.get("LEAD_SPARK_SIGNUP_URL") ||
    "https://rivetreach.com/login";
  const contact = firstName(prospect.contact_name);
  const greeting = contact ? `Hi ${contact},` : "Hi there,";
  const trade = prospect.trade?.trim() || "contractor";
  const location = [prospect.city, prospect.state].filter(Boolean).join(", ");
  const locationPhrase = location ? ` in ${location}` : "";
  const company = prospect.company_name?.trim() || "your company";
  const objectiveText = (objective || "").toLowerCase();

  let subject = `A lead option for ${company}`;
  let middle = `Rivet Reach connects homeowners with contractors when they are actively looking for help. I wanted to see whether ${company} is interested in receiving ${trade} opportunities${locationPhrase}.`;

  if (objectiveText.includes("follow") || objectiveText.includes("check") || objectiveText.includes("remind")) {
    subject = `Quick follow-up for ${company}`;
    middle = `I wanted to follow up about Rivet Reach. We connect homeowners with contractors who want new project opportunities${locationPhrase}. If adding another source of ${trade} work makes sense for ${company}, you can take a look whenever it is convenient.`;
  } else if (objectiveText.includes("free") || objectiveText.includes("offer") || objectiveText.includes("trial")) {
    subject = `${company}: first real lead can be free`;
    middle = `Rivet Reach helps contractors connect with homeowners looking for project help${locationPhrase}. Your first real lead can be free one time, so ${company} can judge the service from an actual opportunity before deciding whether continued paid access makes sense.`;
  } else if (objectiveText.includes("close") || objectiveText.includes("signup") || objectiveText.includes("sign up")) {
    subject = `Ready when ${company} is`;
    middle = `If ${company} wants another source of ${trade} opportunities${locationPhrase}, Rivet Reach is ready to use. The first real lead can be free one time; continued real-lead access after that requires payment, credits, or an active subscription.`;
  }

  const roleLine = agentRole === "closer"
    ? "If it looks useful, the next step is simply to create the contractor account."
    : "You can review it and create a contractor account here:";

  const body = `${greeting}\n\n${middle}\n\n${roleLine} ${signupUrl}\n\nIf you'd rather not hear from us, just reply stop.`;

  return {
    subject: subject.slice(0, 160),
    body,
  };
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
    return json({ processed: 0, drafted: 0, skipped: 0, failed: 0, mode: "zero_cost" });
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

      const draft = buildTemplateEmail(
        prospect as Prospect,
        activity.body || "Introduce Rivet Reach",
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

      if (activity.enrollment_id) {
        await supabase
          .from("sales_enrollments")
          .update({ last_error: null })
          .eq("id", activity.enrollment_id);
      }

      await supabase.from("sales_agent_events").insert({
        prospect_id: prospect.id,
        agent_role: activity.agent_role,
        event_type: "email_drafted",
        decision: {
          activity_id: activity.id,
          subject: draft.subject,
          reviewed_by: user.id,
          generation_mode: "zero_cost_template",
        },
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

  return json({ processed: activities.length, drafted, skipped, failed, mode: "zero_cost" });
});
