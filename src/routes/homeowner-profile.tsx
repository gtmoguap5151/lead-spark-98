import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, useMyProfile } from "@/lib/store";

export const Route = createFileRoute("/homeowner-profile")({
  head: () => ({
    meta: [
      { title: "My Account — Rivet Reach" },
      {
        name: "description",
        content: "Manage your homeowner account details.",
      },
      { property: "og:title", content: "My Account — Rivet Reach" },
    ],
  }),
  component: HomeownerProfilePage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Your name is required").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\d\s()+-.]*$/, "Enter a valid phone number"),
});

function HomeownerProfilePage() {
  const profile = useMyProfile();
  const { updateMyProfile, logout, busy } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    const result = await updateMyProfile({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Account updated");
  }

  return (
    <AppShell
      title="My Account"
      subtitle="Your homeowner account details"
      requireRole="homeowner"
    >
      <section className="surface-card max-w-xl p-5">
        <form onSubmit={onSave} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ho-profile-name">Your name</Label>
            <Input
              id="ho-profile-name"
              value={form.fullName}
              maxLength={100}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
            {errors.fullName ? (
              <p className="text-xs font-medium text-destructive">{errors.fullName}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ho-profile-phone">Phone</Label>
            <Input
              id="ho-profile-phone"
              type="tel"
              value={form.phone}
              maxLength={20}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            {errors.phone ? (
              <p className="text-xs font-medium text-destructive">{errors.phone}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ho-profile-email">Email</Label>
            <Input id="ho-profile-email" type="email" value={profile?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              Your projects are matched to this email address. To change it, contact us
              through the Privacy &amp; Data Choices page.
            </p>
          </div>
          {profile?.createdAt ? (
            <p className="text-sm text-muted-foreground">
              Member since{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="h-12 px-6 font-semibold" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>

      <section className="surface-card mt-4 max-w-xl p-5">
        <h2 className="text-lg font-bold uppercase">Quick links</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link to="/my-projects" className="font-semibold text-accent-foreground underline">
              My Projects
            </Link>{" "}
            <span className="text-muted-foreground">— track your projects and matches</span>
          </li>
          <li>
            <Link to="/estimate" className="font-semibold text-accent-foreground underline">
              Request an Estimate
            </Link>{" "}
            <span className="text-muted-foreground">— start a new project</span>
          </li>
          <li>
            <Link to="/privacy" className="font-semibold text-accent-foreground underline">
              Privacy &amp; Data Choices
            </Link>{" "}
            <span className="text-muted-foreground">
              — access, correct, or delete your data
            </span>
          </li>
        </ul>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => {
            void logout().finally(() => navigate({ to: "/" }));
          }}
        >
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </section>
    </AppShell>
  );
}
