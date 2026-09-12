import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Droplets, MapPin, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/find-a-plumber")({
  head: () => ({
    meta: [
      { title: "Find a Plumber Near You | Rivet Reach" },
      { name: "description", content: "Need plumbing help? Tell Rivet Reach what you need and your ZIP code so your request can be routed to a plumber who serves your area when a match is available." },
      { property: "og:title", content: "Find a Plumber Near You | Rivet Reach" },
      { property: "og:description", content: "Submit your plumbing request once and let Rivet Reach route it by service and ZIP code." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/find-a-plumber" }],
  }),
  component: FindPlumberPage,
});

function FindPlumberPage() {
  return <div className="min-h-screen bg-background"><SiteHeader /><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20"><p className="text-base font-bold uppercase tracking-wide text-primary">Find a plumber</p><h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Need plumbing help? Start with one simple request.</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Tell Rivet Reach what plumbing work you need and where the property is located. Your request can be routed to a plumber who serves your area when a match is available.</p><Button asChild size="lg" className="mt-8 h-14 px-7 text-lg font-bold"><Link to="/estimate">Request Plumbing Help</Link></Button></div></section>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16"><h2 className="text-3xl font-bold sm:text-4xl">How it works</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[[Droplets,"Describe the plumbing issue","Tell us whether you need repair, replacement, installation, or another plumbing service."],[MapPin,"Add your ZIP code","Rivet Reach uses your location and requested service to route the project."],[Wrench,"Connect with a plumber","When a match is available, a plumber serving your area can receive the request and contact you directly."]].map(([Icon,t,b])=>{const I=Icon as typeof MapPin;return <div key={String(t)} className="surface-card p-6"><I className="size-7 text-primary"/><h3 className="mt-4 text-xl font-bold">{String(t)}</h3><p className="mt-2 text-muted-foreground">{String(b)}</p></div>})}</div></section>
    <section className="border-y border-border bg-muted/45"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-16"><h2 className="text-3xl font-bold sm:text-4xl">Common plumbing requests</h2><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["Leaks and pipe repair","Drain problems","Water heater service","Fixture installation","Sewer issues","Bathroom plumbing"].map((x)=><div key={x} className="flex items-center gap-3 rounded-lg border border-border bg-background p-4"><CheckCircle2 className="size-5 text-success"/><span className="font-medium">{x}</span></div>)}</div></div></section>
    <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16"><h2 className="text-3xl font-bold sm:text-4xl">Ready to request plumbing help?</h2><Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold"><Link to="/estimate">Start My Request</Link></Button><p className="mt-5 text-sm text-muted-foreground">Are you a plumbing contractor? <Link to="/plumbing-leads" className="font-semibold text-primary hover:underline">See plumbing lead opportunities.</Link></p></section>
  </main><SiteFooter /></div>;
}
