import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Home, MapPin, Search, Sparkles, Target, Wrench, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Rivet Reach — Home Projects Matched With Local Contractors" },
    { name: "description", content: "Rivet Reach connects homeowner project requests with contractors by trade and service area." },
  ] }),
  component: Landing,
});

const proofPages = [
  [
    { stat: "58%", title: "of U.S. small businesses use generative AI", body: "Up from 40% in 2024 and 23% in 2023. The small-business technology shift is already underway.", source: "U.S. Chamber of Commerce, 2025" },
    { stat: "52%", title: "of home-service callers speak with a person", body: "Nearly half of inbound calls never reach a person, showing how easily paid demand can leak out of the funnel.", source: "Invoca Home Services Benchmarks, 2026" },
    { stat: "55%", title: "of home-service businesses don't ask the lead to buy or book", body: "Generating interest is only half the job. Opportunities still need a clear path toward the next action.", source: "Invoca Home Services Benchmarks, 2026" },
    { stat: "30 / 29 / 26%", title: "phone, text, and email preferences are closely split", body: "Homeowners prefer different ways to be contacted, making flexible follow-up more important than a one-channel approach.", source: "Modernize Homeowner Insights, 2025" },
  ],
  [
    { stat: "38%", title: "of home-service calls from digital marketing are leads", body: "A meaningful share of answered calls are real opportunities, making fast qualification and routing important after the marketing click.", source: "Invoca Home Services Benchmarks, 2026" },
    { stat: "45%", title: "of home-service phone leads convert on the call", body: "When a real lead reaches a business, the conversation itself can be a decisive moment for turning demand into booked work.", source: "Invoca Home Services Benchmarks, 2026" },
    { stat: "43.88%", title: "prefer text for scheduling the first appointment", body: "Homeowners increasingly expect scheduling to fit naturally into a mobile-first experience instead of requiring another phone call.", source: "Modernize Homeowner Insights, 2025" },
    { stat: "69.55%", title: "want to know appointment duration beforehand", body: "Clear expectations around timing and next steps can help homeowners feel more prepared before meeting a contractor.", source: "Modernize Homeowner Insights, 2025" },
  ],
];

const services = ["Roofing","Heating & cooling","Plumbing","Electrical","Remodeling","Concrete","Painting","Flooring","Decks","Windows & doors"];
const steps = [
  ["01", "Tell us what needs done", "Choose the service, enter your ZIP code, and give us the project basics."],
  ["02", "Rivet Reach routes it", "The request is matched by trade and service area instead of being blasted everywhere."],
  ["03", "Talk to the contractor", "A matched contractor can contact you directly to discuss scope, timing, and next steps."],
];

