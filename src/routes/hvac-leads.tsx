import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Snowflake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/hvac-leads")({
  head: () => ({
    meta: [
      { title: "HVAC Leads for Contractors | Rivet Reach" },
      { name: "description", content: "Get matched HVAC leads through Rivet Reach. Set your service area, receive homeowner heating and cooling requests, and manage opportunities from one mobile-friendly dashboard." },
      { property: "og:title", content: "HVAC Leads for Contractors | Rivet Reach" },
      { property: "og:description", content: "HVAC leads matched by service area and trade, with a simple contractor dashboard built for mobile use." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/hvac-leads" }],
  }),
  component: HvacLeadsPage,
});

function HvacLeadsPage() {
  const benefits = [
    "Heating and cooling requests matched to your service area",
    "Mobile-friendly lead inbox and pipeline",
    "One-time first real lead free for a new contractor account",
    "Continued lead access through a paid Rivet Reach plan",
  ];
  return <div className="min-h-screen bg-background"><SiteHeader /><main>
    <section className="bg-steel text-steel-foreground"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <p className="text-base font-bold uppercase tracking-wide text-primary">HVAC leads for contractors</p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Get more heating and cooling opportunities in the areas you actually serve.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Rivet Reach connects HVAC contractors with homeowner requests based on trade and service area so you can focus on relevant opportunities instead of chasing random inquiries.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="h-14 px-7 text-lg font-bold"><Link to="/login">Get HVAC Leads</Link></Button><Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground"><Link to="/find-an-hvac-contractor">I Need HVAC Help</Link></Button></div>
    </div></section>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16"><div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
      <div><p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How Rivet Reach works for HVAC companies</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">A cleaner path from homeowner request to service opportunity</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">Homeowners submit heating and cooling needs through Rivet Reach. Requests are routed according to service type and ZIP-code coverage.</p></div>
      <div className="surface-card p-6 sm:p-7"><h2 className="text-2xl font-bold">What HVAC contractors get</h2><ul className="mt-5 space-y-4">{benefits.map((b)=><li key={b} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success"/><span>{b}</span></li>)}</ul></div>
    </div></section>
    <section className="border-y border-border bg-muted/45"><div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">{[[MapPin,"Set your territory","Choose the ZIP codes and areas where you want HVAC opportunities."],[Snowflake,"Stay focused on HVAC","Match requests to the heating and cooling work you actually perform."],[ShieldCheck,"Manage your pipeline","Review leads, add notes, and keep follow-up organized."]].map(([Icon,t,b])=>{const I=Icon as typeof MapPin;return <div key={String(t)} className="surface-card p-6"><I className="size-7 text-primary"/><h3 className="mt-4 text-xl font-bold">{String(t)}</h3><p className="mt-2 text-muted-foreground">{String(b)}</p></div>})}</div></section>
    <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16"><h2 className="text-3xl font-bold sm:text-4xl">Ready to add Rivet Reach to your HVAC sales pipeline?</h2><Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold"><Link to="/login">Create Contractor Account</Link></Button></section>
  </main><SiteFooter /></div>;
}
