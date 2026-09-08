import {
  corsHeaders,
  json,
  leadSparkLookupKeys,
  safeError,
  stripe,
} from "../_shared/billing.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const lookupKeys = leadSparkLookupKeys();
    if (!lookupKeys.length) return json({ plans: [] });
    const prices = await stripe().prices.list({
      active: true,
      lookup_keys: lookupKeys,
      type: "recurring",
      expand: ["data.product"],
      limit: 10,
    });
    const plans = prices.data
      .flatMap((price) => {
        const product = price.product;
        if (
          typeof product === "string" || product.deleted ||
          product.metadata.app !== "lead_spark_98"
        ) {
          return [];
        }
        return [{
          lookupKey: price.lookup_key,
          name: product.name,
          description: product.description,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval ?? "month",
        }];
      })
      .filter((plan) => plan.lookupKey && plan.amount != null);
    return json({ plans });
  } catch (error) {
    return safeError(error);
  }
});
