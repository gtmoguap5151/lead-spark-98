import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/lib/store";
import { SERVICE_TYPES, type ServiceType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Contractor Login & Signup — Contractor Lead Engine" },
      {
        name: "description",
        content:
          "Sign in or create a contractor account to claim your trade, set your ZIP territory and start receiving exclusive qualified leads.",
      },
      { property: "og:title", content: "Contractor Login & Signup — Contractor Lead Engine" },
      {
        property: "og:description",
        content: "Claim your territory and start working exclusive qualified home-services leads.",
      },
    ],
  }),
  component: LoginPage,
});

const signupSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  contactName: z.string().trim().min(2, "Your name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  city: z.string().trim().min(2, "Enter your city").max(100),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  territoryZips: z.array(z.string().regex(/^\d{5}$/)).min(1, "Add at least one ZIP code"),
  serviceTypes: z.array(z.enum(SERVICE_TYPES)).min(1, "Pick at least one service"),
});

function LoginPage() {
  const { login, signup, loginAsAdmin, loginDemo } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="eyebrow text-muted-foreground">Contractor access</p>
        <h1 className="mt-2 text-4xl font-bold uppercase leading-none">Get Qualified Leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your pipeline, or claim a territory in under a minute.
        </p>

        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm
              onSubmit={(email, password) => {
                const res = login(email, password);
                if (!res.ok) {
                  toast.error(res.error ?? "Login failed");
                  return;
                }
                toast.success("Welcome back");
                navigate({ to: "/dashboard" });
              }}
            />
            <div className="surface-card mt-4 space-y-3 p-4">
              <p className="text-sm font-semibold">Just exploring?</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    loginDemo();
                    navigate({ to: "/dashboard" });
                  }}
                >
                  Open demo contractor
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    loginAsAdmin();
                    navigate({ to: "/admin" });
                  }}
                >
                  <Shield className="size-4" /> Admin console
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Demo login: dave@summitroofing.com / demo1234
              </p>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm
              onSubmit={(values) => {
                const res = signup({ ...values });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Account created — your territory is live");
                navigate({ to: "/dashboard" });
              }}
            />
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Homeowner instead?{" "}
          <Link to="/estimate" className="font-semibold text-accent-foreground underline">
            Request an Estimate
          </Link>
        </p>
      </main>
    </div>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("dave@summitroofing.com");
  const [password, setPassword] = useState("demo1234");

  return (
    <form
      className="surface-card mt-4 space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
        Log in
      </Button>
    </form>
  );
}

type SignupValues = z.infer<typeof signupSchema>;

function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<ServiceType[]>([]);
  const [zips, setZips] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="surface-card mt-4 space-y-4 p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = signupSchema.safeParse({
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
        onSubmit(parsed.data);
      }}
    >
      {(
        [
          ["companyName", "Company name", "Summit Roofing & Exteriors", "text"],
          ["contactName", "Your name", "Dave Alvarez", "text"],
          ["email", "Work email", "you@company.com", "email"],
          ["phone", "Phone", "(614) 555-0142", "tel"],
          ["city", "City / base of operations", "Columbus, OH", "text"],
          ["password", "Password", "At least 8 characters", "password"],
        ] as const
      ).map(([key, label, placeholder, type]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`su-${key}`}>{label}</Label>
          <Input
            id={`su-${key}`}
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
          />
          {errors[key] ? <p className="text-xs font-medium text-destructive">{errors[key]}</p> : null}
        </div>
      ))}

      <div className="space-y-2">
        <Label>Services you sell</Label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TYPES.map((s) => {
            const active = services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setServices((cur) => (active ? cur.filter((c) => c !== s) : [...cur, s]))
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
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
          <p className="text-xs font-medium text-destructive">{errors.serviceTypes}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-zips">Territory ZIP codes</Label>
        <Input
          id="su-zips"
          placeholder="43017, 43016, 43026"
          value={zips}
          onChange={(e) => setZips(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Comma separated. You only get leads here.</p>
        {errors.territoryZips ? (
          <p className="text-xs font-medium text-destructive">{errors.territoryZips}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
        Get Qualified Leads
      </Button>
    </form>
  );
}
