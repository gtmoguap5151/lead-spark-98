import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-concrete-contractor")({
  head: () => ({
    meta: [
      { title: "Find a Concrete Contractor | Rivet Reach" },
      { name: "description", content: "Tell Rivet Reach about your concrete project and ZIP code so your request can be routed to a matching contractor when available." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-concrete-contractor" }],
  }),
  component: FindConcreteContractorPage,
});

function FindConcreteContractorPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Find a concrete contractor</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Need a driveway, patio, slab, or other concrete project done?</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Tell Rivet Reach what kind of concrete work you need and where the project is located. We use the project type and ZIP code to route the request when a matching contractor is available.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/estimate">Request Concrete Help</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-5 md:grid-cols-3">{[[Hammer,"Describe the project","Share whether you need a driveway, patio, slab, walkway, foundation work, or another concrete service."],[MapPin,"Add your ZIP code","Location helps determine whether a contractor serves your area."],[ShieldCheck,"No hiring obligation","Submitting a request does not force you to hire anyone."]].map(([Icon,title,body])=>{const I=Icon as typeof Hammer;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</div></section>
  </main><SiteFooter/></div>;
}
