import { createFileRoute, Link } from "@tanstack/react-router";
import { Paintbrush, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-painter")({
  head: () => ({ meta: [
    { title: "Find a Painter Near You | Rivet Reach" },
    { name: "description", content: "Request help for interior or exterior painting and let Rivet Reach route your project to a contractor serving your area." },
  ], links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-painter" }] }),
  component: FindPainterPage,
});

function FindPainterPage(){return <div className="min-h-screen bg-background"><SiteHeader/><main>
<section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Find a painter</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Need painting work done? Start with one simple request.</h1><p className="mt-6 max-w-3xl text-lg text-steel-foreground/85">Tell Rivet Reach about your interior or exterior painting project and your ZIP code. We route the request based on the work needed and service area.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/estimate">Request a Painting Estimate</Link></Button></div></section>
<section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">{[[Paintbrush,"Describe the project","Tell us what needs painting and the basic scope."],[MapPin,"Add your ZIP code","Matching uses location and service type."],[ShieldCheck,"You stay in control","You decide whether to hire anyone after speaking with the contractor."]].map(([Icon,title,body])=>{const I=Icon as typeof Paintbrush;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</section>
</main><SiteFooter/></div>}
