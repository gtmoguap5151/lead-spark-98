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
      { title: "Request a Free Estimate — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Tell us about your roofing, HVAC, plumbing or remodeling project and get matched with one vetted local contractor for a free estimate.",
      },
      { property: "og:title", content: "Request a Free Estimate — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Get matched with one vetted local contractor for a free, no-obligation estimate.",
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
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  serviceType: z.enum(SERVICE_TYPES, { message: "Select the service you need" }),
  timeline: z.enum(TIMELINES, { message: "Select your timeline" }),
  budget: z.string().trim().max(60).optional(),
  projectDetails: z
    .string()
    .trim()
    .min(10, "Tell us a little more about the project")
    .max(1000, "Keep it under 1000 characters"),
  isHomeowner: z.literal(true, { message: "We can only accept requests from property owners" }),
  isDecisionMaker: z.literal(true, { message: "Please confirm you can approve the work" }),
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
  const { submitLead } = useApp();
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    submitLead({
      ...parsed.data,
      budget: parsed.data.budget || undefined,
    });
    setSubmitted(true);
    toast.success("Request received — a local pro will reach out shortly.");
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-4 text-3xl font-bold uppercase">Request received</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;re matching your {form.serviceType.toLowerCase()} project in {form.zip} with a
            vetted local contractor. Expect a call at {form.phone} within one business day.
          </p>
          <Button asChild className="mt-8">
            <Link to="/">Back to home</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="eyebrow text-muted-foreground">Free · No obligation</p>
        <h1 className="mt-2 text-4xl font-bold uppercase leading-none">Request an Estimate</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Two minutes now saves five phone calls later. We match you with one local pro for your
          trade.
        </p>

        <form onSubmit={onSubmit} className="surface-card mt-6 space-y-5 p-5 sm:p-6" noValidate>
          <Field label="Full name" error={errors.name} htmlFor="name">
            <Input
              id="name"
              value={form.name}
              maxLength={100}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jordan Miller"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(614) 555-0134"
              />
            </Field>
            <Field label="Email" error={errors.email} htmlFor="email">
              <Input
                id="email"
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="ZIP code" error={errors.zip} htmlFor="zip">
              <Input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                value={form.zip}
                onChange={(e) => set("zip", e.target.value.replace(/\D/g, ""))}
                placeholder="43017"
              />
            </Field>
            <Field label="Service needed" error={errors.serviceType}>
              <Select
                value={form.serviceType}
                onValueChange={(v) => set("serviceType", v as ServiceType)}
              >
                <SelectTrigger>
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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Timeline" error={errors.timeline}>
              <Select value={form.timeline} onValueChange={(v) => set("timeline", v as Timeline)}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you need it?" />
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
            <Field label="Budget range (optional)" error={errors.budget}>
              <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a range" />
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

          <Field label="Project details" error={errors.projectDetails} htmlFor="details">
            <Textarea
              id="details"
              rows={4}
              maxLength={1000}
              value={form.projectDetails}
              onChange={(e) => set("projectDetails", e.target.value)}
              placeholder="Describe the work: what's happening, size of the home, anything a contractor should know."
            />
          </Field>

          <div className="space-y-3 rounded-lg bg-muted/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-success" /> Quick confirmation
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

          <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
            Request an Estimate
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your details go to one matched contractor. We never resell your information.
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
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
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
      <div className="flex items-start gap-2.5">
        <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
        <Label htmlFor={id} className="text-sm font-normal leading-snug">
          {label}
        </Label>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
