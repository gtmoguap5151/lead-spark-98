import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";

type Plan = {
  lookupKey: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
};

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Rivet Reach" },
      { name: "description", content: "Choose or manage your Rivet Reach subscription." },
    ],
  }),
  component: BillingPage,
});

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);

// Live Stripe price IDs for the two Rivet Reach plans (verified against the
// Stripe account). The subscription row stores only a price_id, so this map is
// how the billing page names the current plan. If a plan price ever changes in
// Stripe, update the matching entry here. Unknown price IDs fall back to the
// most recent payment amount, then to showing the date only.
const KNOWN_PLANS: Record<string, { name: string; amountCents: number; currency: string }> = {
  price_1UEm6QCZRLLet9af5RW5moSK: { name: "Growth", amountCents: 9900, currency: "usd" },
  price_1UEm6XCZRLLet9afyIAAJAwK: { name: "Pro", amountCents: 19900, currency: "usd" },
};

function BillingPage() {
  const { state, refresh } = useApp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const active =
    state.subscription && ["active", "trialing", "past_due"].includes(state.subscription.status);
  const payments = state.myPayments;
  const paidPayments = payments.filter(
    (payment) => payment.status === "paid" && payment.currency.toLowerCase() === "usd",
  );
  const totalPaidCents = paidPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const currentPlan = state.subscription?.priceId
    ? (KNOWN_PLANS[state.subscription.priceId] ?? null)
    : null;
  // Next charge: the plan amount when known, otherwise the most recent paid
  // amount (a monthly plan re-bills the same amount), otherwise date only.
  const lastPaid = paidPayments[0];
  const nextCharge = currentPlan
    ? { amountCents: currentPlan.amountCents, currency: currentPlan.currency }
    : lastPaid
      ? { amountCents: lastPaid.amountCents, currency: lastPaid.currency }
      : null;

  useEffect(() => {
    void supabase.functions
      .invoke<{ plans: Plan[] }>("billing-plans", { body: {} })
      .then(({ data, error }) => {
        if (error) throw error;
        setPlans(data?.plans ?? []);
      })
      .catch(() => toast.error("Plans are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Subscription received. Stripe is confirming your payment.");
      void refresh();
    }
  }, [refresh]);

  async function openFunction(name: "create-checkout" | "create-portal", body: object = {}) {
    setPending(name);
    const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
      name,
      {
        body,
      },
    );
    setPending(null);
    if (error || !data?.url) {
      toast.error(data?.error ?? error?.message ?? "Billing request failed.");
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <AppShell title="Billing" subtitle="Simple plans. Secure checkout. Cancel from your portal.">
      {state.subscription ? (
        <section className="surface-card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current plan
            </p>
            <p className="mt-1 text-xl font-bold capitalize">
              {currentPlan
                ? `${currentPlan.name} — ${money(currentPlan.amountCents, currentPlan.currency)}/month`
                : state.subscription.status.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              Status: {state.subscription.status.replace(/_/g, " ")}
            </p>
            {state.subscription.currentPeriodEnd ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {state.subscription.cancelAtPeriodEnd ? (
                  <>
                    Access ends{" "}
                    {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()} — no
                    further charges.
                  </>
                ) : (
                  <>
                    What&apos;s next:{" "}
                    {nextCharge
                      ? `${money(nextCharge.amountCents, nextCharge.currency)} on `
                      : "Renews "}
                    {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()}
                  </>
                )}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-muted-foreground">
              Total paid to date: {money(totalPaidCents, "usd")}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={pending !== null}
            onClick={() => void openFunction("create-portal")}
          >
            <CreditCard className="size-4" /> Manage billing
          </Button>
        </section>
      ) : null}

      {loading ? (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          Loading plans…
        </div>
      ) : plans.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <section key={plan.lookupKey} className="surface-card flex flex-col p-6">
              <h2 className="text-2xl font-bold uppercase">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                {plan.description ?? "Lead management and contractor growth tools."}
              </p>
              <p className="mt-5 text-4xl font-bold">
                {money(plan.amount, plan.currency)}
                <span className="text-base font-medium text-muted-foreground">
                  /{plan.interval}
                </span>
              </p>
              <ul className="my-6 space-y-2 text-sm">
                {[
                  "Secure Stripe checkout",
                  "Self-service billing portal",
                  "Cancel at period end",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-success" /> {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-auto h-12"
                disabled={pending !== null || Boolean(active)}
                onClick={() => void openFunction("create-checkout", { lookupKey: plan.lookupKey })}
              >
                {active
                  ? "Subscription active"
                  : pending === "create-checkout"
                    ? "Opening checkout…"
                    : "Choose plan"}
              </Button>
            </section>
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-center">
          <ShieldCheck className="mx-auto size-9 text-primary" />
          <h2 className="mt-3 text-xl font-bold uppercase">Plans coming online</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your Rivet Reach billing connection is ready. Plans will appear here as soon as pricing
            is published.
          </p>
        </div>
      )}

      <section className="surface-card mt-5 p-5">
        <h2 className="text-xl font-bold uppercase">Payment history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every subscription charge on this account, newest first.
        </p>
        {payments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No payments yet — your charges will show here once you subscribe.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p
                    className={
                      payment.status === "paid"
                        ? "text-xs font-semibold text-success"
                        : "text-xs font-semibold text-destructive"
                    }
                  >
                    {payment.status === "paid" ? "Paid" : "Failed"}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {money(payment.amountCents, payment.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
