import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Share2, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share Rivet Reach | Community Outreach Toolkit" },
      { name: "description", content: "Free, ready-to-share messages and trackable links for community organizations, neighborhood groups and home-service partners." },
      { property: "og:title", content: "Share Rivet Reach with Your Community" },
      { property: "og:description", content: "Help homeowners find an appropriate contractor and help local trades discover genuine project requests. No obligation to hire." },
    ],
    links: [{ rel: "canonical", href: "https://rivetreach.com/share" }],
  }),
  component: ShareToolkit,
});

type Message = { id: string; title: string; description: string; category: "homeowner" | "contractor"; content: string };

const messages: Message[] = [
  {
    id: "neighborhood",
    title: "Neighborhood and Facebook groups",
    description: "For local community pages where resource-sharing is permitted.",
    category: "homeowner",
    content: "Have a home project coming up? Rivet Reach lets homeowners submit their project details and ZIP for free. If an eligible contractor covers your area and trade, they may get in touch. No obligation to hire. Start here: [LINK]",
  },
  {
    id: "rental",
    title: "Landlords and property managers",
    description: "For rental-property owners and maintenance communities.",
    category: "homeowner",
    content: "Managing a repair or improvement at a property? Rivet Reach accepts project requests by trade and ZIP code, then checks for an eligible contractor match. Submitting is free and there's no obligation to hire. Project form: [LINK]",
  },
  {
    id: "realestate",
    title: "Real estate and relocation communities",
    description: "For people preparing a house for sale, a move or renovations.",
    category: "homeowner",
    content: "Roof, painting, flooring, remodeling or another home project on your list? Rivet Reach has a free project-request form. Tell them what needs doing and your ZIP, and they can check for a matching contractor. No guaranteed match or obligation to hire: [LINK]",
  },
  {
    id: "newsletter",
    title: "Community newsletter",
    description: "A short resource blurb for newsletters and local bulletins.",
    category: "homeowner",
    content: "COMMUNITY RESOURCE — Rivet Reach is a free way for homeowners to share an upcoming project and ZIP code. Requests may be routed to one eligible local contractor based on trade and territory. Submitting does not require hiring anyone. Learn more: [LINK]",
  },
  {
    id: "association",
    title: "Contractor associations",
    description: "For trade organizations and industry newsletters.",
    category: "contractor",
    content: "Home-service contractors: Rivet Reach matches genuine homeowner project requests to trade and ZIP coverage. Set up your service area and trades. Your first eligible matched lead is free, with no card required for that first lead; there is no guaranteed lead volume. Details: [LINK]",
  },
  {
    id: "procommunity",
    title: "Contractor discussion groups",
    description: "For professional communities where sharing tools is allowed.",
    category: "contractor",
    content: "Contractors looking for another source of project opportunities: Rivet Reach offers a mobile-friendly lead inbox and matches by trade and ZIP area. The first eligible matched homeowner lead is free for new contractor accounts; more access is paid. Check it out: [LINK]",
  },
];

function ShareToolkit() {
  const [source, setSource] = useState("");
  const [feedback, setFeedback] = useState("");
  const safeSource = source.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "community";

  function getLink(message: Message) {
    const params = new URLSearchParams({
      utm_source: "community",
      utm_medium: "referral",
      utm_campaign: "rivet_share_2026",
      utm_content: message.id,
      utm_term: safeSource,
    });
    return "https://rivetreach.com" + (message.category === "homeowner" ? "/estimate" : "/contractor-leads") + "?" + params.toString();
  }

  function getCopy(message: Message) {
    return message.content.replace("[LINK]", getLink(message));
  }

  async function copy(message: Message) {
    try {
      await navigator.clipboard.writeText(getCopy(message));
      setFeedback(message.id);
    } catch {
      setFeedback("failed");
    }
  }

  async function share(message: Message) {
    const content = getCopy(message);
    if (navigator.share) {
      try {
        await navigator.share({ text: content });
      } catch {
        // The share sheet can be dismissed without changing anything.
      }
    } else {
      await copy(message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-[#03251d] text-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-300"><Users className="size-5" /> Free community outreach toolkit</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">Give useful home-service resources <span className="text-emerald-400">a wider reach.</span></h1>
            <p className="mt-5 max-w-3xl text-lg text-white/80">Share ready-to-use messages with homeowners, local groups, trade associations or newsletters. Each message links directly to the appropriate Rivet Reach page and can include a source tag.</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-emerald-100">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> No-cost sharing resources</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> No guaranteed match claims</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Direct project and contractor links</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="surface-card p-6 sm:p-8">
            <Label htmlFor="source" className="text-lg font-bold">Name your distribution source (optional)</Label>
            <p className="mb-4 mt-2 text-sm leading-relaxed text-muted-foreground">Enter a short group, newsletter or campaign label. It's appended to the links, so sources can be distinguished in eligible attribution records. Do not enter personal information.</p>
            <Input id="source" value={source} maxLength={60} onChange={(event) => setSource(event.target.value)} placeholder="Example: hometown-newsletter" className="h-12 max-w-lg" />
            <p className="mt-3 text-xs text-muted-foreground">Source tag: {safeSource}. Homeowner form submissions record campaign tags; traffic and reach figures require separate analytics.</p>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready-to-share messages</h2>
            <p className="mt-2 text-muted-foreground">Choose the audience that already trusts you. Follow each platform's community rules and don't send repeated unsolicited messages.</p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {messages.map((message) => (
              <article className="surface-card flex flex-col p-6" key={message.id}>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">{message.category === "homeowner" ? "Homeowner audience" : "Contractor audience"}</div>
                <h3 className="mt-2 text-2xl font-bold">{message.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{message.description}</p>
                <p className="my-5 flex-1 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed break-words">{getCopy(message)}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => void copy(message)}><Copy className="mr-2 size-4" />{feedback === message.id ? "Copied" : "Copy message"}</Button>
                  <Button type="button" variant="outline" onClick={() => void share(message)}><Share2 className="mr-2 size-4" />Share</Button>
                  <a href={getLink(message)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 text-sm font-semibold text-primary underline underline-offset-4">View destination <ArrowRight className="size-4" /></a>
                </div>
              </article>
            ))}
          </div>
          {feedback === "failed" ? <p role="alert" className="mt-4 text-sm text-destructive">Automatic copy was unavailable. You can select and copy the message above.</p> : null}
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">Rivet Reach does not pay referral commissions under this toolkit. Sharing does not guarantee projects, lead matches, responses or earnings. Never imply that a contractor is available in a particular area without confirmation.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/estimate">Homeowner request <ArrowRight className="ml-2 size-5" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/contractor-leads">Contractor signup <ArrowRight className="ml-2 size-5" /></Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
