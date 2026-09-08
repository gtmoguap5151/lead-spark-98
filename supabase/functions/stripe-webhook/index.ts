import Stripe from "npm:stripe@22.4.0";
import {
  env,
  json,
  safeError,
  stripe,
  supabaseAdmin,
} from "../_shared/billing.ts";

const subscriptionPeriodEnd = (subscription: Stripe.Subscription) => {
  const ends = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  return ends.length ? new Date(Math.max(...ends) * 1000).toISOString() : null;
};

const syncSubscription = async (subscription: Stripe.Subscription) => {
  const admin = supabaseAdmin();
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  let userId = subscription.metadata.supabase_user_id;
  if (!userId) {
    const { data, error } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (error) throw error;
    userId = data?.user_id;
  }
  if (!userId) {
    throw new Error(`No user mapping for Stripe customer ${customerId}`);
  }
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: priceId,
      current_period_end: subscriptionPeriodEnd(subscription),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing signature" }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      await request.text(),
      signature,
      env("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return json({ error: "Invalid signature" }, 400);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      case "checkout.session.completed": {
        const session = event.data.object;
        if (
          session.mode === "subscription" &&
          typeof session.subscription === "string"
        ) {
          await syncSubscription(
            await stripe().subscriptions.retrieve(session.subscription),
          );
        }
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;
        if (!customerId) break;
        const admin = supabaseAdmin();
        const { data: subscriptionRow, error: subscriptionError } = await admin
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (subscriptionError) throw subscriptionError;
        if (!subscriptionRow) break;
        const { error } = await admin.from("payments").upsert(
          {
            user_id: subscriptionRow.user_id,
            subscription_id: subscriptionRow.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_id: null,
            amount_cents: invoice.amount_paid || invoice.amount_due,
            currency: invoice.currency,
            status: event.type === "invoice.payment_succeeded"
              ? "paid"
              : "failed",
          },
          { onConflict: "stripe_invoice_id" },
        );
        if (error) throw error;
        break;
      }
    }
    return json({ received: true });
  } catch (error) {
    return safeError(error);
  }
});
