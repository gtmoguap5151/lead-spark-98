import {
  appOrigin,
  corsHeaders,
  json,
  safeError,
  stripe,
  supabaseAdmin,
  userFromRequest,
} from "../_shared/billing.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  try {
    const user = await userFromRequest(request);
    if (!user) return json({ error: "Sign in required" }, 401);
    const { data, error } = await supabaseAdmin()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data?.stripe_customer_id) {
      return json({ error: "No billing account found" }, 404);
    }
    const session = await stripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${appOrigin(request)}/billing`,
    });
    return json({ url: session.url });
  } catch (error) {
    return safeError(error);
  }
});
