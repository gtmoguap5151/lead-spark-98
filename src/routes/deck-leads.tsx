import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Hammer, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/deck-leads")({
  head: () => ({
    meta: [
      { title: "Deck Leads for Contractors | Rivet Reach" },
      { name: "description", content: "Deck builders can receive homeowner project opportunities matched by service area through Rivet Reach." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/deck-leads" }],
  }),
  component: DeckLeadsPage,
});

function DeckLeadsPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Deck leads for contractors</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Connect with homeowners planning deck builds, repairs, and replacements.</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Rivet Reach can route deck-related homeowner requests using project type and service area so builders can focus on jobs that fit their crew and territory.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/login">Create Contractor Account</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-5 md:grid-cols-3">{[[Hammer,"Deck-specific opportunities","Receive requests for new decks, repairs, resurfacing, stairs, railings, and related outdoor work."],[MapPin,"Territory-based matching","Keep opportunities focused on the ZIP codes you actually serve."],[CheckCircle2,"One organized pipeline","Track notes and lead status from first contact to final outcome."]].map(([Icon,title,body])=>{const I=Icon as typeof Hammer;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</div></section>
  </main><SiteFooter/></div>;
}
