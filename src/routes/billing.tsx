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
      { title: "Billing — Lead Engine" },
      { name: "description", content: "Choose or manage your Lead Engine subscription." },
    ],
  }),
  component: BillingPage,
});

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);

function BillingPage() {
  const { state, refresh } = useApp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const active =
    state.subscription && ["active", "trialing", "past_due"].includes(state.subscription.status);

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
              Current status
            </p>
            <p className="mt-1 text-xl font-bold capitalize">
              {state.subscription.status.replace(/_/g, " ")}
            </p>
            {state.subscription.currentPeriodEnd ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {state.subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"}{" "}
                {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            ) : null}
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
            Your billing connection is ready. Lead Engine plans will appear here as soon as pricing
            is published.
          </p>
        </div>
      )}
    </AppShell>
  );
}
