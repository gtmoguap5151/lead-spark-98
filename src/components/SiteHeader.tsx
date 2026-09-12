import { Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-gradient-heat text-primary-foreground">
            <HardHat className="size-5" />
          </span>
          <span className="font-display text-lg font-bold uppercase leading-none tracking-tight">
            RivetReach
            <span className="block text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              Contractor Network
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Contractor login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/estimate">Request an Estimate</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-steel text-steel-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold uppercase">RivetReach</p>
          <p className="text-sm text-steel-foreground/70">
            Qualified home-services leads, routed by ZIP and trade.
          </p>
          <p className="mt-1 text-xs text-steel-foreground/55">
            A Southeast Home Service platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/estimate" className="hover:text-primary">
            Request an Estimate
          </Link>
          <Link to="/login" className="hover:text-primary">
            Contractor Login
          </Link>
          <Link to="/privacy" className="hover:text-primary">
            Privacy &amp; Data Choices
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms of Service
          </Link>
          <Link to="/admin" className="hover:text-primary">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
