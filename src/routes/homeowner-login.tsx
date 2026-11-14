import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/homeowner-login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode?: "signup"; [key: string]: unknown } => {
    const { mode, ...otherSearch } = search;
    return {
      ...otherSearch,
      ...(mode === "signup" ? { mode: "signup" as const } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Homeowner Login & Signup — Rivet Reach" },
      {
        name: "description",
        content:
          "Sign in or create a free homeowner account to track your home projects, see your match status, and update your project details.",
      },
      { property: "og:title", content: "Homeowner Login & Signup — Rivet Reach" },
      {
        property: "og:description",
        content: "Track your home projects and see your match status in one place.",
      },
    ],
  }),
  component: HomeownerLoginPage,
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Your name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\d\s()+-.]*$/, "Enter a valid phone number"),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  termsAccepted: z.literal(true, { message: "Accept the Terms of Service to create an account" }),
});

function HomeownerLoginPage() {
  const { mode } = Route.useSearch();
  const isSignup = mode === "signup";
  const { login, signupHomeowner, busy } = useApp();
  const navigate = useNavigate();
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const navigateByRole = (role: "contractor" | "admin" | "homeowner") => {
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "contractor") navigate({ to: "/dashboard" });
    else navigate({ to: "/my-projects" });
  };

  if (confirmationEmail) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-7" />
          </span>
          <h1 className="mt-4 text-3xl font-bold uppercase">Check your email</h1>
          <p className="mt-2 text-muted-foreground">
            We created your account. Open the confirmation link sent to{" "}
            <strong>{confirmationEmail}</strong>, then return here to sign in.
          </p>
          <Button className="mt-8" onClick={() => setConfirmationEmail(null)}>
            Return to login
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="eyebrow text-muted-foreground">Homeowner access</p>
        <h1 className="mt-2 text-4xl font-bold uppercase leading-none">
          {isSignup ? "Create your homeowner account" : "Homeowner sign in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Track your projects, see your match status, and update your project details. Free — and projects you already submitted with this email show up automatically."
            : "Sign in to track your projects and see your match status."}
        </p>

        <Tabs
          key={isSignup ? "signup" : "login"}
          defaultValue={isSignup ? "signup" : "login"}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm
              busy={busy}
              onSubmit={async (email, password) => {
                const res = await login(email, password);
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Welcome back");
                navigateByRole(res.role);
              }}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm
              busy={busy}
              onSubmit={async (values) => {
                const res = await signupHomeowner(values);
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                if (res.requiresEmailConfirmation) {
                  setConfirmationEmail(values.email);
                  return;
                }
                toast.success("Account created — welcome");
                navigate({ to: "/my-projects" });
              }}
            />
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Contractor instead?{" "}
          <Link to="/login" className="font-semibold text-accent-foreground underline">
            Contractor Login
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          No project yet?{" "}
          <Link to="/estimate" className="font-semibold text-accent-foreground underline">
            Request an Estimate
          </Link>
        </p>
      </main>
    </div>
  );
}

function LoginForm({
  onSubmit,
  busy,
}: {
  onSubmit: (email: string, password: string) => Promise<void>;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="surface-card mt-4 space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(email, password);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="homeowner-login-email">Email</Label>
        <Input
          id="homeowner-login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="homeowner-login-password">Password</Label>
        <Input
          id="homeowner-login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold"
        disabled={busy}
      >
        {busy ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

type SignupValues = z.infer<typeof signupSchema>;

function SignupForm({
  onSubmit,
  busy,
}: {
  onSubmit: (values: SignupValues) => Promise<void>;
  busy: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="surface-card mt-4 space-y-4 p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = signupSchema.safeParse({ ...form, termsAccepted });
        if (!parsed.success) {
          const next: Record<string, string> = {};
          for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
          setErrors(next);
          toast.error("Please fix the highlighted fields.");
          return;
        }
        setErrors({});
        void onSubmit(parsed.data);
      }}
    >
      {(
        [
          ["fullName", "Your name", "Jordan Miller", "text"],
          ["email", "Email", "you@example.com", "email"],
          ["phone", "Phone (optional)", "(555) 555-0123", "tel"],
          ["password", "Password", "At least 8 characters", "password"],
        ] as const
      ).map(([key, label, placeholder, type]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`ho-su-${key}`}>{label}</Label>
          <Input
            id={`ho-su-${key}`}
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            autoComplete={key === "email" ? "email" : key === "password" ? "new-password" : undefined}
          />
          {errors[key] ? (
            <p className="text-xs font-medium text-destructive">{errors[key]}</p>
          ) : null}
        </div>
      ))}

      <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-4">
        <Checkbox
          id="homeowner-terms-acceptance"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="homeowner-terms-acceptance" className="leading-relaxed">
            I accept the{" "}
            <Link to="/terms" className="font-semibold underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and acknowledge the{" "}
            <Link to="/privacy" className="font-semibold underline underline-offset-2">
              Privacy &amp; Data Choices notice
            </Link>
            .
          </Label>
          {errors.termsAccepted ? (
            <p className="mt-1 text-xs font-medium text-destructive">{errors.termsAccepted}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
        Free · No obligation to hire anyone
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold"
        disabled={busy}
      >
        {busy ? "Creating account…" : "Create Free Homeowner Account"}
      </Button>
    </form>
  );
}
