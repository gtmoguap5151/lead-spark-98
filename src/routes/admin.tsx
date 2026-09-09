import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  CircleDollarSign,
  CreditCard,
  DollarSign,
  Inbox,
  Power,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { STATUS_LABELS, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Revenue Dashboard — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Platform overview: contractors, leads, revenue, assignment and account status controls.",
      },
      { property: "og:title", content: "Owner Revenue Dashboard — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Manage contractors, assign leads and track platform metrics.",
      },
    ],
  }),
  component: AdminPage,
});

const moneyFromCents = (amountCents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountCents / 100);

const moneyFromDollars = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

function AdminPage() {
  const { state, updateContractor, assignLead, updatePrivacyRequestStatus, refresh, busy } =
    useApp();
  const { contractors, leads, adminFinancials, privacyRequests } = state;

  const [tab, setTab] = useState<"overview" | "contractors" | "leads" | "privacy">("overview");

  const stats = useMemo(() => {
    const activeContractors = contractors.filter((c) => c.active).length;
    const unassigned = leads.filter((l) => l.contractorId === null).length;
    const wonLeads = leads.filter((l) => l.status === "won");
    const contractorJobValue = wonLeads.reduce((sum, l) => sum + (l.jobValue ?? 0), 0);
    const payments = adminFinancials?.payments ?? [];
    const subscriptions = adminFinancials?.subscriptions ?? [];
    const successfulPayments = payments.filter((payment) => payment.status === "paid");
    const paidPayments = successfulPayments.filter(
      (payment) => payment.currency.toLowerCase() === "usd",
    );
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const revenue30DaysCents = paidPayments
      .filter((payment) => new Date(payment.createdAt).getTime() >= thirtyDaysAgo)
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const totalRevenueCents = paidPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
    const processedPayments = payments.filter((payment) =>
      ["paid", "failed"].includes(payment.status),
    );
    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active",
    );
    return {
      activeContractors,
      totalContractors: contractors.length,
      totalLeads: leads.length,
      unassigned,
      marketingOptIns: leads.filter((lead) => lead.marketingConsent).length,
      contractorJobValue,
      wonCount: wonLeads.length,
      totalRevenueCents,
      revenue30DaysCents,
      paidPaymentCount: paidPayments.length,
      processedPaymentCount: processedPayments.length,
      paymentSuccessRate: processedPayments.length
        ? Math.round((successfulPayments.length / processedPayments.length) * 100)
        : 0,
      activeSubscriptions: activeSubscriptions.length,
      trialingSubscriptions: subscriptions.filter(
        (subscription) => subscription.status === "trialing",
      ).length,
      pastDueSubscriptions: subscriptions.filter(
        (subscription) => subscription.status === "past_due",
      ).length,
      cancelingSubscriptions: activeSubscriptions.filter(
        (subscription) => subscription.cancelAtPeriodEnd,
      ).length,
    };
  }, [adminFinancials, contractors, leads]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) {
      counts[l.status] = (counts[l.status] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const recentPayments = adminFinancials?.payments.slice(0, 8) ?? [];

  return (
    <AppShell
      title="Owner Dashboard"
      subtitle="Revenue, subscriptions, leads & contractor controls"
      requireRole="admin"
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => {
            void refresh()
              .then(() => toast.success("Dashboard refreshed"))
              .catch(() => toast.error("Dashboard refresh failed"));
          }}
        >
          <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Refresh
        </Button>
      }
    >
      <div className="flex gap-2 border-b border-border pb-px">
        {(["overview", "contractors", "leads", "privacy"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-md px-4 py-2 text-sm font-semibold capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {t === "privacy" && privacyRequests.some((request) => request.status === "pending") ? (
              <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                {privacyRequests.filter((request) => request.status === "pending").length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "overview" && (
          <div className="space-y-5">
            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow text-primary">Your money</p>
                  <h2 className="mt-1 text-xl font-bold uppercase">Platform revenue</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Successful USD payments recorded by the Stripe webhook
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="Total collected"
                  value={moneyFromCents(stats.totalRevenueCents)}
                  hint={`${stats.paidPaymentCount} successful payment${stats.paidPaymentCount === 1 ? "" : "s"}`}
                  icon={CircleDollarSign}
                />
                <MetricCard
                  label="Last 30 days"
                  value={moneyFromCents(stats.revenue30DaysCents)}
                  hint="Actual collected revenue"
                  icon={DollarSign}
                />
                <MetricCard
                  label="Paying contractors"
                  value={stats.activeSubscriptions}
                  hint={`${stats.trialingSubscriptions} trialing`}
                  icon={Users}
                />
                <MetricCard
                  label="Payment success"
                  value={stats.processedPaymentCount ? `${stats.paymentSuccessRate}%` : "—"}
                  hint={
                    stats.processedPaymentCount
                      ? `${stats.processedPaymentCount} invoice attempts`
                      : "No invoice attempts yet"
                  }
                  icon={CreditCard}
                />
              </div>
            </section>

            <section>
              <div className="mb-3">
                <p className="eyebrow text-muted-foreground">Marketplace activity</p>
                <h2 className="mt-1 text-xl font-bold uppercase">Lead business</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="Contractors"
                  value={stats.totalContractors}
                  hint={`${stats.activeContractors} active`}
                  icon={Users}
                />
                <MetricCard
                  label="Total leads"
                  value={stats.totalLeads}
                  hint={`${stats.unassigned} unassigned · ${stats.marketingOptIns} email opt-ins`}
                  icon={Inbox}
                />
                <MetricCard
                  label="Jobs won"
                  value={stats.wonCount}
                  hint="Closed contracts"
                  icon={Building2}
                />
                <MetricCard
                  label="Contractor job value"
                  value={moneyFromDollars(stats.contractorJobValue)}
                  hint="Won work reported by contractors"
                  icon={DollarSign}
                />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <section className="surface-card p-5">
                <h2 className="text-xl font-bold uppercase">Subscription health</h2>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-success/10 p-3">
                    <p className="font-display text-3xl font-bold text-success">
                      {stats.activeSubscriptions}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <p className="font-display text-3xl font-bold text-accent-foreground">
                      {stats.trialingSubscriptions}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Trialing</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <p className="font-display text-3xl font-bold text-destructive">
                      {stats.pastDueSubscriptions}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Past due</p>
                  </div>
                </div>
                {stats.cancelingSubscriptions ? (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p>
                      {stats.cancelingSubscriptions} active subscription
                      {stats.cancelingSubscriptions === 1 ? " is" : "s are"} set to cancel.
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="surface-card p-5">
                <h2 className="text-xl font-bold uppercase">Leads by status</h2>
                <div className="mt-3 space-y-2">
                  {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => {
                    const count = statusBreakdown[s] ?? 0;
                    const pct = stats.totalLeads ? Math.round((count / stats.totalLeads) * 100) : 0;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <StatusBadge status={s} />
                        <span className="w-8 text-sm font-semibold">{count}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="surface-card overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-xl font-bold uppercase">Recent Stripe payments</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Successful and failed invoice events recorded by your webhook
                </p>
              </div>
              {recentPayments.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Contractor</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentPayments.map((payment) => {
                        const contractor = contractors.find(
                          (item) => item.userId === payment.userId,
                        );
                        const paid = payment.status === "paid";
                        return (
                          <tr key={payment.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold">
                              {contractor?.companyName ?? "Contractor account"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-1 text-xs font-bold capitalize",
                                  paid
                                    ? "bg-success/15 text-success"
                                    : "bg-destructive/10 text-destructive",
                                )}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                              {moneyFromCents(payment.amountCents, payment.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <CreditCard className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-semibold">No Stripe payments recorded yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The first successful or failed subscription invoice will appear here
                    automatically.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "contractors" && (
          <section className="surface-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Services</th>
                    <th className="px-4 py-3 font-semibold">Territory</th>
                    <th className="px-4 py-3 font-semibold">Leads</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contractors.map((c) => {
                    const contractorLeads = leads.filter((l) => l.contractorId === c.id);
                    return (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{c.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.contactName} · {c.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.city}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.serviceTypes.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-accent-foreground"
                              >
                                <Wrench className="size-2.5" /> {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs">{c.territoryZips.length} ZIPs</p>
                          <p className="max-w-32 truncate text-xs text-muted-foreground">
                            {c.territoryZips.join(", ")}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">{contractorLeads.length}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={c.active}
                              disabled={busy}
                              onCheckedChange={async (v) => {
                                const result = await updateContractor(c.id, { active: v });
                                if (!result.ok) {
                                  toast.error(result.error);
                                  return;
                                }
                                toast.success(
                                  v ? `${c.companyName} activated` : `${c.companyName} paused`,
                                );
                              }}
                              aria-label="Toggle contractor active"
                            />
                            <Power
                              className={cn(
                                "size-4",
                                c.active ? "text-success" : "text-muted-foreground",
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "leads" && (
          <section className="surface-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Lead</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">ZIP</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Assigned to</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((l) => {
                    return (
                      <tr key={l.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{l.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(l.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs">{l.serviceType}</td>
                        <td className="px-4 py-3 text-xs">{l.zip}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={l.contractorId ?? "unassigned"}
                            disabled={busy}
                            onValueChange={async (v) => {
                              const id = v === "unassigned" ? null : v;
                              const result = await assignLead(l.id, id);
                              if (!result.ok) {
                                toast.error(result.error);
                                return;
                              }
                              toast.success(
                                id
                                  ? `Lead assigned to ${contractors.find((c) => c.id === id)?.companyName}`
                                  : "Lead unassigned",
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {contractors.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.companyName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "privacy" && (
          <section className="surface-card overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-success" />
                <h2 className="text-xl font-bold uppercase">Privacy request queue</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Verify identity before disclosing, changing, or deleting personal information.
              </p>
            </div>
            {privacyRequests.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold">Request</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Received</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {privacyRequests.map((request) => (
                      <tr key={request.id} className="align-top hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-3 font-semibold capitalize">
                          {request.requestType.replaceAll("_", " ")}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            className="font-medium underline underline-offset-2"
                            href={`mailto:${request.email}`}
                          >
                            {request.email}
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="max-w-sm px-4 py-3 text-muted-foreground">
                          {request.details || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={request.status}
                            disabled={busy}
                            onValueChange={async (status) => {
                              const result = await updatePrivacyRequestStatus(
                                request.id,
                                status as typeof request.status,
                              );
                              if (!result.ok) {
                                toast.error(result.error);
                                return;
                              }
                              toast.success("Privacy request updated");
                            }}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="verifying">Verifying</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <ShieldCheck className="mx-auto size-9 text-success" />
                <p className="mt-3 font-semibold">No privacy requests</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New access, correction, deletion, and opt-out requests will appear here.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
