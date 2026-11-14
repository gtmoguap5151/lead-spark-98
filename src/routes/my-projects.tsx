import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, FolderPlus, Handshake, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  HomeownerStatusBadge,
  MatchedContractor,
} from "@/components/HomeownerProjectCard";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { useApp, useHomeownerLeads } from "@/lib/store";
import { HOMEOWNER_STATUS_HELP } from "@/lib/types";

export const Route = createFileRoute("/my-projects")({
  head: () => ({
    meta: [
      { title: "My Projects — Rivet Reach" },
      {
        name: "description",
        content:
          "Track your home projects, see your match status, and view your matched contractor in one place.",
      },
      { property: "og:title", content: "My Projects — Rivet Reach" },
      {
        property: "og:description",
        content: "Your home projects and their match status.",
      },
    ],
  }),
  component: MyProjectsPage,
});

function MyProjectsPage() {
  const leads = useHomeownerLeads();
  const { state } = useApp();

  const inLine = leads.filter((l) => l.status === "new");
  const matched = leads.filter((l) => l.contractorId);
  const appointments = leads.filter((l) => l.status === "appointment");
  const booked = leads.filter((l) => l.status === "won");

  return (
    <AppShell
      title="My Projects"
      subtitle="Your home projects and their matches"
      requireRole="homeowner"
      actions={
        <Button asChild variant="secondary">
          <Link to="/estimate">Start a new project</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Projects"
          value={leads.length}
          hint="Submitted with this email"
          icon={ClipboardList}
        />
        <MetricCard
          label="In line"
          value={inLine.length}
          hint="Waiting to be matched"
          icon={FolderPlus}
        />
        <MetricCard
          label="Matched"
          value={matched.length}
          hint="Contractor assigned"
          icon={Handshake}
        />
        <MetricCard
          label="Visits scheduled"
          value={appointments.length}
          hint="Estimates on the calendar"
          icon={CalendarCheck}
        />
      </div>

      <section className="surface-card mt-5 flex flex-wrap items-start gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">How matching works</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Every project is hand-matched to one verified local contractor — your request is
            never sold to a crowd of companies. When a match is made, the contractor&apos;s
            name and phone number appear on your project. You are never obligated to hire
            anyone.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Projects you submitted before creating this account show up here automatically
            when they use this same email address.
          </p>
        </div>
      </section>

      {booked.length > 0 ? (
        <p className="mt-5 text-sm font-medium text-muted-foreground">
          {booked.length} {booked.length === 1 ? "job" : "jobs"} booked through Rivet Reach.
        </p>
      ) : null}

      <section className="mt-5">
        <h2 className="text-xl font-bold uppercase">Your projects</h2>
        {leads.length === 0 ? (
          <div className="surface-card mt-3 p-6 text-center">
            <p className="font-semibold">No projects yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Tell us about a home project and we&apos;ll hand-match it to a verified local
              contractor. It&apos;s free, and there&apos;s no obligation to hire anyone.
            </p>
            <Button asChild size="lg" className="mt-5 h-12 px-6">
              <Link to="/estimate">Tell us about your project</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-3 space-y-4">
            {leads.map((lead) => {
              const contractor =
                state.contractors.find((c) => c.id === lead.contractorId) ?? null;
              return (
                <li key={lead.id} className="surface-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to="/my-projects/$projectId"
                        params={{ projectId: lead.id }}
                        className="text-lg font-bold hover:underline"
                      >
                        {lead.serviceType} · {lead.zip}
                      </Link>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Submitted{" "}
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · {lead.timeline}
                        {lead.budget ? ` · ${lead.budget}` : ""}
                      </p>
                    </div>
                    <HomeownerStatusBadge status={lead.status} />
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {lead.projectDetails}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {HOMEOWNER_STATUS_HELP[lead.status]}
                  </p>

                  <div className="mt-4">
                    <MatchedContractor contractor={contractor} />
                  </div>

                  <div className="mt-4">
                    <Link
                      to="/my-projects/$projectId"
                      params={{ projectId: lead.id }}
                      className="text-sm font-semibold text-accent-foreground underline"
                    >
                      View or update this project
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
