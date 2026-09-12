import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/painting-leads")({
  head: () => ({
    meta: [
      { title: "Painting Leads for Contractors | Rivet Reach" },
      { name: "description", content: "Get matched interior and exterior painting leads through Rivet Reach based on trade and service area." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/painting-leads" }],
  }),
  component: PaintingLeadsPage,
});

function PaintingLeadsPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Painting leads for contractors</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Find more interior and exterior painting opportunities.</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85">Rivet Reach routes homeowner painting requests by trade and service area so painters can focus on qualified local opportunities instead of chasing random inquiries.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/login">Get Painting Leads</Link></Button></div></section>
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">{[[MapPin,"Local matching","Set the ZIP codes and territory you serve."],[Paintbrush,"Painting-focused requests","Receive opportunities for interior, exterior, trim, and related painting work."],[CheckCircle2,"Simple pipeline","Review, note, and update each opportunity from one dashboard."]].map(([Icon,title,body])=>{const I=Icon as typeof MapPin;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</section>
    <section className="mx-auto max-w-4xl px-4 pb-14 text-center"><p className="text-lg text-muted-foreground">New contractor accounts can receive one real lead free one time. Continued access requires a paid Rivet Reach plan.</p><Button asChild size="lg" className="mt-6"><Link to="/login">Create Contractor Account</Link></Button></section>
  </main><SiteFooter/></div>;
}
