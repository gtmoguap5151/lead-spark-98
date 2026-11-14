import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  HomeownerStatusBadge,
  MatchedContractor,
} from "@/components/HomeownerProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp, useHomeownerLeads } from "@/lib/store";
import {
  HOMEOWNER_STATUS_HELP,
  TIMELINES,
  type Timeline,
} from "@/lib/types";

export const Route = createFileRoute("/my-projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project Details — Rivet Reach" },
      {
        name: "description",
        content: "View your project status, your matched contractor, and update your project details.",
      },
      { property: "og:title", content: "Project Details — Rivet Reach" },
    ],
  }),
  component: MyProjectDetailPage,
});

const BUDGETS = [
  "Under $5,000",
  "$5,000 - $10,000",
  "$10,000 - $20,000",
  "$20,000 - $40,000",
  "$40,000+",
  "Not sure yet",
];

const editSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[\d\s()+-.]+$/, "Please enter a valid phone number"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  timeline: z.enum(TIMELINES, { message: "Select your timeline" }),
  budget: z.string().trim().max(60).optional(),
  projectDetails: z
    .string()
    .trim()
    .min(10, "Tell us a little more about the project")
    .max(1000, "Keep it under 1000 characters"),
});

function MyProjectDetailPage() {
  const { projectId } = Route.useParams();
  const leads = useHomeownerLeads();
  const { state, updateMyProject, busy } = useApp();
  const lead = leads.find((l) => l.id === projectId);

  const [form, setForm] = useState(() =>
    lead
      ? {
          name: lead.name,
          phone: lead.phone,
          zip: lead.zip,
          timeline: lead.timeline,
          budget: lead.budget ?? "",
          projectDetails: lead.projectDetails,
        }
      : null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!lead || !form) {
    return (
      <AppShell title="Project" subtitle="Project details" requireRole="homeowner">
        <div className="surface-card p-6 text-center">
          <p className="font-semibold">We couldn&apos;t find that project</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been submitted with a different email address.
          </p>
          <Button asChild className="mt-5">
            <Link to="/my-projects">Back to My Projects</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const contractor = state.contractors.find((c) => c.id === lead.contractorId) ?? null;
  const leadId = lead.id;
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const parsed = editSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted items below.");
      return;
    }
    setErrors({});
    const result = await updateMyProject(leadId, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      zip: parsed.data.zip,
      timeline: parsed.data.timeline,
      budget: parsed.data.budget || "",
      projectDetails: parsed.data.projectDetails,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Project updated");
  }

  return (
    <AppShell
      title={`${lead.serviceType} · ${lead.zip}`}
      subtitle={`Submitted ${new Date(lead.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`}
      requireRole="homeowner"
      actions={
        <Button asChild variant="secondary">
          <Link to="/my-projects">All projects</Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold uppercase">Status</h2>
            <HomeownerStatusBadge status={lead.status} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {HOMEOWNER_STATUS_HELP[lead.status]}
          </p>
          {lead.status === "appointment" && lead.appointmentAt ? (
            <p className="mt-2 text-sm font-semibold">
              Visit scheduled:{" "}
              {new Date(lead.appointmentAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          ) : null}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-semibold">{lead.serviceType}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Timeline</dt>
              <dd className="font-semibold">{lead.timeline}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-semibold">{lead.budget ?? "Not set"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Contact email</dt>
              <dd className="font-semibold">{lead.email}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-xl font-bold uppercase">Your matched contractor</h2>
          <div className="mt-3">
            <MatchedContractor contractor={contractor} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You are never obligated to hire anyone. Ask questions, discuss the project, and
            decide what is right for you.
          </p>
        </section>
      </div>

      <section className="surface-card mt-4 p-5">
        <h2 className="text-xl font-bold uppercase">Update this project</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change your project details any time. Status updates come from your matched
          contractor.
        </p>
        <form onSubmit={onSave} className="mt-4 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Your full name</Label>
              <Input
                id="edit-name"
                value={form.name}
                maxLength={100}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name ? (
                <p className="text-xs font-medium text-destructive">{errors.name}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Best phone number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={form.phone}
                maxLength={20}
                onChange={(e) => set("phone", e.target.value)}
              />
              {errors.phone ? (
                <p className="text-xs font-medium text-destructive">{errors.phone}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-zip">ZIP code</Label>
              <Input
                id="edit-zip"
                inputMode="numeric"
                maxLength={5}
                value={form.zip}
                onChange={(e) => set("zip", e.target.value.replace(/\D/g, ""))}
              />
              {errors.zip ? (
                <p className="text-xs font-medium text-destructive">{errors.zip}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>When would you like the work done?</Label>
              <Select
                value={form.timeline}
                onValueChange={(v) => set("timeline", v as Timeline)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeline ? (
                <p className="text-xs font-medium text-destructive">{errors.timeline}</p>
              ) : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Estimated budget (optional)</Label>
              <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Not sure is okay" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGETS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-details">Tell us what is going on</Label>
            <Textarea
              id="edit-details"
              rows={5}
              maxLength={1000}
              value={form.projectDetails}
              onChange={(e) => set("projectDetails", e.target.value)}
            />
            {errors.projectDetails ? (
              <p className="text-xs font-medium text-destructive">{errors.projectDetails}</p>
            ) : null}
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 font-semibold" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Service type can&apos;t be changed here — if the job is a different trade,{" "}
        <Link to="/estimate" className="font-semibold underline">
          submit it as a new project
        </Link>
        .
      </p>
    </AppShell>
  );
}
