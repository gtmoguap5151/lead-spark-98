import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
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
import { useApp } from "@/lib/store";
import type { PrivacyRequest } from "@/lib/types";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Data Choices — RivetReach" },
      {
        name: "description",
        content:
          "How RivetReach protects homeowner and contractor information, plus a simple privacy request form.",
      },
    ],
  }),
  component: PrivacyPage,
});

const requestSchema = z.object({
  email: z.string().trim().email("Enter the email used with RivetReach").max(255),
  requestType: z.enum([
    "access",
    "correct",
    "delete",
    "portable_copy",
    "marketing_opt_out",
    "sale_opt_out",
    "targeted_advertising_opt_out",
    "profiling_opt_out",
    "appeal",
    "other",
  ]),
  details: z.string().trim().max(1000, "Keep the note under 1000 characters").optional(),
  website: z.string().max(0).optional(),
});

const requestLabels: Record<PrivacyRequest["requestType"], string> = {
  access: "Access my data",
  correct: "Correct my data",
  delete: "Delete my data",
  portable_copy: "Get a portable copy",
  marketing_opt_out: "Stop marketing emails",
  sale_opt_out: "Opt out of a sale of data",
  targeted_advertising_opt_out: "Opt out of targeted advertising",
  profiling_opt_out: "Opt out of significant profiling",
  appeal: "Appeal a privacy decision",
  other: "Another privacy question",
};

function PrivacyPage() {
  const { submitPrivacyRequest, busy } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: "",
    requestType: "access" as PrivacyRequest["requestType"],
    details: "",
    website: "",
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = requestSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted information.");
      return;
    }
    setErrors({});
    const result = await submitPrivacyRequest(parsed.data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Your privacy request was received.");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="eyebrow text-success">Privacy first</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
          Privacy &amp; Data Choices
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          RivetReach uses personal information to connect a homeowner with one relevant contractor.
          We serve users across the United States. We do not quietly sell contact lists or broadcast
          a request to a crowd of companies.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective September 9, 2026</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <PrivacyCard
            icon={ShieldCheck}
            title="Focused sharing"
            body="A submitted request and contact details go to one matched contractor for that project."
          />
          <PrivacyCard
            icon={LockKeyhole}
            title="Restricted access"
            body="Database permissions limit lead access to authorized admins and the eligible matched contractor."
          />
          <PrivacyCard
            icon={Database}
            title="Separate permission"
            body="Project-contact consent is required; RivetReach marketing email permission is optional and off by default."
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-card space-y-7 p-6 sm:p-7">
            <PrivacySection title="Information we collect">
              When you request a project match, we collect your name, phone, email, ZIP code,
              requested trade, timeline, budget if supplied, and project description. We also record
              the consent language version and time. Campaign tags and the referring site hostname
              may be recorded so we can measure which marketing produces useful requests. Contractor
              accounts include business and contact details, territory, services, and any optional
              license or registration number provided. Please do not submit medical information,
              financial account numbers, Social Security numbers, or government identification.
            </PrivacySection>

            <PrivacySection title="How we use and share it">
              We use the information to validate, route, support, secure, and measure your requested
              match. One eligible contractor may receive it so they can contact you about that
              project. Contractors may pay RivetReach for platform or matched-lead access; that
              supports the free homeowner request service. We do not sell homeowner lists for
              unrelated advertising or data-broker purposes. Service providers that host, secure,
              support, or process payments for the platform may handle only the information needed
              for those functions.
            </PrivacySection>

            <PrivacySection title="Sale, targeted advertising, and profiling">
              RivetReach does not currently sell personal information, use it for cross-context
              targeted advertising, or make legal or similarly significant decisions through
              profiling. The request form still provides durable opt-outs for these activities so a
              future marketing system cannot silently override your choice.
            </PrivacySection>

            <PrivacySection title="Marketing choices">
              Promotional RivetReach email is sent only when you select the separate optional
              checkbox. Project-related messages from the matched contractor are part of the match
              you requested, not permission for unrelated advertising. You can withdraw optional
              marketing permission below.
            </PrivacySection>

            <PrivacySection title="Retention and security">
              We keep identifiable request data only while reasonably needed to provide the match,
              operate quality and dispute controls, meet legal obligations, and protect the service;
              afterward it is deleted or de-identified. We use encrypted connections, server-side
              input validation, short-window abuse controls, and role-based database access. No
              online service can promise perfect security.
            </PrivacySection>

            <PrivacySection title="Your choices">
              We offer every U.S. user the ability to request access, correction, deletion, a
              portable copy, or an opt-out of marketing, sale, targeted advertising, and significant
              profiling. We verify identity before disclosing or deleting information. Some records
              may be retained where law or a legitimate fraud, billing, security, or dispute need
              requires it. If a request is denied, you may appeal using this form.
            </PrivacySection>

            <PrivacySection title="Response times and Kentucky residents">
              We target a response within 45 days for privacy requests and within 60 days for an
              appeal, applying those Kentucky Consumer Data Protection Act timelines nationwide. A
              permitted 45-day extension may be used with notice. Kentucky residents whose appeal is
              denied may also contact the{" "}
              <a
                href="https://www.ag.ky.gov/Resources/Consumer-Resources/Consumers/Pages/Consumer-Complaints.aspx"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground underline underline-offset-2"
              >
                Kentucky Attorney General
              </a>
              . Other state rights remain available where applicable.
            </PrivacySection>

            <PrivacySection title="Children and de-identified data">
              The service is for adults age 18 or older and is not directed to children. We do not
              knowingly collect project requests from children. When information is de-identified,
              we publicly commit to maintain it in de-identified form and not attempt to reidentify
              it except as permitted by law to test privacy safeguards.
            </PrivacySection>
          </section>

          <section className="surface-card h-fit p-6 sm:p-7">
            {submitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto size-12 text-success" />
                <h2 className="mt-4 text-2xl font-bold">Request received</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  We will verify the request using the email address you provided before making
                  changes.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another request
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div>
                  <p className="eyebrow text-primary">Control your data</p>
                  <h2 className="mt-1 text-2xl font-bold">Make a privacy request</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Use the same email address you used for a project request or contractor account.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-email" className="font-bold">
                    Email address
                  </Label>
                  <Input
                    id="privacy-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  {errors.email ? (
                    <p className="text-sm font-semibold text-destructive">{errors.email}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Request</Label>
                  <Select
                    value={form.requestType}
                    onValueChange={(requestType) =>
                      setForm((current) => ({
                        ...current,
                        requestType: requestType as PrivacyRequest["requestType"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(requestLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-details" className="font-bold">
                    Helpful details (optional)
                  </Label>
                  <Textarea
                    id="privacy-details"
                    rows={4}
                    maxLength={1000}
                    value={form.details}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, details: event.target.value }))
                    }
                    placeholder="For example, the phone number or ZIP code used with your request"
                  />
                  {errors.details ? (
                    <p className="text-sm font-semibold text-destructive">{errors.details}</p>
                  ) : null}
                </div>

                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, website: event.target.value }))
                  }
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[10000px] h-px w-px opacity-0"
                />

                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit Privacy Request"}
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This form creates a restricted admin request. It is not shared with contractors.
                </p>
              </form>
            )}
          </section>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Looking for project help?{" "}
          <Link
            to="/estimate"
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Request an estimate
          </Link>
          . You can also review our{" "}
          <Link to="/terms" className="font-semibold text-foreground underline underline-offset-2">
            Terms of Service
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function PrivacyCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <article className="surface-card p-5">
      <Icon className="size-6 text-success" />
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
