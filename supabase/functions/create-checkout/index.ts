import {
  appOrigin,
  corsHeaders,
  json,
  leadSparkLookupKeys,
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
    if (!user?.email) return json({ error: "Sign in required" }, 401);
    const body = (await request.json()) as { lookupKey?: unknown };
    const lookupKey = typeof body.lookupKey === "string" ? body.lookupKey : "";
    if (!leadSparkLookupKeys().includes(lookupKey)) {
      return json({ error: "Unknown plan" }, 400);
    }

    const client = stripe();
    const admin = supabaseAdmin();
    const { data: current, error: currentError } = await admin
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (currentError) throw currentError;
    if (current?.status && ["active", "trialing", "past_due"].includes(current.status)) {
      return json(
        {
          error: "Manage your existing subscription from the billing portal.",
        },
        409,
      );
    }

    let customerId = current?.stripe_customer_id;
    if (!customerId) {
      const customer = await client.customers.create({
        email: user.email,
        metadata: { app: "lead_spark_98", supabase_user_id: user.id },
      });
      customerId = customer.id;
      const { error } = await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          status: "inactive",
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    }

    const prices = await client.prices.list({
      active: true,
      lookup_keys: [lookupKey],
      type: "recurring",
      expand: ["data.product"],
      limit: 1,
    });
    const price = prices.data[0];
    if (
      !price ||
      typeof price.product === "string" ||
      price.product.deleted ||
      price.product.metadata.app !== "lead_spark_98"
    ) {
      return json({ error: "Plan is unavailable" }, 400);
    }

    const origin = appOrigin(request);
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const session = await client.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      integration_identifier: `lead_spark_98_${suffix}`,
      metadata: { app: "lead_spark_98", supabase_user_id: user.id },
      subscription_data: {
        metadata: { app: "lead_spark_98", supabase_user_id: user.id },
      },
    });
    return json({ url: session.url });
  } catch (error) {
    return safeError(error);
  }
});