function Landing() {
  const [proofPage, setProofPage] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setProofPage(current => (current + 1) % proofPages.length), 30000); return () => window.clearInterval(timer); }, []);
  const proof = proofPages[proofPage];

  return <div className="min-h-screen bg-background">
    <SiteHeader />

    <section className="relative isolate min-h-[720px] overflow-hidden bg-[#021b16] text-white sm:min-h-[780px]">
      <img src="/file_00000000614881f5b57658dfaa06f34a.png" alt="Rivet Reach connecting homeowners with contractors" className="absolute inset-0 -z-30 size-full object-cover object-center" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#001d17]/95 via-[#001d17]/70 to-black/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#001812]/95 via-transparent to-[#001812]/20" />
      <div className="relative mx-auto flex min-h-[720px] max-w-6xl items-end px-4 pb-12 pt-20 sm:min-h-[780px] sm:items-center sm:py-24">
        <div className="max-w-2xl rounded-[2rem] border border-emerald-300/20 bg-black/40 p-6 shadow-2xl shadow-emerald-950/40 backdrop-blur-md sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300"><Sparkles className="size-4" /> People. Homes. Possibilities.</div>
          <h1 className="mt-5 font-display text-4xl font-black leading-[.98] tracking-tight sm:text-6xl">Find the <span className="text-emerald-400">right people</span><span className="block">for the <span className="text-emerald-400">right projects.</span></span></h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">Tell us what you need done. Rivet Reach routes your project by trade and ZIP code so an appropriate contractor can connect with you.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="h-16 bg-emerald-500 px-7 text-lg font-black text-[#001812] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 sm:col-span-2"><Link to="/estimate"><Home className="mr-2 size-5" /> Start My Project <ArrowRight className="ml-2 size-5" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-14 border-emerald-300/35 bg-black/35 px-7 text-lg font-bold text-white hover:bg-emerald-400/15 hover:text-white"><a href="#services">Browse Services</a></Button>
            <Button asChild size="lg" variant="outline" className="h-14 border-emerald-300/35 bg-black/35 px-7 text-lg font-bold text-white hover:bg-emerald-400/15 hover:text-white"><Link to="/contractor-leads">I&apos;m a Contractor</Link></Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-white/80">{["No obligation to hire","Nationwide intake","Trade + ZIP routing","Mobile friendly"].map(x=><span key={x} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" />{x}</span>)}</div>
        </div>
      </div>
    </section>

    <section id="services" className="scroll-mt-20 border-b border-emerald-950/15 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Browse services</p><h2 className="mt-3 text-3xl font-bold sm:text-5xl">What do you need help with?</h2><p className="mt-4 text-lg text-muted-foreground">Choose the type of project first. Rivet Reach will walk you through the details and route the request by service and ZIP code.</p></div></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{services.map(service => <Link key={service} to="/estimate" className="group flex min-h-24 items-center justify-between rounded-2xl border border-border bg-background p-5 text-lg font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"><span>{service}</span><ArrowRight className="size-5 text-primary transition group-hover:translate-x-1" /></Link>)}</div>
      </div>
    </section>

    <section className="border-b border-border bg-card"><div className="mx-auto max-w-6xl px-4 py-14 sm:py-16"><div className="max-w-4xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">The market is moving</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Getting the lead is not enough. The businesses that respond, communicate, and move opportunities forward have the advantage.</h2><p className="mt-4 text-muted-foreground">Independent industry research shows why faster, more flexible lead handling matters. These are market statistics, not Rivet Reach performance claims.</p></div><div key={proofPage} className="mt-8 grid animate-in gap-4 fade-in duration-700 sm:grid-cols-2 lg:grid-cols-4">{proof.map(p=><div key={p.stat+p.title} className="surface-card flex h-full flex-col p-6"><p className="text-4xl font-black text-primary sm:text-5xl">{p.stat}</p><h3 className="mt-3 text-xl font-bold">{p.title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p><p className="mt-5 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source: {p.source}</p></div>)}</div><div className="mt-5 flex items-center justify-center gap-2" aria-label="Market statistics rotation">{proofPages.map((_, index) => <button key={index} type="button" onClick={() => setProofPage(index)} aria-label={`Show statistics set ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === proofPage ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />)}</div><p className="mt-2 text-center text-xs font-medium text-muted-foreground">Market insights refresh every 30 seconds.</p></div></section>

    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20"><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">How it works</p><h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">Less hunting. Less guessing. A cleaner path from project to conversation.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map(([n,t,b])=><div key={n} className="surface-card p-7"><span className="text-5xl font-black text-primary/25">{n}</span><h3 className="mt-4 text-2xl font-bold">{t}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{b}</p></div>)}</div></section>

    <section className="border-y border-border bg-muted/45"><div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2"><div className="surface-card p-8"><Home className="size-9 text-primary"/><p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-primary">For homeowners</p><h2 className="mt-2 text-3xl font-bold">Stop turning a home project into a phone-book project.</h2><p className="mt-4 text-lg text-muted-foreground">Tell Rivet Reach what you need once. We use the service and ZIP code to route the request when an appropriate match is available.</p><Button asChild size="lg" className="mt-8 h-14 text-lg font-bold"><Link to="/estimate">Start My Project <ArrowRight className="ml-2 size-5" /></Link></Button></div><div className="rounded-2xl bg-[#03251d] p-8 text-white shadow-xl"><Building2 className="size-9 text-emerald-400"/><p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-emerald-400">For contractors</p><h2 className="mt-2 text-3xl font-bold">Work opportunities instead of spending all day hunting for them.</h2><p className="mt-4 text-lg text-white/70">Set your services and territory, receive matched homeowner requests, and manage opportunities from one mobile-friendly pipeline.</p><Button asChild size="lg" className="mt-8 h-14 bg-emerald-500 text-lg font-bold text-[#001812] hover:bg-emerald-400"><Link to="/contractor-leads">Explore contractor leads <ArrowRight className="ml-2 size-5"/></Link></Button></div></div></section>

    <section className="mx-auto max-w-6xl px-4 py-16"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><MapPin className="size-9 text-primary"/><h2 className="mt-4 text-3xl font-bold">One platform across the home-service trades.</h2><p className="mt-3 text-muted-foreground">Rivet Reach is built as a broader project-routing system, not a single-trade directory.</p></div><div className="surface-card grid gap-3 p-6 sm:grid-cols-2">{services.map(x=><div key={x} className="flex items-center gap-3 rounded-xl border border-border p-4 font-semibold"><BadgeCheck className="size-5 text-success"/>{x}</div>)}</div></div></section>

    <section className="px-4 pb-20"><div className="mx-auto max-w-6xl rounded-3xl bg-[#03251d] px-6 py-12 text-center text-white shadow-2xl"><Zap className="mx-auto size-9 text-emerald-400"/><h2 className="mt-4 text-3xl font-bold sm:text-5xl">It&apos;s more than a project.<span className="block text-emerald-400">It&apos;s a stronger tomorrow.</span></h2><p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">Homeowners can browse services or start a request now. Contractors can join Rivet Reach and set up their service territory.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" className="h-14 bg-emerald-500 px-7 text-lg font-bold text-[#001812] hover:bg-emerald-400"><Link to="/estimate">Start My Project <ArrowRight className="ml-2 size-5" /></Link></Button><Button asChild size="lg" variant="outline" className="h-14 border-emerald-300/25 bg-white/5 px-7 text-lg font-bold text-white hover:bg-white/10 hover:text-white"><Link to="/contractor-leads">Contractor Leads</Link></Button></div></div></section>

    <SiteFooter />
  </div>;
}
