import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-an-electrician")({
  head: () => ({
    meta: [
      { title: "Find an Electrician for Your Home Project | Rivet Reach" },
      { name: "description", content: "Tell Rivet Reach about your electrical project and ZIP code so your request can be routed to a matching contractor when available." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-an-electrician" }],
  }),
  component: FindElectricianPage,
});

function FindElectricianPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Find an electrician</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Need electrical work at home? Start with one simple request.</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Describe the electrical work, enter your ZIP code, and Rivet Reach will route the request based on the service and area when a matching contractor is available.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/estimate">Request an Electrician</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-5 md:grid-cols-3">{[[Zap,"Tell us the electrical issue","Share the project details so the request has useful context."],[BadgeCheck,"Match by service and area","Routing uses the type of work and your ZIP code."],[ShieldCheck,"You stay in control","A request is not a commitment to hire anyone."]].map(([Icon,title,body])=>{const I=Icon as typeof Zap;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</div></section>
  </main><SiteFooter/></div>;
}
