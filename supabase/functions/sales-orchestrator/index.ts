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
  const { data: enrollments, error } = await supabase
    .from("sales_enrollments")
    .select("id, prospect_id, sequence_id, current_step, status, next_run_at")
    .eq("status", "active")
    .lte("next_run_at", now)
    .order("next_run_at", { ascending: true })
    .limit(50);

  if (error) return json({ error: error.message }, 500);
  if (!enrollments?.length) return json({ processed: 0, queued: 0 });

  let queued = 0;
  let skipped = 0;

  for (const enrollment of enrollments) {
    const { data: prospect } = await supabase
      .from("sales_prospects")
      .select("id, email, opted_out, stage")
      .eq("id", enrollment.prospect_id)
      .maybeSingle();

    if (!prospect || prospect.opted_out || prospect.stage === "do_not_contact") {
      await supabase
        .from("sales_enrollments")
        .update({ status: "opted_out", completed_at: now })
        .eq("id", enrollment.id);
      skipped++;
      continue;
    }

    if (prospect.email) {
      const normalizedEmail = prospect.email.trim().toLowerCase();
      const { data: suppressions, error: suppressionError } = await supabase
        .from("privacy_suppressions")
        .select("suppression_type")
        .eq("email", normalizedEmail)
        .limit(1);
      if (suppressionError) {
        await supabase
          .from("sales_enrollments")
          .update({ last_error: suppressionError.message })
          .eq("id", enrollment.id);
        continue;
      }
      if (suppressions?.length) {
        await supabase
          .from("sales_prospects")
          .update({ opted_out: true, stage: "do_not_contact" })
          .eq("id", prospect.id);
        await supabase
          .from("sales_enrollments")
          .update({ status: "opted_out", completed_at: now, last_error: null })
          .eq("id", enrollment.id);
        skipped++;
        continue;
      }
    }

    const { data: step, error: stepError } = await supabase
      .from("sales_sequence_steps")
      .select("step_number, agent_role, channel, delay_minutes, objective, template_key")
      .eq("sequence_id", enrollment.sequence_id)
      .eq("step_number", enrollment.current_step)
      .maybeSingle();

    if (stepError) continue;
    if (!step) {
      await supabase
        .from("sales_enrollments")
        .update({ status: "completed", completed_at: now })
        .eq("id", enrollment.id);
      continue;
    }

    const { error: activityError } = await supabase.from("sales_activities").insert({
      prospect_id: enrollment.prospect_id,
      enrollment_id: enrollment.id,
      agent_role: step.agent_role,
      channel: step.channel,
      direction: step.channel === "internal" ? "internal" : "outbound",
      status: "queued",
      scheduled_for: now,
      body: step.objective,
    });

    if (activityError) {
      await supabase
        .from("sales_enrollments")
        .update({ last_error: activityError.message })
        .eq("id", enrollment.id);
      continue;
    }

    await supabase.from("sales_agent_events").insert({
      prospect_id: enrollment.prospect_id,
      agent_role: step.agent_role,
      event_type: "sequence_step_queued",
      decision: {
        enrollment_id: enrollment.id,
        step_number: step.step_number,
        template_key: step.template_key,
        channel: step.channel,
      },
    });

    const { data: nextStep } = await supabase
      .from("sales_sequence_steps")
      .select("step_number, delay_minutes")
      .eq("sequence_id", enrollment.sequence_id)
      .eq("step_number", enrollment.current_step + 1)
      .maybeSingle();

    if (!nextStep) {
      await supabase
        .from("sales_enrollments")
        .update({
          current_step: enrollment.current_step + 1,
          status: "completed",
          completed_at: now,
          last_error: null,
        })
        .eq("id", enrollment.id);
    } else {
      const nextRun = new Date(Date.now() + nextStep.delay_minutes * 60_000).toISOString();
      await supabase
        .from("sales_enrollments")
        .update({ current_step: nextStep.step_number, next_run_at: nextRun, last_error: null })
        .eq("id", enrollment.id);
    }

    queued++;
  }

  return json({ processed: enrollments.length, queued, skipped });
});
