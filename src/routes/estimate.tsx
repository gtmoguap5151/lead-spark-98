import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/lib/store";
import { SERVICE_TYPES, TIMELINES, type ServiceType, type Timeline } from "@/lib/types";

export const Route = createFileRoute("/estimate")({
  head: () => ({
    meta: [
      { title: "Tell Us About Your Home Project — Lead Engine" },
      {
        name: "description",
        content:
          "A simple request form for homeowners who need roofing, HVAC, plumbing, remodeling or other home project help.",
      },
      { property: "og:title", content: "Tell Us About Your Home Project" },
      {
        property: "og:description",
        content: "Tell us what you need and we will route your request to one local contractor who serves your area.",
      },
    ],
  }),
  component: EstimatePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[\d\s()+-.]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  serviceType: z.enum(SERVICE_TYPES, { message: "Select the service you need" }),
  timeline: z.enum(TIMELINES, { message: "Select your timeline" }),
  budget: z.string().trim().max(60).optional(),
  projectDetails: z
    .string()
    .trim()
    .min(10, "Tell us a little more about the project")
    .max(1000, "Keep it under 1000 characters"),
  isHomeowner: z.literal(true, { message: "Please confirm that you own the property" }),
  isDecisionMaker: z.literal(true, { message: "Please confirm that you can approve the work" }),
});

const BUDGETS = [
  "Under $5,000",
  "$5,000 - $10,000",
  "$10,000 - $20,000",
  "$20,000 - $40,000",
  "$40,000+",
  "Not sure yet",
];

type Errors = Partial<Record<string, string>>;

function EstimatePage() {
  const { submitLead, busy } = useApp();
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    zip: "",
    serviceType: "" as ServiceType | "",
    timeline: "" as Timeline | "",
    budget: "",
    projectDetails: "",
    isHomeowner: false,
    isDecisionMaker: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted items below.");
      return;
    }
    setErrors({});
    const result = await submitLead({
      ...parsed.data,
      budget: parsed.data.budget || undefined,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Your request was received.");
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Your request was received</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We&apos;re routing your {form.serviceType.toLowerCase()} request in ZIP {form.zip} to a
            contractor who serves that area. They can use the phone number you provided to contact you.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            You are not obligated to hire anyone. Ask questions, discuss the project, and decide what
            is right for you.
          </p>
          <Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold">
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <p className="text-base font-bold uppercase tracking-wide text-muted-foreground">
          Free to submit · No obligation
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Tell us about your home project</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Fill out the simple form below. Your request will be routed to one contractor based on the
          service you need and your ZIP code.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-muted/45 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-success" />
            <div>
              <p className="text-lg font-bold">Your information stays focused on your project</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                Your request is routed to one matched contractor rather than sent to a long list of companies.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="surface-card mt-6 space-y-6 p-5 sm:p-7" noValidate>
          <Field label="Your full name" error={errors.name} htmlFor="name">
            <Input
              id="name"
              value={form.name}
              maxLength={100}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your first and last name"
              className="h-12 text-base"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Best phone number" error={errors.phone} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(555) 555-0123"
                className="h-12 text-base"
              />
            </Field>
            <Field label="Email address" error={errors.email} htmlFor="email">
              <Input
                id="email"
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="h-12 text-base"
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="ZIP code" error={errors.zip} htmlFor="zip">
              <Input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                value={form.zip}
                onChange={(e) => set("zip", e.target.value.replace(/\D/g, ""))}
                placeholder="Your 5-digit ZIP code"
                className="h-12 text-base"
              />
            </Field>
            <Field label="What kind of help do you need?" error={errors.serviceType}>
              <Select
                value={form.serviceType}
                onValueChange={(v) => set("serviceType", v as ServiceType)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="When would you like the work done?" error={errors.timeline}>
              <Select value={form.timeline} onValueChange={(v) => set("timeline", v as Timeline)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose a timeline" />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated budget (optional)" error={errors.budget}>
              <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                <SelectTrigger className="h-12 text-base">
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
            </Field>
          </div>

          <Field label="Tell us what is going on" error={errors.projectDetails} htmlFor="details">
            <Textarea
              id="details"
              rows={5}
              maxLength={1000}
              value={form.projectDetails}
              onChange={(e) => set("projectDetails", e.target.value)}
              placeholder="Example: My roof has started leaking over the back bedroom and I would like someone to look at it."
              className="text-base leading-relaxed"
            />
          </Field>

          <div className="space-y-4 rounded-xl bg-muted/60 p-5">
            <p className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="size-5 text-success" /> Two quick confirmations
            </p>
            <ConfirmRow
              id="owner"
              checked={form.isHomeowner}
              onChange={(v) => set("isHomeowner", v)}
              label="I own this property"
              error={errors.isHomeowner}
            />
            <ConfirmRow
              id="decision"
              checked={form.isDecisionMaker}
              onChange={(v) => set("isDecisionMaker", v)}
              label="I can approve the work and hire a contractor"
              error={errors.isDecisionMaker}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full text-lg font-bold"
            disabled={busy}
          >
            {busy ? "Sending Your Request…" : "Send My Project Request"}
          </Button>
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            Submitting the form does not obligate you to hire a contractor.
          </p>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base font-bold">
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

function ConfirmRow({
  id,
  checked,
  onChange,
  label,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5 size-5" />
        <Label htmlFor={id} className="text-base font-normal leading-relaxed">
          {label}
        </Label>
      </div>
      {error ? <p className="mt-1 text-sm font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
