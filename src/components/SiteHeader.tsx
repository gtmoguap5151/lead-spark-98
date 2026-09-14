import { Link } from "@tanstack/react-router";
import { Download, HardHat } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-gradient-heat text-primary-foreground">
            <HardHat className="size-5" />
          </span>
          <span className="font-display text-lg font-bold uppercase leading-none tracking-tight">
            Rivet Reach
            <span className="block text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              Contractor Network
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/services">Services</Link>
          </Button>
          {!isInstalled && (
            <Button type="button" variant="outline" size="sm" onClick={installApp} className="hidden sm:inline-flex">
              <Download className="mr-1.5 size-4" />
              Install App
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link to="/login">Contractor login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/estimate">Request an Estimate</Link>
          </Button>
        </div>
      </div>
      {!isInstalled && (
        <div className="border-t border-border/50 px-4 py-2 sm:hidden">
          <Button type="button" variant="outline" size="sm" onClick={installApp} className="w-full font-bold">
            <Download className="mr-2 size-4" />
            Install Rivet Reach App
          </Button>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-steel text-steel-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold uppercase">Rivet Reach</p>
          <p className="text-sm text-steel-foreground/70">
            Qualified home-services leads, routed by ZIP and trade.
          </p>
          <p className="mt-1 text-xs text-steel-foreground/55">
            A Southeast Home Service platform.
          </p>
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
