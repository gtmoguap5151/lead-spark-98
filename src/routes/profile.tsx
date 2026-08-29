import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Mail, UserRound, Power } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp, useCurrentContractor } from "@/lib/store";
import { SERVICE_TYPES, type Contractor, type ServiceType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Contractor Profile — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Update your company info, service types, and ZIP territory to control which leads you receive.",
      },
      { property: "og:title", content: "Contractor Profile — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Manage your trade, territory and account settings.",
      },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  contactName: z.string().trim().min(2, "Your name is required").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  city: z.string().trim().min(2, "Enter your city").max(100),
  territoryZips: z.array(z.string().regex(/^\d{5}$/)).min(1, "Add at least one ZIP code"),
  serviceTypes: z.array(z.enum(SERVICE_TYPES)).min(1, "Pick at least one service"),
});

function ProfilePage() {
  const { updateContractor, hydrated } = useApp();
  const contractor = useCurrentContractor();

  return (
    <AppShell
      title="Profile"
      subtitle="Your trade, territory & account settings"
    >
      {contractor ? (
        <ProfileForm key={contractor.id} contractor={contractor} onSave={updateContractor} />
      ) : hydrated ? (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          No contractor profile found.
        </div>
      ) : null}
    </AppShell>
  );
}

function ProfileForm({
  contractor,
  onSave,
}: {
  contractor: NonNullable<ReturnType<typeof useCurrentContractor>>;
  onSave: (id: string, patch: Partial<Contractor>) => void;
}) {
  const [form, setForm] = useState({
    companyName: contractor.companyName,
    contactName: contractor.contactName,
    phone: contractor.phone,
    city: contractor.city,
  });
  const [services, setServices] = useState<ServiceType[]>(contractor.serviceTypes);
  const [zips, setZips] = useState(contractor.territoryZips.join(", "));
  const [active, setActive] = useState(contractor.active);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse({
      ...form,
      serviceTypes: services,
      territoryZips: zips
        .split(/[\s,]+/)
        .map((z) => z.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    onSave(contractor.id, {
      ...parsed.data,
      active,
    });
    toast.success("Profile saved — territory updated");
  }

  return (
      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.5fr_1fr]" noValidate>
        <div className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Company information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="flex items-center gap-1.5 text-sm font-semibold">
                  <Building2 className="size-3.5 text-muted-foreground" /> Company name
                </Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                />
                {errors.companyName ? (
                  <p className="text-xs font-medium text-destructive">{errors.companyName}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="flex items-center gap-1.5 text-sm font-semibold">
                  <UserRound className="size-3.5 text-muted-foreground" /> Contact name
                </Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
                {errors.contactName ? (
                  <p className="text-xs font-medium text-destructive">{errors.contactName}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-semibold">
                  <Phone className="size-3.5 text-muted-foreground" /> Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone ? (
                  <p className="text-xs font-medium text-destructive">{errors.phone}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="size-3.5 text-muted-foreground" /> City / base
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                {errors.city ? (
                  <p className="text-xs font-medium text-destructive">{errors.city}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Mail className="size-3.5 text-muted-foreground" /> Account email
              </Label>
              <Input value={contractor.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">
                Email can&apos;t be changed after signup. Contact admin to update.
              </p>
            </div>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Territory ZIP codes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You only receive leads for these ZIP codes. Comma separated.
            </p>
            <Input
              className="mt-3"
              placeholder="43017, 43016, 43026"
              value={zips}
              onChange={(e) => setZips(e.target.value)}
            />
            {errors.territoryZips ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">{errors.territoryZips}</p>
            ) : null}
          </section>
        </div>

        <div className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="text-xl font-bold uppercase">Services you sell</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Toggle the trades you want leads for.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SERVICE_TYPES.map((s) => {
                const isActive = services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setServices((cur) =>
                        isActive ? cur.filter((c) => c !== s) : [...cur, s],
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.serviceTypes ? (
              <p className="mt-2 text-xs font-medium text-destructive">{errors.serviceTypes}</p>
            ) : null}
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold uppercase">
                  <Power className="size-5" /> Receiving leads
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Turn off to pause lead delivery without deleting your account.
                </p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                aria-label="Toggle lead receiving"
              />
            </div>
            <p className={cn(
              "mt-3 text-sm font-semibold",
              active ? "text-success" : "text-muted-foreground",
            )}>
              {active ? "Active — leads are routing to you" : "Paused — no new leads"}
            </p>
          </section>

          <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
            Save profile
          </Button>
        </div>
      </form>
  );
}
