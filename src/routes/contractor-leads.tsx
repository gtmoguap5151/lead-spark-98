import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/contractor-leads")({
  head: () => ({
    meta: [
      { title: "Contractor Leads for Home Service Pros | RivetReach" },
      {
        name: "description",
        content:
          "Find contractor leads matched by trade and service area with RivetReach. Get one first real lead free, then continue through a paid plan.",
      },
      { property: "og:title", content: "Contractor Leads for Home Service Pros | RivetReach" },
      {
        property: "og:description",
        content:
          "Matched homeowner project requests for contractors, routed by trade and service area.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/contractor-leads" }],
  }),
  component: ContractorLeadsPage,
});

const benefits = [
  "Homeowner requests matched to your trade and service area",
  "Mobile-friendly lead inbox and pipeline management",
  "One-time first real lead free for a new contractor account",
  "Continued lead access through a paid RivetReach plan",
];

function ContractorLeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Contractor leads for home service pros</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Get matched contractor leads without wasting time chasing the wrong jobs.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              RivetReach connects contractors with homeowner project requests based on trade and service area. Set your territory, review matched opportunities, and manage your pipeline from one mobile-friendly dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/login">Get Contractor Leads</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground">
                <Link to="/estimate">I Need a Contractor</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How RivetReach works</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">A simpler path from homeowner request to contractor opportunity</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Homeowners tell RivetReach what work they need and where the project is located. Requests are routed using trade and ZIP-code coverage so contractors can focus on opportunities that fit the work they actually perform.
              </p>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <h2 className="text-2xl font-bold">What contractors get</h2>
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
              [MapPin, "Set your service area", "Choose the territory you serve so matching can focus on the places where you actually work."],
              [Wrench, "Choose your trades", "Keep your profile focused on the services your company performs."],
              [ShieldCheck, "Manage every opportunity", "Track leads, notes, statuses, and next steps from one contractor dashboard."],
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
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to add RivetReach to your sales pipeline?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Create a contractor account, set your trade and territory, and be ready when a matched homeowner request is available.
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
