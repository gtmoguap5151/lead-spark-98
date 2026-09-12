import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Hammer, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/concrete-leads")({
  head: () => ({
    meta: [
      { title: "Concrete Leads for Contractors | Rivet Reach" },
      { name: "description", content: "Concrete contractors can receive homeowner project opportunities matched by trade and service area through Rivet Reach." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/concrete-leads" }],
  }),
  component: ConcreteLeadsPage,
});

function ConcreteLeadsPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Concrete leads for contractors</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Find more concrete projects without wasting time on poor-fit inquiries.</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Rivet Reach helps route homeowner requests for driveways, slabs, patios, walkways, foundations, and related concrete work based on trade and service area.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/login">Create Contractor Account</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-5 md:grid-cols-3">{[[Hammer,"Project-focused requests","Homeowners describe the concrete work they need before the opportunity reaches your pipeline."],[MapPin,"Work your real territory","Set your service area so geography is part of the match."],[CheckCircle2,"Track the sale","Manage statuses and notes from inquiry through won or lost."]].map(([Icon,title,body])=>{const I=Icon as typeof Hammer;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</div></section>
  </main><SiteFooter/></div>;
}
