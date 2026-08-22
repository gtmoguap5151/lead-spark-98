import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarCheck, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/store";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads/$leadId")({
  head: () => ({
    meta: [
      { title: "Lead Detail — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Full lead detail with homeowner contact info, project scope, timeline, notes and status workflow.",
      },
      { property: "og:title", content: "Lead Detail — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Work a lead from new to won with notes, appointments and job value.",
      },
    ],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { leadId } = useParams({ from: "/leads/$leadId" });
  const { state, updateLeadStatus, addNote } = useApp();
  const lead = state.leads.find((l) => l.id === leadId);
  const [note, setNote] = useState("");
  const [appointment, setAppointment] = useState("");
  const [jobValue, setJobValue] = useState("");

  if (!lead) {
    return (
      <AppShell title="Lead not found">
        <div className="surface-card p-8 text-center">
          <p className="text-sm text-muted-foreground">This lead is no longer in your inbox.</p>
          <Button asChild className="mt-4">
            <Link to="/leads">Back to inbox</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const setStatus = (status: LeadStatus) => {
    updateLeadStatus(lead.id, status);
    toast.success(`Marked as ${STATUS_LABELS[status]}`);
  };

  return (
    <AppShell
      title={lead.name}
      subtitle={`${lead.serviceType} · ZIP ${lead.zip}`}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/leads">
            <ArrowLeft className="size-4" /> Inbox
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold uppercase">Contact</h2>
              <StatusBadge status={lead.status} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${lead.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 rounded-md bg-muted/60 p-3 text-sm font-semibold"
              >
                <Phone className="size-4 text-primary" /> {lead.phone}
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 truncate rounded-md bg-muted/60 p-3 text-sm font-semibold"
              >
                <Mail className="size-4 text-primary" />
                <span className="truncate">{lead.email}</span>
              </a>
              <p className="flex items-center gap-2 rounded-md bg-muted/60 p-3 text-sm font-semibold">
                <MapPin className="size-4 text-primary" /> ZIP {lead.zip}
              </p>
              <p className="flex items-center gap-2 rounded-md bg-muted/60 p-3 text-sm font-semibold">
                <CalendarCheck className="size-4 text-primary" /> {lead.timeline}
              </p>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck
                className={cn("size-4", lead.isHomeowner && lead.isDecisionMaker ? "text-success" : "text-destructive")}
              />
              {lead.isHomeowner && lead.isDecisionMaker
                ? "Confirmed property owner and decision maker"
                : "Not confirmed as owner/decision maker"}
            </p>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Project details</h2>
            <p className="mt-2 text-sm leading-relaxed">{lead.projectDetails}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>Budget: {lead.budget ?? "Not provided"}</span>
              <span>Received: {new Date(lead.createdAt).toLocaleString("en-US")}</span>
            </div>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Notes</h2>
            <ul className="mt-3 space-y-2">
              {lead.notes.length === 0 ? (
                <li className="text-sm text-muted-foreground">No notes yet.</li>
              ) : (
                lead.notes.map((n) => (
                  <li key={n.id} className="rounded-md bg-muted/60 p-3 text-sm">
                    <p>{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("en-US")}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 space-y-2">
              <Textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a call, a quote sent, or next step…"
              />
              <Button
                onClick={() => {
                  const body = note.trim();
                  if (!body) return;
                  addNote(lead.id, body);
                  setNote("");
                  toast.success("Note added");
                }}
              >
                Add note
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Status workflow</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={lead.status === s ? "default" : "outline"}
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </section>

          <section className="surface-card space-y-3 p-5">
            <h2 className="text-xl font-bold uppercase">Book an estimate</h2>
            <div className="space-y-1.5">
              <Label htmlFor="appt">Appointment date & time</Label>
              <Input
                id="appt"
                type="datetime-local"
                value={
                  appointment ||
                  (lead.appointmentAt ? lead.appointmentAt.slice(0, 16) : "")
                }
                onChange={(e) => setAppointment(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!appointment) {
                  toast.error("Pick a date and time first.");
                  return;
                }
                updateLeadStatus(lead.id, "appointment", {
                  appointmentAt: new Date(appointment).toISOString(),
                });
                toast.success("Appointment booked");
              }}
            >
              Save appointment
            </Button>
          </section>

          <section className="surface-card space-y-3 p-5">
            <h2 className="text-xl font-bold uppercase">Close the job</h2>
            <div className="space-y-1.5">
              <Label htmlFor="value">Job value ($)</Label>
              <Input
                id="value"
                inputMode="numeric"
                value={jobValue || (lead.jobValue ? String(lead.jobValue) : "")}
                onChange={(e) => setJobValue(e.target.value.replace(/\D/g, ""))}
                placeholder="19400"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const v = Number(jobValue || lead.jobValue || 0);
                if (!v) {
                  toast.error("Enter the contract value.");
                  return;
                }
                updateLeadStatus(lead.id, "won", { jobValue: v });
                toast.success("Job marked as won");
              }}
            >
              Mark as won
            </Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
