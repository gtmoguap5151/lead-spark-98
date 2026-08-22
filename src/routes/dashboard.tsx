import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, DollarSign, Inbox, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useContractorLeads } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Contractor Dashboard — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Track new leads, qualified leads, booked appointments and closed revenue in one mobile-first contractor dashboard.",
      },
      { property: "og:title", content: "Contractor Dashboard — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "New leads, qualified leads, appointments and revenue at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function DashboardPage() {
  const leads = useContractorLeads();

  const newLeads = leads.filter((l) => l.status === "new");
  const qualified = leads.filter((l) => l.status === "qualified");
  const appointments = leads
    .filter((l) => l.status === "appointment")
    .sort((a, b) => (a.appointmentAt ?? "").localeCompare(b.appointmentAt ?? ""));
  const won = leads.filter((l) => l.status === "won");
  const revenue = won.reduce((sum, l) => sum + (l.jobValue ?? 0), 0);
  const closeRate = leads.length ? Math.round((won.length / leads.length) * 100) : 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Your pipeline today"
      actions={
        <Button asChild variant="secondary">
          <Link to="/leads">Open lead inbox</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="New leads" value={newLeads.length} hint="Awaiting first call" icon={Inbox} />
        <MetricCard
          label="Qualified"
          value={qualified.length}
          hint="Budget & ownership confirmed"
          icon={Sparkles}
        />
        <MetricCard
          label="Appointments"
          value={appointments.length}
          hint="Estimates on the calendar"
          icon={CalendarCheck}
        />
        <MetricCard
          label="Revenue won"
          value={money(revenue)}
          hint={`${won.length} jobs · ${closeRate}% close rate`}
          icon={DollarSign}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase">New leads</h2>
            <Link to="/leads" className="text-sm font-semibold text-accent-foreground underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {newLeads.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">
                No new leads right now. Nice work clearing the inbox.
              </li>
            ) : (
              newLeads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link
                    to="/leads/$leadId"
                    params={{ leadId: l.id }}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.serviceType} · {l.zip} · {l.timeline}
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-xl font-bold uppercase">Upcoming appointments</h2>
          <ul className="mt-3 divide-y divide-border">
            {appointments.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">No estimates booked yet.</li>
            ) : (
              appointments.map((l) => (
                <li key={l.id}>
                  <Link
                    to="/leads/$leadId"
                    params={{ leadId: l.id }}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.serviceType} · {l.zip}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-xs font-semibold">
                      {l.appointmentAt
                        ? new Date(l.appointmentAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                          })
                        : "TBD"}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="surface-card mt-4 flex flex-wrap items-center gap-4 p-5">
        <span className="flex size-10 items-center justify-center rounded-md bg-success/15 text-success">
          <TrendingUp className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">
            {money(won.length ? Math.round(revenue / won.length) : 0)} average job value
          </p>
          <p className="text-sm text-muted-foreground">
            Based on {won.length} closed jobs from {leads.length} delivered leads.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
