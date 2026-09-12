import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, Handshake, Scale } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — RivetReach" },
      {
        name: "description",
        content:
          "Terms for homeowners and contractors using the nationwide RivetReach matching platform.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="eyebrow text-primary">Service rules</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">Terms of Service</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          These terms apply to homeowners and contractors who use RivetReach anywhere in the United
          States. By submitting a request, creating an account, or using the service, you agree to
          them.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective September 9, 2026</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <TermsCard
            icon={Handshake}
            title="A matching platform"
            body="We connect project requests with independent contractors; we do not perform or supervise the work."
          />
          <TermsCard
            icon={BadgeCheck}
            title="Independent businesses"
            body="Contractors remain responsible for qualifications, pricing, permits, insurance, and workmanship."
          />
          <TermsCard
            icon={Scale}
            title="Nationwide rules"
            body="Each user must follow the federal, state, and local laws that apply where they operate."
          />
        </section>

        <section className="surface-card mt-8 space-y-8 p-6 sm:p-8">
          <TermsSection title="1. What the service does">
            RivetReach receives home-project requests and may route a request to one contractor based
            on service type, ZIP territory, availability, and platform rules. We do not guarantee a
            match, response, estimate, project award, customer, revenue, result, or quality of work. A
            match is not an endorsement of either party.
          </TermsSection>

          <TermsSection title="2. Homeowner eligibility and requests">
            You must be at least 18, provide accurate information, own the property or be authorized
            to approve the requested work, and use the service for a genuine project. You authorize
            us to share the submitted contact and project information with one matched contractor so
            that contractor may call, text, or email you about the request. You are never required
            to hire a contractor or purchase anything.
          </TermsSection>

          <TermsSection title="3. Contractor eligibility and responsibilities">
            Contractors are independent businesses, not our employees, agents, joint venturers, or
            representatives. Each contractor must maintain all licenses, registrations, permits,
            insurance, bonds, disclosures, and qualifications required for every location and trade
            in which it operates. Contractors must verify project conditions, give accurate pricing
            and disclosures, use lawful contracts, and comply with consumer-protection,
            telemarketing, text-message, email, accessibility, employment, tax, safety, and building
            laws.
          </TermsSection>

          <TermsSection title="4. Contact and data-use limits">
            A contractor may use a homeowner&apos;s information only to respond to that
            person&apos;s submitted project, operate the resulting customer relationship, prevent
            fraud, and meet legal obligations. Contractors may not sell, rent, scrape, publish,
            enrich, or reuse lead data for unrelated marketing; send harassing or deceptive
            messages; or ignore an opt-out or do-not-contact request. Account access is personal to
            the authorized business user.
          </TermsSection>

          <TermsSection title="5. Accounts and security">
            You are responsible for accurate account details, a secure password, and all activity
            under your account. Notify us through the privacy request form if you suspect
            unauthorized access. We may verify identity, business information, licensing, service
            areas, or project legitimacy and may suspend access while reviewing risk or compliance.
          </TermsSection>

          <TermsSection title="6. Contractor fees and subscriptions">
            Contractor pricing, included leads, billing period, trial or free-lead terms, and
            renewal terms are shown before purchase. Unless the checkout says otherwise,
            subscriptions renew until canceled. Contractors may cancel through the available billing
            controls; access continues through the paid period unless law requires another result.
            Taxes and charges already incurred remain due, and refunds are provided only when stated
            at checkout or required by law.
          </TermsSection>

          <TermsSection title="7. Acceptable use">
            Do not submit false projects, impersonate another person, interfere with matching, probe
            or bypass security, upload malicious code, scrape the service, resell platform access,
            copy protected content, or use the service for unlawful, discriminatory, abusive, or
            deceptive activity. Automated access requires our written permission.
          </TermsSection>

          <TermsSection title="8. No emergency service">
            RivetReach is not an emergency-dispatch service. For an immediate threat to life, health,
            fire safety, gas, electricity, flooding, or property, call 911, the appropriate utility
            emergency line, or a qualified emergency provider.
          </TermsSection>

          <TermsSection title="9. Privacy">
            Our collection, sharing, retention, and consumer-request practices are described in the{" "}
            <Link
              to="/privacy"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Privacy &amp; Data Choices notice
            </Link>
            . Optional RivetReach marketing permission is separate from project-contact permission
            and may be withdrawn at any time.
          </TermsSection>

          <TermsSection title="10. Disclaimers and limits">
            To the fullest extent permitted by law, the service is provided “as is” and “as
            available.” We disclaim implied warranties, including merchantability, fitness for a
            particular purpose, and noninfringement. We are not responsible for independent
            contractors&apos; or homeowners&apos; acts, estimates, contracts, payments, delays,
            injuries, property damage, code compliance, or workmanship. Nothing in these terms
            excludes a warranty, remedy, or liability that cannot lawfully be excluded.
          </TermsSection>

          <TermsSection title="11. Enforcement, suspension, and termination">
            We may reject a request or suspend or terminate access for fraud, safety concerns,
            nonpayment, misuse, legal risk, or violation of these terms. Users may stop using the
            service at any time. Provisions that reasonably should survive—including payment,
            privacy, data-use limits, disclaimers, and responsibility for prior conduct—continue
            after termination.
          </TermsSection>

          <TermsSection title="12. Changes and contact">
            We may update these terms as the service and law change. Material updates will receive a
            new effective date, and contractors may be asked to accept them again. To ask a
            question, report a problem, or make a legal or privacy request, use the restricted
            request form on our{" "}
            <Link
              to="/privacy"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              privacy page
            </Link>
            . Applicable federal, state, and local law governs regardless of where the service is
            accessed.
          </TermsSection>
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Never send sensitive financial, medical, Social Security, or government-identification
            information through a project description or privacy-request note.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function TermsCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Handshake;
  title: string;
  body: string;
}) {
  return (
    <article className="surface-card p-5">
      <Icon className="size-6 text-primary" />
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
