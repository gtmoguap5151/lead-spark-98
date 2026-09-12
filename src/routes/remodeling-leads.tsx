import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Hammer, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/remodeling-leads")({
  head: () => ({
    meta: [
      { title: "Remodeling Leads for Contractors | Rivet Reach" },
      {
        name: "description",
        content:
          "Get matched remodeling leads through Rivet Reach. Set your service area, receive homeowner project requests, and manage opportunities from one mobile-friendly dashboard.",
      },
      { property: "og:title", content: "Remodeling Leads for Contractors | Rivet Reach" },
      {
        property: "og:description",
        content:
          "Remodeling leads matched by service area and trade, with a simple contractor dashboard built for mobile use.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/remodeling-leads" }],
  }),
  component: RemodelingLeadsPage,
});

const benefits = [
  "Homeowner requests matched to remodeling and your service area",
  "A mobile-friendly lead inbox and sales pipeline",
  "One-time first real lead free for a new contractor account",
  "Continued lead access through a paid Rivet Reach plan",
];

function RemodelingLeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Remodeling leads for contractors</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Find more remodeling opportunities without spending all day chasing them.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              Rivet Reach connects remodeling contractors with homeowner project requests based on trade and service area. Set your territory, review matched opportunities, and manage your pipeline from one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/login">Get Remodeling Leads</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground">
                <Link to="/find-a-remodeling-contractor">I Need a Remodeler</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How Rivet Reach works for remodelers</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Turn homeowner project requests into a cleaner remodeling pipeline</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Homeowners submit project details through Rivet Reach. Requests are routed by service type and ZIP-code coverage, helping contractors focus on opportunities that fit the work they actually perform.
              </p>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <h2 className="text-2xl font-bold">What remodeling contractors get</h2>
              <ul className="mt-5 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-base leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">
            {[
              [MapPin, "Choose your service area", "Set the territory where you want remodeling opportunities."],
              [Hammer, "Match the work you do", "Keep your profile focused on the remodeling services you actually perform."],
              [ShieldCheck, "Manage every opportunity", "Review leads, add notes, update stages, and keep follow-up organized."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof MapPin;
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

        <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to add Rivet Reach to your remodeling sales pipeline?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Create a contractor account, set your service area, and be ready when a matched homeowner remodeling request is available.
          </p>
          <Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold">
            <Link to="/login">Create Contractor Account</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
