import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/hero-contractor.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rivet Reach — Home Projects Matched With Local Contractors" },
      {
        name: "description",
        content:
          "Rivet Reach helps homeowners request help for home projects and routes each request to a matched contractor serving the right trade and area.",
      },
      {
        property: "og:title",
        content: "Rivet Reach — A Smarter Way to Connect Homeowners and Contractors",
      },
      {
        property: "og:description",
        content:
          "Homeowners get a simpler path to help. Contractors get matched opportunities without chasing the same lead across a crowded marketplace.",
      },
    ],
  }),
  component: Landing,
});

const HOMEOWNER_STEPS = [
  {
    n: "01",
    title: "Tell us what needs done",
    body: "Choose the service, enter your ZIP code, and give us the basics of the project.",
  },
  {
    n: "02",
    title: "Rivet Reach routes it",
    body: "The request is matched by trade and service area instead of being blasted everywhere.",
  },
  {
    n: "03",
    title: "Talk to the contractor",
    body: "A matched contractor can contact you directly so you can discuss timing, scope, and next steps.",
  },
];

const TRUST_POINTS = [
  "No obligation to hire",
  "Nationwide homeowner intake",
  "Requests routed by trade and ZIP code",
  "Mobile-friendly from start to finish",
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
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-steel via-steel/95 to-steel/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,hsl(var(--primary)/0.18),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-sm">
              <Sparkles className="size-4 text-primary" />
              A simpler connection between homeowners and contractors
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
              Your project.
              <span className="block text-primary">The right trade.</span>
              <span className="block">One clear next step.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              Rivet Reach helps homeowners request help without spending the day calling around.
              Tell us what you need, and we route the request by service and location when a match
              is available.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold shadow-lg">
                <Link to="/estimate">
                  Start My Project
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-steel-foreground/35 bg-white/10 px-7 text-lg font-semibold text-steel-foreground backdrop-blur-sm hover:bg-white/15 hover:text-steel-foreground"
              >
                <Link to="/login">I&apos;m a Contractor</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-steel-foreground/80">
              {TRUST_POINTS.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/25 p-5 shadow-2xl backdrop-blur-md sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                    Rivet Reach
                  </p>
                  <p className="mt-1 text-lg font-bold">Project routing, simplified</p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Zap className="size-5" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  [Home, "Homeowner submits project", "Service + ZIP + project details"],
                  [Target, "Request gets matched", "Trade and service area determine routing"],
                  [Wrench, "Contractor receives opportunity", "One dashboard to manage the pipeline"],
                ].map(([Icon, title, body]) => {
                  const ItemIcon = Icon as typeof Home;
                  return (
                    <div key={String(title)} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <ItemIcon className="size-5" />
                      </span>
                      <div>
                        <p className="font-bold">{String(title)}</p>
                        <p className="mt-1 text-sm leading-relaxed text-steel-foreground/65">
                          {String(body)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">
                  For contractors
                </p>
                <p className="mt-1 font-semibold">
                  Your first real lead can be free once. Continued lead access requires a paid plan,
                  credits, or subscription.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3">
          {[
            [ShieldCheck, "Built for clarity", "Straightforward intake with no confusing maze."],
            [MapPin, "Location-aware routing", "Requests are organized by service and ZIP code."],
            [Clock3, "Fast to start", "A homeowner can submit the basics in just a few minutes."],
          ].map(([Icon, title, body]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div key={String(title)} className="flex items-start gap-3 rounded-xl p-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ItemIcon className="size-5" />
                </span>
                <div>
                  <p className="font-bold">{String(title)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{String(body)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
            Less hunting. Less guessing. A cleaner path from project to conversation.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Rivet Reach is designed to remove unnecessary friction on both sides of the job.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {HOMEOWNER_STEPS.map((step) => (
            <li key={step.n} className="surface-card group relative overflow-hidden p-7">
              <span className="text-5xl font-black text-primary/20">{step.n}</span>
              <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-muted/45">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-stretch">
          <div className="surface-card flex flex-col justify-between p-7 sm:p-8">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Home className="size-6" />
              </span>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                For homeowners
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                Stop turning a home project into a phone-book project.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Tell Rivet Reach what you need once. We use the service and ZIP code to route the
                request when an appropriate contractor match is available.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "No account required to start a request",
                  "No obligation to hire",
                  "Your request is not presented as a public bidding war",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild size="lg" className="mt-8 h-14 text-lg font-bold">
              <Link to="/estimate">
                Request Project Help
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-steel p-7 text-steel-foreground shadow-xl sm:p-8">
            <div className="absolute right-0 top-0 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Building2 className="size-6" />
                </span>
                <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                  For contractors
                </p>
                <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                  Spend more time working opportunities and less time hunting for them.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-steel-foreground/75">
                  Set your services and territory, receive matched homeowner requests, and move
                  opportunities through one mobile-friendly pipeline.
                </p>
                <ul className="mt-6 space-y-3 text-steel-foreground/85">
                  {[
                    "First real lead can be free one time",
                    "Service-area and trade-based matching",
                    "Lead status, notes, and pipeline management in one place",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild size="lg" className="mt-8 h-14 text-lg font-bold">
                <Link to="/login">
                  Join Rivet Reach
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Built around real projects</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              One platform across the home-service trades.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Roofing today. Plumbing tomorrow. Remodeling next month. Rivet Reach is designed as a
              broader project-routing system, not a single-trade directory.
            </p>
          </div>

          <div className="surface-card p-6 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Roofing",
                "Heating & cooling",
                "Plumbing",
                "Electrical",
                "Remodeling",
                "Concrete",
                "Painting",
                "Flooring",
                "Decks",
                "Windows & doors",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 font-semibold">
                  <BadgeCheck className="size-5 shrink-0 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-steel px-6 py-10 text-center text-steel-foreground shadow-2xl sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_35%)]" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
              Give the project somewhere to go.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-steel-foreground/75">
              Homeowners can start a request now. Contractors can join the network and set up their
              service territory.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/estimate">Start a Project</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-white/25 bg-white/10 px-7 text-lg font-bold text-steel-foreground hover:bg-white/15 hover:text-steel-foreground"
              >
                <Link to="/login">Contractor Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
