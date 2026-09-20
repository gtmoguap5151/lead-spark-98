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

function firstName(contactName: string | null) {
  const name = contactName?.trim();
  return name ? name.split(/\s+/)[0] : null;
}

function buildTemplateEmail(prospect: Prospect, objective: string, agentRole: string) {
  const configuredSignupUrl = Deno.env.get("RIVET_REACH_SIGNUP_URL") ||
    Deno.env.get("LEAD_SPARK_SIGNUP_URL");
  const signupUrl = configuredSignupUrl && !/\/login\/?$/i.test(configuredSignupUrl)
    ? configuredSignupUrl
    : "https://rivetreach.com/contractor-leads";
  const contact = firstName(prospect.contact_name);
  const greeting = contact ? `Hi ${contact},` : "Hi there,";
  const trade = prospect.trade?.trim() || "contractor";
  const location = [prospect.city, prospect.state].filter(Boolean).join(", ");
  const locationPhrase = location ? ` in ${location}` : "";
  const company = prospect.company_name?.trim() || "your company";
  const objectiveText = (objective || "").toLowerCase();

  let subject = location
    ? `Opening ${trade} coverage in ${location}`
    : `Opening ${trade} coverage with Rivet Reach`;
  let middle = `Rivet Reach routes homeowner project requests to contractors by trade and service area. We are opening contractor coverage${locationPhrase}. Set your trade and territory, and when an eligible homeowner request matches ${company}'s coverage, the first matched lead is free. No card is required for that first lead. Continued access starts at $99/month, with no long-term contract.`;

  if (objectiveText.includes("follow") || objectiveText.includes("check") || objectiveText.includes("remind")) {
    subject = `Still interested in ${trade} leads${location ? ` around ${location}` : ""}?`;
    middle = `Just following up about Rivet Reach. We route homeowner project requests by trade and service area. Set your coverage, and when an eligible request matches, ${company}'s first matched lead is free. Continued access starts at $99/month after that first lead.`;
  } else if (objectiveText.includes("cost") || objectiveText.includes("quality") || objectiveText.includes("objection")) {
    subject = `${company}: see a matched lead before paying`;
    middle = `You should not have to pay first and hope a lead is worth it. ${company}'s first eligible matched lead is free. If the opportunity is useful, continued access starts at $99/month. If it is not a fit, you have not paid for that first lead or entered a long-term contract.`;
  } else if (objectiveText.includes("close") || objectiveText.includes("signup") || objectiveText.includes("sign up")) {
    subject = "Your first eligible Rivet Reach lead is still free";
    middle = `Create the contractor account, set your trade and territory, and Rivet Reach will match eligible homeowner requests to your coverage. ${company}'s first matched lead is free, with no card required for that first lead. Paid access starts at $99/month after it.`;
  }

  const roleLine = agentRole === "closer"
    ? "Create the contractor account here:"
    : "Take a look and create your contractor account here:";

  return {
    subject: subject.slice(0, 160),
    body: `${greeting}\n\n${middle}\n\n${roleLine} ${signupUrl}\n\nRivet Reach\nBuilt for contractors who would rather close jobs than chase leads.\n\nIf you'd rather not hear from us, just reply stop.`,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Supabase service configuration missing" }, 500);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const suppliedSecret = request.headers.get("x-sales-secret");
  const { data: expectedSecret, error: secretError } = await supabase.rpc("get_sales_orchestrator_secret");
  const cronAuthorized = Boolean(!secretError && expectedSecret && suppliedSecret === expectedSecret);

  let actor = "system_cron";
  if (!cronAuthorized) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return json({ error: "Admin access required" }, 403);
    actor = user.id;
  }

  const now = new Date().toISOString();
  const { data: activities, error } = await supabase
    .from("sales_activities")
    .select("id, prospect_id, enrollment_id, agent_role, channel, body, scheduled_for")
    .eq("status", "queued")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(25);

  if (error) return json({ error: error.message }, 500);
  if (!activities?.length) return json({ processed: 0, drafted: 0, skipped: 0, failed: 0, mode: "zero_cost", actor });

  let drafted = 0;
  let skipped = 0;
  let failed = 0;

  for (const activity of activities) {
    try {
      if (activity.channel !== "email") {
        await supabase.from("sales_activities").update({ status: "skipped", error_message: `Channel ${activity.channel} is not connected for drafting` }).eq("id", activity.id);
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
        await supabase.from("sales_activities").update({ status: "skipped", error_message: "Prospect is opted out, do-not-contact, or missing email" }).eq("id", activity.id);
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
        await supabase.from("sales_prospects").update({ opted_out: true, stage: "do_not_contact" }).eq("id", prospect.id);
        await supabase.from("sales_activities").update({ status: "skipped", error_message: "Blocked by global privacy suppression" }).eq("id", activity.id);
        if (activity.enrollment_id) {
          await supabase.from("sales_enrollments").update({ status: "opted_out", completed_at: now }).eq("id", activity.enrollment_id);
        }
        skipped++;
        continue;
      }

      const draft = buildTemplateEmail(prospect as Prospect, activity.body || "Introduce Rivet Reach", activity.agent_role);
      await supabase.from("sales_activities").update({ status: "drafted", subject: draft.subject, body: draft.body, error_message: null }).eq("id", activity.id);
      if (activity.enrollment_id) {
        await supabase.from("sales_enrollments").update({ last_error: null }).eq("id", activity.enrollment_id);
      }
      await supabase.from("sales_agent_events").insert({
        prospect_id: prospect.id,
        agent_role: activity.agent_role,
        event_type: "email_drafted",
        decision: { activity_id: activity.id, subject: draft.subject, reviewed_by: actor, generation_mode: "zero_cost_template" },
      });
      drafted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase.from("sales_activities").update({ status: "failed", error_message: message.slice(0, 1000) }).eq("id", activity.id);
      if (activity.enrollment_id) {
        await supabase.from("sales_enrollments").update({ last_error: message.slice(0, 1000) }).eq("id", activity.enrollment_id);
      }
      failed++;
    }
  }

  return json({ processed: activities.length, drafted, skipped, failed, mode: "zero_cost", actor });
});
