import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HardHat, Home } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Home Service Leads & Contractor Matching | Rivet Reach" },
      { name: "description", content: "Browse Rivet Reach service pages for homeowners looking for contractors and contractors looking for matched home-service opportunities." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/services" }],
  }),
  component: ServicesPage,
});

const services = [
  { name: "Roofing", homeowner: "/find-a-roofer", contractor: "/roofing-leads" },
  { name: "Remodeling", homeowner: "/find-a-remodeling-contractor", contractor: "/remodeling-leads" },
  { name: "HVAC", homeowner: "/find-an-hvac-contractor", contractor: "/hvac-leads" },
  { name: "Plumbing", homeowner: "/find-a-plumber", contractor: "/plumbing-leads" },
  { name: "Electrical", homeowner: "/find-an-electrician", contractor: "/electrical-leads" },
  { name: "Concrete", homeowner: "/find-a-concrete-contractor", contractor: "/concrete-leads" },
  { name: "Decks", homeowner: "/find-a-deck-builder", contractor: "/deck-leads" },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Rivet Reach services</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">One network connecting home projects with the contractors who do the work.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Choose a service below. Homeowners can request help for a project, while contractors can learn how matched opportunities work for their trade.</p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.name} className="surface-card p-6">
                <h2 className="text-2xl font-bold">{service.name}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link to={service.homeowner as never} className="flex items-center justify-between rounded-lg border border-border p-4 font-semibold hover:bg-muted/50">
                    <span className="flex items-center gap-2"><Home className="size-5 text-primary"/>I need a contractor</span><ArrowRight className="size-4"/>
                  </Link>
                  <Link to={service.contractor as never} className="flex items-center justify-between rounded-lg border border-border p-4 font-semibold hover:bg-muted/50">
                    <span className="flex items-center gap-2"><HardHat className="size-5 text-primary"/>I want leads</span><ArrowRight className="size-4"/>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
