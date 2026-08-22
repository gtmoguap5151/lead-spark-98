import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Timer,
  Wrench,
} from "lucide-react";
import heroImage from "@/assets/hero-contractor.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Contractor Lead Engine — Qualified Home Improvement Leads" },
      {
        name: "description",
        content:
          "Exclusive, phone-verified home improvement leads routed to contractors by ZIP code and trade. Homeowners get free estimates from vetted local pros.",
      },
      { property: "og:title", content: "Contractor Lead Engine — Qualified Home Improvement Leads" },
      {
        property: "og:description",
        content:
          "Exclusive, phone-verified home improvement leads routed by ZIP code and trade. No shared leads, no long contracts.",
      },
    ],
  }),
  component: Landing,
});

const QUALIFIERS = [
  {
    icon: ShieldCheck,
    title: "Homeowner verified",
    body: "Every lead confirms they own the property and can make the decision. No renters, no tire-kickers.",
  },
  {
    icon: Timer,
    title: "Timeline captured",
    body: "We ask when the work needs to happen so you know who to call first this morning.",
  },
  {
    icon: MapPin,
    title: "Your ZIP codes only",
    body: "Leads route to the trade and territory you set. You never pay for work outside your radius.",
  },
  {
    icon: PhoneCall,
    title: "Exclusive to you",
    body: "One lead, one contractor. We never sell the same homeowner to four competitors.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Set your trade & territory",
    body: "Pick the services you sell and the ZIP codes you cover in your contractor profile.",
  },
  {
    n: "02",
    title: "We qualify the homeowner",
    body: "Project details, budget range, timeline and decision-maker confirmation, all captured up front.",
  },
  {
    n: "03",
    title: "Work the lead, track the job",
    body: "Move each lead through contacted, qualified, appointment and won — with revenue tracked per job.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-steel text-steel-foreground">
        <img
          src={heroImage}
          alt="Roofing and HVAC contractors working on a suburban home at sunset"
          width={1600}
          height={1104}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-steel via-steel/90 to-steel/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="eyebrow text-primary">Roofing · HVAC · Plumbing · Remodels</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold uppercase leading-[0.95] sm:text-7xl">
            Qualified leads.
            <br />
            <span className="text-primary">Not phone lists.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-steel-foreground/80 sm:text-lg">
            Contractor Lead Engine screens every homeowner for ownership, budget and timeline, then
            sends the lead straight to the one contractor who covers that ZIP code.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 text-base font-semibold">
              <Link to="/login">Get Qualified Leads</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-steel-foreground/30 bg-transparent text-base font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground"
            >
              <Link to="/estimate">Request an Estimate</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-steel-foreground/15 pt-6">
            {[
              ["68%", "Contact rate"],
              ["1 of 1", "Exclusive routing"],
              ["<5 min", "Lead delivery"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-bold text-primary">{v}</dt>
                <dd className="text-xs uppercase tracking-wide text-steel-foreground/70">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow text-muted-foreground">What makes a lead qualified</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold uppercase sm:text-4xl">
          Four filters before it ever hits your phone
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {QUALIFIERS.map((q) => (
            <div key={q.title} className="surface-card p-5">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-accent-foreground">
                <q.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-xl font-bold uppercase">{q.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{q.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="eyebrow text-muted-foreground">How it works</p>
          <h2 className="mt-2 text-3xl font-bold uppercase sm:text-4xl">Three steps to a booked job</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="surface-card p-5">
                <span className="font-display text-4xl font-bold text-primary">{s.n}</span>
                <h3 className="mt-2 text-xl font-bold uppercase">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2">
        <div className="surface-card flex flex-col justify-between gap-6 p-6">
          <div>
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-accent-foreground">
              <Wrench className="size-5" />
            </span>
            <h2 className="mt-3 text-2xl font-bold uppercase">I&apos;m a contractor</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Claim your trade and ZIP codes, then work exclusive leads from a dashboard built for
              the truck, not the desk.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {["Exclusive lead routing", "Pipeline & appointment tracking", "Revenue per closed job"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-success" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <Button asChild size="lg" className="h-12 text-base font-semibold">
            <Link to="/login">Get Qualified Leads</Link>
          </Button>
        </div>

        <div className="surface-card flex flex-col justify-between gap-6 p-6">
          <div>
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-accent-foreground">
              <Building2 className="size-5" />
            </span>
            <h2 className="mt-3 text-2xl font-bold uppercase">I&apos;m a homeowner</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you need done. We match you with one vetted local contractor for your
              trade — not a call center full of them.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {["Free, no-obligation estimate", "One local pro, not five calls", "Response within one business day"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CalendarCheck className="size-4 text-success" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <Button asChild size="lg" variant="secondary" className="h-12 text-base font-semibold">
            <Link to="/estimate">Request an Estimate</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
