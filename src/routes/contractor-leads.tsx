import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, DollarSign, FileCheck, MapPin, MessageSquare, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/contractor-leads")({
  head: () => ({
    meta: [
      { title: "Contractor Leads for Home Service Pros | Rivet Reach" },
      {
        name: "description",
        content:
          "Find contractor leads matched by trade and service area with Rivet Reach. Get one first real lead free, then continue through a paid plan.",
      },
      { property: "og:title", content: "Contractor Leads for Home Service Pros | Rivet Reach" },
      {
        property: "og:description",
        content:
          "Matched homeowner project requests for contractors, routed by trade and service area.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/contractor-leads" }],
  }),
  component: ContractorLeadsPage,
});

const benefits = [
  "Homeowner requests matched to your trade and service area",
  "Mobile-friendly lead inbox and pipeline management",
  "One-time first real lead free for a new contractor account",
  "Continued lead access through a paid Rivet Reach plan",
];

function ContractorLeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-steel text-steel-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <p className="text-base font-bold uppercase tracking-wide text-primary">Contractor leads for home service pros</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">
              Your first matched lead is on us.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-steel-foreground/85 sm:text-xl">
              Create your contractor account and set your trade and service area. When a genuine homeowner request matches your coverage, your first eligible lead is free. No card required for that first lead.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-7 text-lg font-bold">
                <Link to="/login" search={{ mode: "signup" }}>Claim My First Lead</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-steel-foreground/40 bg-background/10 px-7 text-lg font-semibold text-steel-foreground hover:bg-steel-foreground/10 hover:text-steel-foreground">
                <Link to="/estimate">I Need a Contractor</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How Rivet Reach works</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">A simpler path from homeowner request to contractor opportunity</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Homeowners tell Rivet Reach what work they need and where the project is located. Requests are routed using trade and ZIP-code coverage so contractors can focus on opportunities that fit the work they actually perform.
              </p>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <h2 className="text-2xl font-bold">What contractors get</h2>
              <ul className="mt-5 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-base leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">
            {[
              [MapPin, "Set your service area", "Choose the territory you serve so matching can focus on the places where you actually work."],
              [Wrench, "Choose your trades", "Keep your profile focused on the services your company performs."],
              [ShieldCheck, "Manage every opportunity", "Track leads, notes, statuses, and next steps from one contractor dashboard."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof MapPin;
              return (
                <div key={String(title)} className="surface-card p-6">
                  <ItemIcon className="size-7 text-primary" />
                  <h3 className="mt-4 text-xl font-bold">{String(title)}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{String(body)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">How matching actually works</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Four steps from a homeowner&apos;s project to your inbox</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["01", "The homeowner describes the job", "A homeowner picks the trade, enters their ZIP code, and lays out the project basics — what needs doing, where it is, and any details that matter. Submitting is free for them, with no obligation to hire."],
              ["02", "Rivet Reach checks coverage", "Every request is checked against contractor trade and territory coverage. You set a base ZIP code and a service radius, and Rivet Reach builds your coverage from that — so a request only reaches you if it fits the work you do and the places you work."],
              ["03", "The matched request lands in your inbox", "When a request fits your trade and territory, it goes to your lead inbox. It is matched to you — not blasted to a list of contractors, not auctioned to the highest bidder. You see the project details and decide whether to pursue it."],
              ["04", "You talk to the homeowner", "You respond directly and discuss scope, timing, and next steps. Notes, statuses, and appointments stay in one pipeline, so nothing slips between the first message and the finished job."],
            ].map(([step, title, body]) => (
              <div key={step} className="surface-card p-6 sm:p-7">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">{step}</p>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Matching depends on homeowner requests coming in for your trade and area. We do not promise a number of leads or a timeline — the roster is new, and the work arrives as homeowners submit it. What we promise is the match: every request you see fits your trade and territory.
          </p>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">The trades on the roster</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Every trade a home needs, one matching system</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Rivet Reach routes homeowner projects across the home-service trades — from roofing and HVAC to handyman and small jobs, the work bigger platforms skip. Pick the trades you actually perform; requests outside your trades never reach you.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Roofing", "Repairs, replacements, and new roofs — leaks, storm damage, and full tear-offs.", "/roofing-leads"],
                ["Heating & cooling", "HVAC install, repair, and maintenance for homes that need heat in winter and cooling in summer.", "/hvac-leads"],
                ["Plumbing", "Leaks, clogs, fixtures, water heaters, and repipes — the calls that can't wait.", "/plumbing-leads"],
                ["Electrical", "Panel work, wiring, lighting, outlets, and troubleshooting for homes of every age.", "/electrical-leads"],
                ["Remodeling", "Kitchens, baths, basements, and whole-room changes, from refresh to rebuild.", "/remodeling-leads"],
                ["Concrete", "Driveways, slabs, patios, walkways, and foundations.", "/concrete-leads"],
                ["Painting", "Interior and exterior painting, from a single room to a whole house.", "/painting-leads"],
                ["Flooring", "Hardwood, laminate, tile, and vinyl — install, refinish, and repair.", "/flooring-leads"],
                ["Decks", "New decks, rebuilds, and repairs, plus porches and outdoor living.", "/deck-leads"],
                ["Windows & doors", "Replacement windows and doors, plus the framing and trim around them.", "/window-door-leads"],
                ["Handyman & small jobs", "The odd jobs homeowners put off — repairs, installs, and fixes that still need a real pro.", "/services"],
              ].map(([trade, body, href]) => (
                <div key={trade} className="surface-card p-5">
                  <h3 className="text-lg font-bold">
                    <Link to={href} className="hover:text-primary hover:underline">{trade}</Link>
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Where Rivet Reach is launching</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Three launch clusters, matched by ZIP code</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Outreach started in three clusters across Kentucky and Tennessee. These are the places where the roster is being built first — but matching follows the territory you set, so your service area is what decides which requests reach you.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [MapPin, "Central Kentucky", "The home cluster — Lexington, Richmond, Berea, Winchester, and the towns around them. Handyman and small jobs first, with roofing, HVAC, plumbing, and the rest of the trades on the same roster."],
              [MapPin, "Nashville exurbs", "The fast-growing ring around Nashville — Columbia, Murfreesboro, and the surrounding suburbs — where new homes and older ones alike keep local contractors busy."],
              [MapPin, "Knoxville", "Knoxville and the towns around it — Maryville, Lenoir City, and Farragut — where homeowners need the same local pros for repairs, remodels, and everyday upkeep."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof MapPin;
              return (
                <div key={String(title)} className="surface-card p-6">
                  <ItemIcon className="size-7 text-primary" />
                  <h3 className="mt-4 text-xl font-bold">{String(title)}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{String(body)}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
            If your service area sits outside these clusters, you can still create an account and set your base ZIP code and radius. Rivet Reach matches any ZIP it can match, and the roster grows as homeowners submit projects in your area.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">The founding offer</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">One flat rate. No per-lead charges, ever.</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Contractors on the founding roster pay a flat monthly rate — not a fee for every lead, not a percentage of the job. You bill the homeowner directly; Rivet Reach charges the subscription only.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "First eligible matched lead is free — no card required for that first lead.",
                  "Matched leads go to you, not to a list of competitors.",
                  "Month-to-month. Cancel at period end from your billing portal.",
                  "Secure Stripe checkout, with a self-service billing portal.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <DollarSign className="size-7 text-primary" />
                <h3 className="text-2xl font-bold">Founding plan</h3>
              </div>
              <p className="mt-4 text-5xl font-bold">$99<span className="text-lg font-medium text-muted-foreground">/month</span></p>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Locked for the first 50 contractors in each launch cluster. A full plan is also available at $199/month — still less than one booked job.
              </p>
              <p className="mt-4 border-t border-border pt-4 leading-relaxed text-muted-foreground">
                <strong className="text-foreground">60-day no-bookable pause:</strong> if no bookable work comes through in your first 60 days, your subscription pauses. You don&apos;t pay for a roster that isn&apos;t producing.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/45">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">After you sign up</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Verified once, then you&apos;re on the roster</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [FileCheck, "A short verification", "New contractors go through a short verification of license and insurance before the first lead. It keeps the roster real — homeowners trust a list of verified pros, and verified pros get taken seriously."],
                [MapPin, "Set your territory", "Choose your base ZIP code and service radius. Rivet Reach builds your coverage from that, so matching follows the roads you actually drive."],
                [MessageSquare, "Work your inbox", "Matched requests land in a mobile-friendly lead inbox. Track notes, statuses, and appointments from inquiry through won or lost — one pipeline, no spreadsheets."],
              ].map(([Icon, title, body]) => {
                const ItemIcon = Icon as typeof MapPin;
                return (
                  <div key={String(title)} className="surface-card p-6">
                    <ItemIcon className="size-7 text-primary" />
                    <h3 className="mt-4 text-xl font-bold">{String(title)}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{String(body)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
          <p className="text-center text-sm font-bold uppercase tracking-wide text-muted-foreground">Questions contractors ask</p>
          <h2 className="mt-2 text-center text-3xl font-bold leading-tight sm:text-4xl">Straight answers</h2>
          <div className="mt-10 space-y-6">
            {[
              ["Do I pay for every lead?", "No. The plan is a flat monthly rate. There are no per-lead charges, no bidding, and no percentage taken from your jobs."],
              ["Is the first lead really free?", "Yes. Your first eligible matched lead costs nothing, and no card is required for it. You only start paying if you continue on a plan after that."],
              ["Am I locked into a contract?", "No. Plans are month-to-month, and you can cancel at period end from your billing portal."],
              ["Do you sell the same lead to other contractors?", "No. A request is matched to one contractor by trade and territory. It is not auctioned, shared, or resold."],
              ["What if no work comes in my area?", "Lead flow depends on homeowner requests in your trade and ZIP codes. If no bookable work comes through in your first 60 days, the no-bookable pause guarantee applies to your plan."],
              ["How do I get paid for the work?", "You bill the homeowner directly, the way you always have. Rivet Reach charges the flat subscription only — never a cut of the job."],
            ].map(([q, a]) => (
              <div key={q} className="surface-card p-6">
                <h3 className="text-lg font-bold">{q}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Start with one real opportunity before you pay.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Create your account and set your trade and territory. Your first eligible matched homeowner lead is free; continued access is available through a paid Rivet Reach plan.
          </p>
          <Button asChild size="lg" className="mt-7 h-14 px-8 text-lg font-bold">
            <Link to="/login" search={{ mode: "signup" }}>Claim My First Lead</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
