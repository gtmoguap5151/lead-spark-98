import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LockKeyhole, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/types";
import { useApp, useContractorLeads } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads/")({
  head: () => ({
    meta: [
      { title: "Lead Inbox — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Every qualified lead in your territory with contact details, service type, timeline and pipeline status.",
      },
      { property: "og:title", content: "Lead Inbox — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Filter and work your exclusive home-services leads by status.",
      },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const leads = useContractorLeads();
  const { state } = useApp();
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const hasPaidAccess = Boolean(
    state.subscription && ["active", "trialing"].includes(state.subscription.status),
  );
  const freeLeadUsed = leads.length >= 1 && !hasPaidAccess;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (filter === "all" || l.status === filter) &&
        (!q || [l.name, l.zip, l.serviceType, l.phone].some((v) => v.toLowerCase().includes(q))),
    );
  }, [leads, filter, query]);

  return (
    <AppShell title="Lead Inbox" subtitle={`${leads.length} leads delivered to your territory`}>
      {freeLeadUsed ? (
        <section className="surface-card mb-4 border-primary/40 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Free lead used
              </p>
              <h2 className="mt-1 text-xl font-bold">Unlock your next lead</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your first real lead was free. New lead details stay locked until you activate a
                paid plan.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button asChild className="h-11">
                  <Link to="/billing">View Growth & Pro plans</Link>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground">
                  Growth $99/mo · Pro $249/mo
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, ZIP, service or phone"
          className="pl-9"
        />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
            <span className="ml-1.5 opacity-70">
              {s === "all" ? leads.length : leads.filter((l) => l.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <li className="surface-card p-8 text-center text-sm text-muted-foreground">
            No leads match this filter yet.
          </li>
        ) : (
          visible.map((l) => (
            <li key={l.id}>
              <Link
                to="/leads/$leadId"
                params={{ leadId: l.id }}
                className="surface-card block p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">{l.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.serviceType} · ZIP {l.zip}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {l.projectDetails}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{l.phone}</span>
                  <span>{l.timeline}</span>
                  {l.budget ? <span>{l.budget}</span> : null}
                  <span>
                    {new Date(l.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </AppShell>
  );
}
