import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-deck-builder")({
  head: () => ({
    meta: [
      { title: "Find a Deck Builder | Rivet Reach" },
      { name: "description", content: "Tell Rivet Reach about your deck project and ZIP code so your request can be routed to a matching contractor when available." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-deck-builder" }],
  }),
  component: FindDeckBuilderPage,
});

function FindDeckBuilderPage() {
  return <div className="min-h-screen bg-background"><SiteHeader/><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Find a deck builder</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Planning a new deck or fixing the one you already have?</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Share what you need and where the project is located. Rivet Reach uses the project type and ZIP code to route your request when a matching deck contractor is available.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/estimate">Request a Deck Contractor</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14"><div className="grid gap-5 md:grid-cols-3">{[[Hammer,"Describe the deck work","New construction, repairs, stairs, railings, resurfacing, or replacement."],[MapPin,"Enter the project location","Your ZIP code helps identify contractors who serve the area."],[ShieldCheck,"Choose what happens next","Submitting a request does not obligate you to hire anyone."]].map(([Icon,title,body])=>{const I=Icon as typeof Hammer;return <div key={String(title)} className="surface-card p-6"><I className="size-7 text-primary"/><h2 className="mt-4 text-xl font-bold">{String(title)}</h2><p className="mt-2 text-muted-foreground">{String(body)}</p></div>})}</div></section>
  </main><SiteFooter/></div>;
}
