import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, DollarSign, Inbox, Users, Power, Wrench } from "lucide-react";
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
      { title: "Admin Console — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Platform overview: contractors, leads, revenue, assignment and account status controls.",
      },
      { property: "og:title", content: "Admin Console — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Manage contractors, assign leads and track platform metrics.",
      },
    ],
  }),
  component: AdminPage,
});

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function AdminPage() {
  const { state, updateContractor, assignLead, resetDemo } = useApp();
  const { contractors, leads } = state;

  const [tab, setTab] = useState<"overview" | "contractors" | "leads">("overview");

  const stats = useMemo(() => {
    const activeContractors = contractors.filter((c) => c.active).length;
    const unassigned = leads.filter((l) => l.contractorId === null).length;
    const wonLeads = leads.filter((l) => l.status === "won");
    const revenue = wonLeads.reduce((sum, l) => sum + (l.jobValue ?? 0), 0);
    return {
      activeContractors,
      totalContractors: contractors.length,
      totalLeads: leads.length,
      unassigned,
      revenue,
      wonCount: wonLeads.length,
    };
  }, [contractors, leads]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) {
      counts[l.status] = (counts[l.status] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  return (
    <AppShell
      title="Admin Console"
      subtitle="Platform overview & controls"
      requireRole="admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetDemo();
            toast.success("Demo data reset");
          }}
        >
          Reset demo data
        </Button>
      }
    >
      <div className="flex gap-2 border-b border-border pb-px">
        {(["overview", "contractors", "leads"] as const).map((t) => (
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
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "overview" && (
          <div className="space-y-4">
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
                hint={`${stats.unassigned} unassigned`}
                icon={Inbox}
              />
              <MetricCard
                label="Jobs won"
                value={stats.wonCount}
                hint="Closed contracts"
                icon={Building2}
              />
              <MetricCard
                label="Platform revenue"
                value={money(stats.revenue)}
                hint="Sum of job values"
                icon={DollarSign}
              />
            </div>

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
                      <span className="w-10 text-right text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
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
                          <p className="text-xs">
                            {c.territoryZips.length} ZIPs
                          </p>
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
                              onCheckedChange={(v) => {
                                updateContractor(c.id, { active: v });
                                toast.success(
                                  v ? `${c.companyName} activated` : `${c.companyName} paused`,
                                );
                              }}
                              aria-label="Toggle contractor active"
                            />
                            <Power className={cn("size-4", c.active ? "text-success" : "text-muted-foreground")} />
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
                            onValueChange={(v) => {
                              const id = v === "unassigned" ? null : v;
                              assignLead(l.id, id);
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
      </div>
    </AppShell>
  );
}
