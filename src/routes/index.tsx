import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Home, MapPin, Sparkles, Target, Wrench, Zap } from "lucide-react";
import heroImage from "@/assets/hero-contractor.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Rivet Reach — Home Projects Matched With Local Contractors" },
    { name: "description", content: "Rivet Reach connects homeowner project requests with contractors by trade and service area." },
  ] }),
  component: Landing,
});

const proof = [
  { stat: "58%", title: "of U.S. small businesses use generative AI", body: "Up from 40% in 2024 and 23% in 2023.", source: "U.S. Chamber of Commerce, 2025" },
  { stat: "87%", title: "say AI helps them operate more efficiently and compete", body: "AI is moving from experiment to everyday business tool.", source: "U.S. Chamber of Commerce, 2025" },
  { stat: "64%", title: "of surveyed homeowners called a professional after online research", body: "Digital research can become a real service conversation.", source: "Angi homeowner survey, 2026" },
];

const steps = [
  ["01", "Tell us what needs done", "Choose the service, enter your ZIP code, and give us the project basics."],
  ["02", "Rivet Reach routes it", "The request is matched by trade and service area instead of being blasted everywhere."],
  ["03", "Talk to the contractor", "A matched contractor can contact you directly to discuss scope, timing, and next steps."],
];

function Landing() {
  return <div className="min-h-screen bg-background">
    <SiteHeader />

    <section className="relative overflow-hidden bg-steel text-steel-foreground">
      <img src={heroImage} alt="Contractor helping a homeowner" className="absolute inset-0 size-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-steel via-steel/95 to-steel/60" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold"><Sparkles className="size-4 text-primary" /> Smarter connections. Less friction.</div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[.98] sm:text-6xl lg:text-7xl">Your project.<span className="block text-primary">The right trade.</span><span className="block">One clear next step.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">Rivet Reach gives homeowners a simpler way to request help and gives contractors a cleaner way to receive matched opportunities.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-7 text-lg font-bold"><Link to="/estimate">Start My Project <ArrowRight className="ml-2 size-5" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-14 border-white/30 bg-white/10 px-7 text-lg font-bold text-steel-foreground hover:bg-white/15 hover:text-steel-foreground"><Link to="/login">I&apos;m a Contractor</Link></Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-steel-foreground/80">{["No obligation to hire","Nationwide intake","Trade + ZIP routing","Mobile friendly"].map(x=><span key={x} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />{x}</span>)}</div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-black/25 p-6 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Rivet Reach</p><h2 className="mt-1 text-2xl font-bold">Project routing, simplified</h2>
          <div className="mt-5 space-y-3">{[[Home,"Homeowner submits project"],[Target,"Request gets matched"],[Wrench,"Contractor receives opportunity"]].map(([Icon,title])=>{const I=Icon as typeof Home;return <div key={String(title)} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><I className="size-5" /></span><span className="font-bold">{String(title)}</span></div>})}</div>
          <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4"><p className="text-sm font-bold uppercase text-primary">Contractor offer</p><p className="mt-1 font-semibold">Your first real lead can be free once. Continued access requires payment, credits, or an active subscription.</p></div>
        </div>
      </div>
    </section>

    <section className="border-b border-border bg-card"><div className="mx-auto max-w-6xl px-4 py-14"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">The market is moving</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Technology is changing how small businesses compete — and how homeowners find help.</h2><p className="mt-3 text-muted-foreground">These are independent market statistics, not Rivet Reach performance claims.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{proof.map(p=><div key={p.stat+p.title} className="surface-card p-6"><p className="text-5xl font-black text-primary">{p.stat}</p><h3 className="mt-3 text-xl font-bold">{p.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source: {p.source}</p></div>)}</div></div></section>

    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20"><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">How it works</p><h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">Less hunting. Less guessing. A cleaner path from project to conversation.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map(([n,t,b])=><div key={n} className="surface-card p-7"><span className="text-5xl font-black text-primary/25">{n}</span><h3 className="mt-4 text-2xl font-bold">{t}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{b}</p></div>)}</div></section>

    <section className="border-y border-border bg-muted/45"><div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2">
      <div className="surface-card p-8"><Home className="size-9 text-primary"/><p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-primary">For homeowners</p><h2 className="mt-2 text-3xl font-bold">Stop turning a home project into a phone-book project.</h2><p className="mt-4 text-lg text-muted-foreground">Tell Rivet Reach what you need once. We use the service and ZIP code to route the request when an appropriate match is available.</p><Button asChild size="lg" className="mt-8 h-14 text-lg font-bold"><Link to="/estimate">Request Project Help</Link></Button></div>
      <div className="rounded-2xl bg-steel p-8 text-steel-foreground shadow-xl"><Building2 className="size-9 text-primary"/><p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-primary">For contractors</p><h2 className="mt-2 text-3xl font-bold">Work opportunities instead of spending all day hunting for them.</h2><p className="mt-4 text-lg text-steel-foreground/75">Set your services and territory, receive matched homeowner requests, and manage opportunities from one mobile-friendly pipeline.</p><Button asChild size="lg" className="mt-8 h-14 text-lg font-bold"><Link to="/login">Join Rivet Reach <ArrowRight className="ml-2 size-5"/></Link></Button></div>
    </div></section>

    <section className="mx-auto max-w-6xl px-4 py-16"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><MapPin className="size-9 text-primary"/><h2 className="mt-4 text-3xl font-bold">One platform across the home-service trades.</h2><p className="mt-3 text-muted-foreground">Rivet Reach is built as a broader project-routing system, not a single-trade directory.</p></div><div className="surface-card grid gap-3 p-6 sm:grid-cols-2">{["Roofing","Heating & cooling","Plumbing","Electrical","Remodeling","Concrete","Painting","Flooring","Decks","Windows & doors"].map(x=><div key={x} className="flex items-center gap-3 rounded-xl border border-border p-4 font-semibold"><BadgeCheck className="size-5 text-success"/>{x}</div>)}</div></div></section>

    <section className="px-4 pb-20"><div className="mx-auto max-w-6xl rounded-3xl bg-steel px-6 py-12 text-center text-steel-foreground shadow-2xl"><Zap className="mx-auto size-9 text-primary"/><h2 className="mt-4 text-3xl font-bold sm:text-5xl">Give the project somewhere to go.</h2><p className="mx-auto mt-4 max-w-2xl text-lg text-steel-foreground/75">Homeowners can start a request now. Contractors can join Rivet Reach and set up their service territory.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" className="h-14 px-7 text-lg font-bold"><Link to="/estimate">Start a Project</Link></Button><Button asChild size="lg" variant="outline" className="h-14 border-white/25 bg-white/10 px-7 text-lg font-bold text-steel-foreground hover:bg-white/15 hover:text-steel-foreground"><Link to="/login">Contractor Access</Link></Button></div></div></section>

    <SiteFooter />
  </div>;
}
