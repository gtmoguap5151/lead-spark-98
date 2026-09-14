import { Link } from "@tanstack/react-router";
import { Download, Hammer, House } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function SiteHeader() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      window.alert("To install Rivet Reach on iPhone or iPad: tap Share, then choose Add to Home Screen.");
      return;
    }

    window.alert("Open your browser menu and choose Install app or Add to Home screen. Rivet Reach is already configured as an installable web app.");
  };

  const installButtonClass =
    "group relative overflow-hidden border-emerald-300/60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 font-extrabold text-white shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_10px_28px_rgba(16,185,129,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-300 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_14px_34px_rgba(16,185,129,0.5)] focus-visible:ring-emerald-400";

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/20 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src="/rivet-reach-icon.svg" alt="Rivet Reach" className="size-10 shrink-0 rounded-xl shadow-sm" />
          <span className="hidden font-display text-lg font-bold uppercase leading-none tracking-tight sm:block">
            Rivet Reach
            <span className="block text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              Contractor Network
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden h-11 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 px-5 font-extrabold text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-600 hover:to-green-400 md:inline-flex">
            <Link to="/services">
              <House className="mr-2 size-4" />
              Homeowners
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden h-11 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-slate-950 to-emerald-950 px-5 font-extrabold text-emerald-100 shadow-lg shadow-black/20 hover:from-emerald-950 hover:to-slate-900 md:inline-flex">
            <Link to="/login">
              <Hammer className="mr-2 size-4" />
              Contractors
            </Link>
          </Button>
          {!isInstalled && (
            <Button
              type="button"
              size="sm"
              onClick={installApp}
              className={`hidden lg:inline-flex ${installButtonClass}`}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Download className="relative mr-1.5 size-4 animate-pulse" />
              <span className="relative">Install App</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-emerald-950/15 bg-emerald-950/[0.03] px-3 py-2 md:hidden">
        <Button asChild size="lg" className="h-13 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 font-extrabold text-white shadow-md shadow-emerald-900/20 hover:from-emerald-600 hover:to-green-400">
          <Link to="/services">
            <House className="mr-2 size-5" />
            Homeowners
          </Link>
        </Button>
        <Button asChild size="lg" className="h-13 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-slate-950 to-emerald-950 font-extrabold text-emerald-100 shadow-md shadow-black/20 hover:from-emerald-950 hover:to-slate-900">
          <Link to="/login">
            <Hammer className="mr-2 size-5" />
            Contractors
          </Link>
        </Button>
      </div>

      {!isInstalled && (
        <div className="border-t border-emerald-400/20 bg-gradient-to-r from-emerald-950/5 via-emerald-500/10 to-green-400/5 px-4 py-3 sm:hidden">
          <Button
            type="button"
            size="lg"
            onClick={installApp}
            className={`h-14 w-full rounded-xl text-base tracking-wide ${installButtonClass}`}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Download className="relative mr-2 size-5 animate-pulse" />
            <span className="relative">Install Rivet Reach App</span>
          </Button>
          <p className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
            Fast access · Works from your home screen
          </p>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-steel text-steel-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <img src="/rivet-reach-icon.svg" alt="" className="size-11 rounded-xl" />
          <div>
            <p className="font-display text-xl font-bold uppercase">Rivet Reach</p>
            <p className="text-sm text-steel-foreground/70">
              Qualified home-services leads, routed by ZIP and trade.
            </p>
            <p className="mt-1 text-xs text-steel-foreground/55">
              A Southeast Home Service platform.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/services" className="hover:text-primary">
            Browse Services
          </Link>
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
