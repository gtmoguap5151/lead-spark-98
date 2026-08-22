import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-muted-foreground">{label}</p>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-accent-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold leading-none">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
