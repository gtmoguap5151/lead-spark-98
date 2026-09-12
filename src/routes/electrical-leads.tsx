import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/electrical-leads")({
  head: () => ({
    meta: [
      { title: "Electrical Leads for Contractors | Rivet Reach" },
      { name: "description", content: "Electrical contractors can receive homeowner project opportunities matched by trade and service area through Rivet Reach." },
      { property: "og:title", content: "Electrical Leads for Contractors | Rivet Reach" },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/electrical-leads" }],
  }),
  component: ElectricalLeadsPage,
});

function ElectricalLeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Electrical leads for contractors</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Get in front of homeowners who already need electrical work.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Rivet Reach routes homeowner electrical requests using trade and service-area information so electricians can spend more time evaluating real opportunities and less time chasing random inquiries.</p>
            <Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/login">Create Contractor Account</Link></Button>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[[Zap,"Electrical-focused matching","Identify electrical as a trade in your profile so relevant homeowner requests can be routed correctly."],[MapPin,"Service-area control","Set the territory you actually serve instead of sorting through work that is too far away."],[CheckCircle2,"Manage every opportunity","Track lead status, notes, and follow-up from the Rivet Reach dashboard."]].map(([Icon,title,body]) => { const I = Icon as typeof Zap; return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{String(body)}</p></div>; })}
          </div>
          <div className="mt-12 text-center"><h2 className="text-3xl font-bold">Your first real lead can be free once.</h2><p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">After the one-time introductory lead, continued access requires payment, credits, or an active paid plan.</p><Button asChild size="lg" className="mt-6"><Link to="/login">Get Started</Link></Button></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
