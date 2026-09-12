import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Hammer, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-remodeling-contractor")({
  head: () => ({
    meta: [
      { title: "Find a Remodeling Contractor Near You | Rivet Reach" },
      {
        name: "description",
        content:
          "Need help with a home remodel? Tell Rivet Reach about your project and ZIP code so your request can be routed to a remodeling contractor who serves your area when a match is available.",
      },
      { property: "og:title", content: "Find a Remodeling Contractor Near You | Rivet Reach" },
      {
        property: "og:description",
        content: "Submit your remodeling project once and let Rivet Reach route it based on the work needed and your ZIP code.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-remodeling-contractor" }],
  }),
  component: FindRemodelingContractorPage,
});

function FindRemodelingContractorPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Find a remodeling contractor</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Planning a home remodel? Start with one simple project request.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              Tell Rivet Reach what you want to improve and where the property is located. Your request can be routed to a remodeling contractor who serves your area when a match is available.
            </p>
            <Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold">
              <Link to="/estimate">Start My Remodeling Request</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How it works</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">A straightforward path from project idea to contractor match</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              [ClipboardList, "Describe the project", "Tell us what you want remodeled and include the details that help a contractor understand the job."],
              [MapPin, "Add your ZIP code", "Rivet Reach uses your location and the service requested to route the project."],
              [Hammer, "Connect with a remodeler", "When a match is available, a contractor serving your area can receive the request and contact you directly."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof ClipboardList;
              return (
                <div key={String(title)} className="surface-card p-6">
                  <ItemIcon className="size-7 text-primary" />
                  <h3 className="mt-4 text-xl font-bold">{String(title)}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{String(body)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Projects Rivet Reach can help route</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Kitchen remodeling",
                "Bathroom remodeling",
                "Basement finishing",
                "Room additions",
                "Whole-home renovations",
                "Interior updates",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <CheckCircle2 className="size-5 shrink-0 text-success" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to tell us about your remodeling project?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Submit your project details once. Rivet Reach handles the routing based on the service requested and your location.
          </p>
          <Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold">
            <Link to="/estimate">Request Remodeling Help</Link>
          </Button>
          <p className="mt-5 text-sm text-muted-foreground">
            Are you a remodeling contractor? <Link to="/remodeling-leads" className="font-semibold text-primary hover:underline">See remodeling lead opportunities.</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
