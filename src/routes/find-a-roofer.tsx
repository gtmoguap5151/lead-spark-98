import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ClipboardList, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-roofer")({
  head: () => ({
    meta: [
      { title: "Find a Roofer Near You | RivetReach" },
      {
        name: "description",
        content:
          "Need roofing help? Tell RivetReach about your project and ZIP code so your request can be routed to a roofing contractor who serves your area when a match is available.",
      },
      { property: "og:title", content: "Find a Roofer Near You | RivetReach" },
      {
        property: "og:description",
        content:
          "Submit your roofing project once and let RivetReach route the request based on trade and service area.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-roofer" }],
  }),
  component: FindARooferPage,
});

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us about the roof",
    body: "Share the type of roofing help you need, your ZIP code, and a few details about the project.",
  },
  {
    icon: MapPin,
    title: "We use your service area",
    body: "RivetReach routes the request according to the roofing trade and contractor coverage in your area.",
  },
  {
    icon: BadgeCheck,
    title: "Connect with a contractor",
    body: "When a match is available, the contractor can contact you directly to discuss the job, timing, and next steps.",
  },
];

function FindARooferPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">
              Find a roofer for your project
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Need a roofer near you? Start with one simple project request.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              Tell RivetReach what kind of roofing work you need and where the property is located. We use your ZIP code and project type to route the request to a roofing contractor who serves your area when a match is available.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/estimate">Request a Roofing Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground">
                <Link to="/roofing-leads">I&apos;m a Roofing Contractor</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-card p-6">
                <Icon className="size-7 text-primary" />
                <h2 className="mt-4 text-2xl font-bold">{title}</h2>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Roofing project help
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                One request instead of calling contractor after contractor
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                RivetReach is designed to make the first step easier. You provide the project details once. You are never obligated to hire anyone, and you decide whether a contractor is right for your project.
              </p>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <ShieldCheck className="size-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold">You stay in control</h2>
              <ul className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
                <li>No obligation to hire a contractor.</li>
                <li>Your request is matched by trade and service area.</li>
                <li>You can discuss pricing, timing, and scope directly with the contractor.</li>
                <li>Submitting a request does not guarantee a contractor is available in every ZIP code.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to get help with your roof?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Start the project request, enter your ZIP code, and tell us what kind of roofing work you need.
          </p>
          <Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold">
            <Link to="/estimate">Start My Roofing Request</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
