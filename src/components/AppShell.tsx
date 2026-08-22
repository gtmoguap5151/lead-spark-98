import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { HardHat, Inbox, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useCurrentContractor } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Inbox },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
  requireRole = "contractor",
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  requireRole?: "contractor" | "admin";
  actions?: ReactNode;
}) {
  const { state, hydrated, logout } = useApp();
  const contractor = useCurrentContractor();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const allowed = hydrated && state.session?.role === requireRole;

  useEffect(() => {
    if (hydrated && !allowed) navigate({ to: "/login" });
  }, [hydrated, allowed, navigate]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-heat text-primary-foreground">
              <HardHat className="size-4" />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-tight">
              Lead Engine
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {requireRole === "contractor" ? (
              NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    pathname.startsWith(item.to) && "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <span className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                <Shield className="size-4" /> Admin console
              </span>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {contractor ? (
              <span className="hidden text-right text-xs leading-tight text-muted-foreground sm:block">
                <span className="block font-semibold text-foreground">
                  {contractor.companyName}
                </span>
                {contractor.city}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase leading-none">{title}</h1>
            {subtitle ? (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {actions}
        </div>
        {children}
      </main>

      {requireRole === "contractor" ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
          <div className="flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium",
                    active ? "text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("size-5", active && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
