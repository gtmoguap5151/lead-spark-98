import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/roofing-leads")({
  head: () => ({
    meta: [
      { title: "Roofing Leads for Contractors | RivetReach" },
      {
        name: "description",
        content:
          "Get matched roofing leads through RivetReach. Set your roofing service area, receive homeowner requests, and manage opportunities from a mobile-friendly dashboard.",
      },
      { property: "og:title", content: "Roofing Leads for Contractors | RivetReach" },
      {
        property: "og:description",
        content: "Roofing leads matched by service area and trade, with one simple contractor dashboard.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/roofing-leads" }],
  }),
  component: RoofingLeadsPage,
});

const benefits = [
  "Homeowner requests matched to roofing and your service area",
  "A mobile-friendly lead inbox and pipeline",
  "One-time first real lead free for a new contractor account",
  "Continued lead access through a paid RivetReach plan",
];

function RoofingLeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Roofing leads for contractors</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Spend less time hunting for roofing leads. Focus on the jobs worth chasing.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              RivetReach connects roofing contractors with homeowner project requests based on trade and service area. Set your territory, review matched opportunities, and manage the work from one dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/login">Get Roofing Leads</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground">
                <Link to="/estimate">I Need a Roofer</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How RivetReach works for roofers</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">A clearer path from homeowner request to roofing opportunity</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Homeowners submit project details through RivetReach. Requests are routed according to the service needed and ZIP-code coverage. Contractors can then work matched opportunities through the RivetReach lead pipeline.
              </p>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <h2 className="text-2xl font-bold">What roofing contractors get</h2>
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
              [MapPin, "Set your territory", "Tell RivetReach where you work so matching can use your service area."],
              [Wrench, "Stay focused on roofing", "Your contractor profile identifies the trades you actually perform."],
              [ShieldCheck, "Control your pipeline", "Review leads, add notes, update statuses, and keep opportunities organized."],
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
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to put RivetReach in your roofing sales pipeline?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Create a contractor account, set your roofing territory, and be ready when a matched homeowner request is available.
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
