import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import heroImage from "@/assets/hero-contractor.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find a Contractor for Your Home Project — RivetReach" },
      {
        name: "description",
        content:
          "Homeowners across the U.S. can request one matched contractor for roofing, HVAC, plumbing, remodeling, and other home projects.",
      },
      {
        property: "og:title",
        content: "Find a Contractor for Your Home Project — RivetReach",
      },
      {
        property: "og:description",
        content:
          "A simple way to request help with your home project without calling contractor after contractor.",
      },
    ],
  }),
  component: Landing,
});

const HOMEOWNER_STEPS = [
  {
    n: "1",
    title: "Tell us what you need",
    body: "Choose the type of work, enter your ZIP code, and tell us a little about the project.",
  },
  {
    n: "2",
    title: "We match the project",
    body: "Your request is routed to one contractor who serves your area and the type of work you need.",
  },
  {
    n: "3",
    title: "Talk about your project",
    body: "The contractor can contact you directly so you can ask questions, discuss timing, and decide what to do next.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-steel text-steel-foreground">
        <img
          src={heroImage}
          alt="A contractor helping a homeowner with a home improvement project"
          width={1600}
          height={1104}
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-steel via-steel/95 to-steel/60" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-base font-bold uppercase tracking-wide text-primary sm:text-lg">
            Simple help for your home project
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.02] sm:text-6xl">
            Need work done on your home?
            <span className="mt-2 block text-primary">Start here.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-foreground/90 sm:text-xl">
            From any U.S. ZIP code, tell us what you need and we&apos;ll route your request to one
            contractor who works in your area when a match is available. No complicated process and
            no need to call around all day.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
              <Link to="/estimate">Get Help With My Project</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground"
            >
              <Link to="/login">I&apos;m a Contractor</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              [ShieldCheck, "No obligation", "You decide whether to move forward."],
              [MapPin, "Nationwide intake", "Requests route by service and U.S. ZIP code."],
              [Clock3, "Quick to complete", "The request form takes only a few minutes."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof ShieldCheck;
              return (
                <div
                  key={String(title)}
                  className="rounded-xl border border-white/15 bg-black/15 p-4"
                >
                  <ItemIcon className="size-6 text-primary" />
                  <p className="mt-2 text-base font-bold">{String(title)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel-foreground/75">
                    {String(body)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3">
          {[
            "Clear, easy-to-read request form",
            "One contractor receives your request",
            "Your contact details are not sold to a list of contractors",
          ].map((text) => (
            <div
              key={text}
              className="flex items-start gap-3 text-base font-medium leading-relaxed"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <p className="text-base font-bold uppercase tracking-wide text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          Three simple steps. No confusing process.
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {HOMEOWNER_STEPS.map((step) => (
            <li key={step.n} className="surface-card p-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {step.n}
              </span>
              <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-muted/45">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Home className="size-6" />
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Home repairs are stressful enough. Finding help shouldn&apos;t be.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              We designed the homeowner side to be straightforward: plain questions, large controls,
              and a clear next step. You remain in control of whether you hire anyone.
            </p>
          </div>
          <div className="surface-card p-6 sm:p-7">
            <h3 className="text-2xl font-bold">Common projects</h3>
            <ul className="mt-4 grid gap-3 text-lg sm:grid-cols-2">
              {[
                "Roofing",
                "Heating & cooling",
                "Plumbing",
                "Bathroom remodels",
                "Windows & doors",
                "Other home repairs",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <BadgeCheck className="size-5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
        <div className="surface-card flex flex-col justify-between gap-6 p-7">
          <div>
            <span className="flex size-11 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">For homeowners</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Request help without creating an account. Tell us about the project and we&apos;ll
              route it based on the service you need and your ZIP code.
            </p>
          </div>
          <Button asChild size="lg" className="h-14 text-lg font-bold">
            <Link to="/estimate">Request Help Now</Link>
          </Button>
        </div>

        <div className="surface-card flex flex-col justify-between gap-6 p-7">
          <div>
            <span className="flex size-11 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Wrench className="size-5" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">For contractors</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Set your services and territory, receive matched homeowner requests, and manage your
              pipeline from one mobile-friendly dashboard.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="h-14 text-lg font-bold">
            <Link to="/login">Contractor Sign In</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
